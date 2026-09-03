import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema(
  {
    name: { type: String, default: 'Admin', trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['owner', 'admin'], default: 'admin' },
    lastLoginAt: Date,
    failedAttempts: { type: Number, default: 0 },
    lockedUntil: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
