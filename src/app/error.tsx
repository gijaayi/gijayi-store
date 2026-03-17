'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-20 bg-[#fcfbf8]">
      <div className="max-w-xl text-center">
        <p className="text-xs tracking-[0.35em] uppercase text-[#b8963e] mb-4">Something Went Wrong</p>
        <h1 className="font-serif text-5xl mb-5">We hit an unexpected issue</h1>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          Please try the page again. If the issue persists, contact our support team and mention this error.
        </p>
        {error.message && <p className="text-xs text-gray-400 mb-8">{error.message}</p>}
        <button onClick={reset} className="bg-[#1a1a1a] text-white px-8 py-4 text-xs tracking-widest uppercase hover:bg-[#b8963e] transition-colors">
          Try Again
        </button>
      </div>
    </div>
  );
}