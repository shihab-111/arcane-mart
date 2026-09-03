// Server-side data helpers. These read MongoDB directly (no HTTP round-trip),
// so pages render fast and work during build.
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Banner from '@/models/Banner';
import Settings from '@/models/Settings';
import { escapeRegex } from '@/lib/utils';

const plain = (v) => JSON.parse(JSON.stringify(v));

export async function getSettings() {
  await dbConnect();
  const s = (await Settings.findOne({ key: 'site' }).lean()) || (await Settings.create({ key: 'site' })).toObject();
  return plain(s);
}

export async function getCategories() {
  await dbConnect();
  const cats = await Category.find({ active: true }).sort({ order: 1, name: 1 }).lean();
  const counts = await Product.aggregate([{ $match: { active: true } }, { $group: { _id: '$category', n: { $sum: 1 } } }]);
  const map = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));
  return plain(cats.map((c) => ({ ...c, productCount: map[String(c._id)] || 0 })));
}

export async function getBanners() {
  await dbConnect();
  return plain(await Banner.find({ active: true }).sort({ order: 1, createdAt: -1 }).lean());
}

export async function getProducts({ category, q, featured, sort = 'new', page = 1, limit = 24 } = {}) {
  await dbConnect();
  const filter = { active: true };
  if (category) {
    const cat = await Category.findOne({ slug: category }).lean();
    if (!cat) return { items: [], total: 0, pages: 0, page };
    filter.category = cat._id;
  }
  if (featured) filter.featured = true;
  if (q) filter.name = { $regex: escapeRegex(String(q).slice(0, 60)), $options: 'i' };

  const sorts = { new: { createdAt: -1 }, price_asc: { price: 1 }, price_desc: { price: -1 }, popular: { sold: -1 } };
  const [items, total] = await Promise.all([
    Product.find(filter).populate('category', 'name slug').sort(sorts[sort] || sorts.new)
      .skip((page - 1) * limit).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);
  return { items: plain(items), total, page, pages: Math.ceil(total / limit) };
}

export async function getProduct(slug) {
  await dbConnect();
  const p = await Product.findOne({ slug, active: true }).populate('category', 'name slug').lean();
  return p ? plain(p) : null;
}

export async function getRelated(product, limit = 4) {
  await dbConnect();
  const items = await Product.find({ active: true, category: product.category?._id, _id: { $ne: product._id } })
    .populate('category', 'name slug').limit(limit).lean();
  return plain(items);
}
