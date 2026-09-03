import Header from './Header';
import Footer from './Footer';
import { getCategories, getSettings } from '@/lib/data';

/** Server shell: loads categories + settings once and wraps a page. */
export default async function Shell({ children }) {
  const [categories, settings] = await Promise.all([getCategories(), getSettings()]);
  return (
    <>
      <Header categories={categories} settings={settings} />
      <main className="min-h-[50vh]">{children}</main>
      <Footer settings={settings} categories={categories} />
    </>
  );
}
