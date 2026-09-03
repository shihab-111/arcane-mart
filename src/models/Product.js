import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, default: null, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    sold: { type: Number, default: 0, min: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    images: [{ type: String }],
    featured: { type: Boolean, default: false, index: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', description: 'text' });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
