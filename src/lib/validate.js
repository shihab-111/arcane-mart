import { z } from 'zod';

/** 01712345678, +8801712345678, 01712-345678 all normalise to 01712345678. */
export const normalizePhone = (raw) => {
  const digits = String(raw || '').replace(/\D/g, '');
  const local = digits.startsWith('880') ? digits.slice(3) : digits;
  return local.startsWith('0') ? local : '0' + local;
};

const phone = z
  .string()
  .transform(normalizePhone)
  .refine((v) => /^01[3-9]\d{8}$/.test(v), 'Enter a valid Bangladeshi mobile number');

/** Accepts an absolute URL or a site-relative path like /uploads/x.jpg. */
const imageUrl = z
  .string()
  .max(500)
  .refine((v) => /^https?:\/\//.test(v) || v.startsWith('/'), 'Must be a URL or an uploaded file path');

export const loginSchema = z.object({
  email: z.string().email().max(120),
  password: z.string().min(8).max(200),
});

/**
 * Base shapes carry no defaults, so `.partial()` produces a true patch:
 * a field the client omits is left untouched instead of being reset.
 * The create schemas add the defaults back.
 */
const categoryBase = {
  name: z.string().min(2).max(60),
  slug: z.string().max(90),
  emoji: z.string().max(8),
  image: imageUrl.or(z.literal('')),
  order: z.coerce.number().int().min(0).max(999),
  active: z.coerce.boolean(),
};
export const categorySchema = z.object(categoryBase).partial({ slug: true }).extend({
  emoji: categoryBase.emoji.optional().default(''),
  image: categoryBase.image.optional().default(''),
  order: categoryBase.order.optional().default(0),
  active: categoryBase.active.optional().default(true),
});
export const categoryUpdateSchema = z.object(categoryBase).partial();

const productBase = {
  name: z.string().min(2).max(160),
  slug: z.string().max(180),
  description: z.string().max(5000),
  price: z.coerce.number().min(0).max(10000000),
  comparePrice: z.coerce.number().min(0).max(10000000).nullable(),
  stock: z.coerce.number().int().min(0).max(1000000),
  category: z.string().regex(/^[a-f\d]{24}$/i, 'Choose a category'),
  images: z.array(imageUrl).max(8),
  featured: z.coerce.boolean(),
  active: z.coerce.boolean(),
};
export const productSchema = z
  .object(productBase)
  .partial({ slug: true, comparePrice: true })
  .extend({
    description: productBase.description.optional().default(''),
    stock: productBase.stock.optional().default(0),
    images: productBase.images.optional().default([]),
    featured: productBase.featured.optional().default(false),
    active: productBase.active.optional().default(true),
  });
export const productUpdateSchema = z.object(productBase).partial();

const bannerBase = {
  title: z.string().max(120),
  subtitle: z.string().max(240),
  image: imageUrl,
  link: z.string().max(300),
  order: z.coerce.number().int().min(0).max(99),
  active: z.coerce.boolean(),
};
export const bannerSchema = z.object(bannerBase).extend({
  title: bannerBase.title.optional().default(''),
  subtitle: bannerBase.subtitle.optional().default(''),
  link: bannerBase.link.optional().default('/products'),
  order: bannerBase.order.optional().default(0),
  active: bannerBase.active.optional().default(true),
});
export const bannerUpdateSchema = z.object(bannerBase).partial();

export const orderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2).max(80),
    phone,
    email: z.string().email().max(120).or(z.literal('')).optional(),
    address: z.string().trim().min(8).max(400),
    city: z.string().trim().min(2).max(60),
    note: z.string().max(500).optional().default(''),
  }),
  items: z
    .array(z.object({ product: z.string().regex(/^[a-f\d]{24}$/i), qty: z.coerce.number().int().min(1).max(99) }))
    .min(1)
    .max(50),
  paymentMethod: z.enum(['cod', 'bkash', 'nagad']).default('cod'),
  paymentRef: z.string().max(60).optional().default(''),
});

export const trackSchema = z.object({
  orderNo: z.string().trim().min(4).max(40),
  phone,
});

export const settingsSchema = z.object({
  siteName: z.string().max(60).optional(),
  logo: imageUrl.or(z.literal('')).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().max(120).optional(),
  address: z.string().max(200).optional(),
  facebook: z.string().max(200).optional(),
  instagram: z.string().max(200).optional(),
  whatsapp: z.string().max(200).optional(),
  freeShippingAbove: z.coerce.number().min(0).optional(),
  shippingInsideDhaka: z.coerce.number().min(0).optional(),
  shippingOutsideDhaka: z.coerce.number().min(0).optional(),
  announcement: z.string().max(200).optional(),
});
