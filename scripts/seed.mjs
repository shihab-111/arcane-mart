// Seeds starter categories, sample products and store settings. Run: npm run seed
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

await mongoose.connect(process.env.MONGODB_URI);
const { Schema } = mongoose;

const Category = mongoose.model('Category', new Schema({
  name: String, slug: { type: String, unique: true }, emoji: String, image: String,
  order: Number, active: Boolean }, { timestamps: true }));
const Product = mongoose.model('Product', new Schema({
  name: String, slug: { type: String, unique: true }, description: String, price: Number,
  comparePrice: Number, stock: Number, sold: Number,
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  images: [String], featured: Boolean, active: Boolean }, { timestamps: true }));
const Settings = mongoose.model('Settings', new Schema({ key: { type: String, unique: true } }, { strict: false, timestamps: true }));
const Admin = mongoose.model('Admin', new Schema({ email: { type: String, unique: true } }, { strict: false, timestamps: true }));

const cats = [
  { name: 'Spices & grocery', emoji: '🌶️', order: 1 },
  { name: 'Anime figures', emoji: '🗿', order: 2 },
  { name: 'Showpieces & décor', emoji: '🏺', order: 3 },
  { name: 'Home & kitchen', emoji: '🍳', order: 4 },
  { name: 'Beauty & care', emoji: '🧴', order: 5 },
  { name: 'Tech accessories', emoji: '🎧', order: 6 },
  { name: 'Baby & kids', emoji: '🧸', order: 7 },
];

for (const c of cats) {
  await Category.findOneAndUpdate({ slug: slugify(c.name) }, { ...c, slug: slugify(c.name), active: true }, { upsert: true });
}
const byName = Object.fromEntries((await Category.find().lean()).map((c) => [c.name, c._id]));

const products = [
  { name: 'Kashmiri red chilli powder — 200g', price: 320, comparePrice: 380, stock: 40, cat: 'Spices & grocery', featured: true },
  { name: 'Whole cardamom, first grade — 50g', price: 420, stock: 25, cat: 'Spices & grocery' },
  { name: 'Garam masala house blend — 100g', price: 260, comparePrice: 300, stock: 30, cat: 'Spices & grocery' },
  { name: 'Anime action figure — 18cm PVC', price: 1250, stock: 12, cat: 'Anime figures', featured: true },
  { name: 'Terracotta vase, hand-finished', price: 880, stock: 8, cat: 'Showpieces & décor' },
  { name: 'Kitchen soap dispenser with sponge holder', price: 120, comparePrice: 150, stock: 60, cat: 'Home & kitchen' },
  { name: 'Cold-pressed hair oil — 100ml', price: 340, stock: 35, cat: 'Beauty & care' },
  { name: 'Wireless earbuds with charging case', price: 1190, comparePrice: 1390, stock: 20, cat: 'Tech accessories', featured: true },
  { name: 'Soft plush rabbit doll', price: 450, stock: 18, cat: 'Baby & kids' },
];

for (const p of products) {
  await Product.findOneAndUpdate(
    { slug: slugify(p.name) },
    {
      name: p.name, slug: slugify(p.name), price: p.price, comparePrice: p.comparePrice || null,
      stock: p.stock, sold: 0, category: byName[p.cat], images: [], featured: !!p.featured, active: true,
      description: 'Replace this description from the admin panel, and upload real photos.',
    },
    { upsert: true }
  );
}

await Settings.findOneAndUpdate({ key: 'site' }, {
  key: 'site', siteName: 'Arcane Mart', phone: '01XXXXXXXXX', email: 'hello@arcanemart.com',
  address: 'Dhaka, Bangladesh', announcement: 'Fast delivery all over Bangladesh — cash on delivery',
  freeShippingAbove: 1500, shippingInsideDhaka: 60, shippingOutsideDhaka: 120,
}, { upsert: true });

if (process.env.ADMIN_EMAIL && (process.env.ADMIN_PASSWORD || '').length >= 8) {
  await Admin.findOneAndUpdate({ email: process.env.ADMIN_EMAIL.toLowerCase() }, {
    email: process.env.ADMIN_EMAIL.toLowerCase(), name: 'Owner', role: 'owner',
    passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12), failedAttempts: 0,
  }, { upsert: true });
  console.log('Admin account ready:', process.env.ADMIN_EMAIL);
}

console.log(`Seeded ${cats.length} categories and ${products.length} products.`);
await mongoose.disconnect();
