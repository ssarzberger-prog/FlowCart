import { useState, useEffect, useCallback } from "react";

export function EmailPopup() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  // Show after 10 seconds, or on exit intent
  useEffect(() => {
    if (dismissed) return;

    // Check if already subscribed in this session
    const alreadySubscribed = sessionStorage.getItem("fc_subscribed");
    if (alreadySubscribed) return;

    // 10-second timer
    const timer = setTimeout(() => {
      setVisible(true);
    }, 10000);

    // Exit intent detection
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setVisible(true);
      }
    };
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [dismissed]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || status === "loading") return;

      setStatus("loading");
      try {
        const res = await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), source: "popup" }),
        });
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Welcome! Use code WELCOME10 for 10% off.");
          sessionStorage.setItem("fc_subscribed", "true");
          // Auto-dismiss after 3 seconds
          setTimeout(() => setVisible(false), 4000);
        } else {
          setStatus("error");
          setMessage(data.error || "Something went wrong.");
        }
      } catch {
        setStatus("error");
        setMessage("Network error. Please try again.");
      }
    },
    [email, status],
  );

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in">
        {/* Close button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {status === "success" ? (
          /* Success State */
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mt-4 text-xl font-bold text-gray-900">You're in! 🎉</h3>
            <p className="mt-2 text-sm text-gray-600">{message}</p>
            <div className="mt-4 rounded-xl bg-indigo-50 px-4 py-3">
              <span className="text-sm font-semibold text-indigo-700">
                Your Code:
              </span>{" "}
              <span className="text-lg font-bold tracking-wider text-indigo-900">
                WELCOME10
              </span>
            </div>
          </div>
        ) : (
          /* Form State */
          <>
            <div className="text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-2xl">
                🎁
              </span>
              <h3 className="mt-3 text-xl font-bold text-gray-900">
                Get 10% Off Your First Order
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Join the FlowCart newsletter and we'll send you a 10% discount
                code instantly.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6">
              <div className="flex flex-col gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 disabled:opacity-60"
                >
                  {status === "loading" ? "Sending..." : "Claim My 10% Off"}
                </button>
              </div>

              {status === "error" && (
                <p className="mt-3 text-center text-sm text-red-500">
                  {message}
                </p>
              )}

              <p className="mt-3 text-center text-xs text-gray-400">
                No spam, ever. Unsubscribe anytime.
              </p>
            </form>
          </>
        )}

        {/* Dismiss link */}
        {status !== "success" && (
          <button
            type="button"
            onClick={handleDismiss}
            className="mt-4 block w-full text-center text-xs text-gray-400 hover:text-gray-500"
          >
            No thanks, I'll pay full price
          </button>
        )}
      </div>
    </div>
  );
}
