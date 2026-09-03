// Creates or resets the admin login. Run: npm run create-admin
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const email = (process.env.ADMIN_EMAIL || '').toLowerCase();
const password = process.env.ADMIN_PASSWORD || '';
if (!email || password.length < 8) {
  console.error('Set ADMIN_EMAIL and an ADMIN_PASSWORD of 8+ characters in .env first.');
  process.exit(1);
}

const Admin = mongoose.model('Admin', new mongoose.Schema({
  name: String, email: { type: String, unique: true }, passwordHash: String,
  role: String, lastLoginAt: Date, failedAttempts: Number, lockedUntil: Date,
}, { timestamps: true }));

await mongoose.connect(process.env.MONGODB_URI);
const passwordHash = await bcrypt.hash(password, 12);
await Admin.findOneAndUpdate(
  { email },
  { email, passwordHash, role: 'owner', name: 'Owner', failedAttempts: 0 },
  { upsert: true, new: true }
);
console.log(`Admin ready: ${email}`);
await mongoose.disconnect();
