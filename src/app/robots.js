export default function robots() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://arcanemart.com';
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api'] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
