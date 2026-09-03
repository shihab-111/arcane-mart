import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'site', unique: true },
    siteName: { type: String, default: 'Arcane Mart' },
    logo: { type: String, default: '' },
    phone: { type: String, default: '01XXXXXXXXX' },
    email: { type: String, default: 'hello@arcanemart.com' },
    address: { type: String, default: 'Dhaka, Bangladesh' },
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    announcement: { type: String, default: 'Fast delivery all over Bangladesh — cash on delivery' },
    freeShippingAbove: { type: Number, default: 1500 },
    shippingInsideDhaka: { type: Number, default: 60 },
    shippingOutsideDhaka: { type: Number, default: 120 },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
