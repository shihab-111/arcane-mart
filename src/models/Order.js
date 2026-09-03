import mongoose from 'mongoose';
import { ORDER_STATUS } from '@/lib/utils';

const OrderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,        // snapshot: name/price at purchase time
    image: String,
    price: Number,
    qty: { type: Number, min: 1 },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    orderNo: { type: String, unique: true, index: true },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true, index: true },
      email: String,
      address: { type: String, required: true },
      city: { type: String, required: true },
      note: String,
    },
    items: [OrderItemSchema],
    subtotal: Number,
    shipping: Number,
    total: Number,
    paymentMethod: { type: String, enum: ['cod', 'bkash', 'nagad'], default: 'cod' },
    paymentRef: { type: String, default: '' },
    status: { type: String, enum: ORDER_STATUS, default: 'pending', index: true },
    history: [{ status: String, at: { type: Date, default: Date.now }, by: String }],
  },
  { timestamps: true }
);

OrderSchema.pre('validate', function (next) {
  if (!this.orderNo) {
    const d = new Date();
    const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    this.orderNo = `AM-${stamp}-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  next();
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
