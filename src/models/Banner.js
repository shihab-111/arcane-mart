import mongoose from 'mongoose';

const BannerSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    image: { type: String, required: true },
    link: { type: String, default: '/products' },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Banner || mongoose.model('Banner', BannerSchema);
