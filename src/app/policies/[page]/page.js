import Shell from '@/components/Shell';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

const PAGES = {
  shipping: {
    title: 'Shipping policy',
    body: `Inside Dhaka: 1–2 working days. Outside Dhaka: 2–4 working days.
Delivery charge is ৳60 inside Dhaka and ৳120 outside Dhaka. Orders above ৳1,500 ship free.
We call every customer to confirm the order before dispatch. If we cannot reach you within 48 hours the order may be cancelled.`,
  },
  returns: {
    title: 'Refund & return policy',
    body: `You can return an item within 7 days if it arrives damaged, defective or different from what you ordered.
Record an unboxing video where possible — it makes the claim much faster.
Refunds are issued to bKash/Nagad within 5 working days of the returned item reaching us. Delivery charges are non-refundable unless the mistake was ours.`,
  },
  privacy: {
    title: 'Privacy policy',
    body: `We collect only what we need to deliver your order: name, mobile number, address and optional email.
We never sell your data. Details are shared with our delivery partner solely to complete your delivery.
Passwords for staff accounts are stored hashed. To have your data deleted, contact us with your order number.`,
  },
  terms: {
    title: 'Terms & conditions',
    body: `Prices and stock can change without notice. An order is confirmed only after our team calls you.
Product photos are indicative; slight colour variation is possible.
Misuse of the site, fraudulent orders, or abuse of staff may lead to a permanent block.`,
  },
};

export default function PolicyPage({ params }) {
  const page = PAGES[params.page];
  if (!page) notFound();
  return (
    <Shell>
      <article className="wrap py-10 max-w-2xl">
        <h1 className="heading mb-4">{page.title}</h1>
        <p className="whitespace-pre-line leading-relaxed">{page.body}</p>
      </article>
    </Shell>
  );
}
