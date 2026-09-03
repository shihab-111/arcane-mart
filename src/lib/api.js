import { NextResponse } from 'next/server';

export const ok = (data, init = {}) => NextResponse.json({ ok: true, data }, init);
export const fail = (message, status = 400, extra = {}) =>
  NextResponse.json({ ok: false, error: message, ...extra }, { status });

/** Wraps a handler so thrown errors never leak stack traces to the client. */
export function handler(fn) {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx);
    } catch (err) {
      if (err?.status === 401) return fail('Unauthorized', 401);
      if (err?.name === 'ZodError') return fail('Invalid input', 422, { issues: err.issues });
      if (err?.code === 11000) return fail('That value already exists', 409);
      console.error('[api]', err);
      return fail('Something went wrong. Please try again.', 500);
    }
  };
}
