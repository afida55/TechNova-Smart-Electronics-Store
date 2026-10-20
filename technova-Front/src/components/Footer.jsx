import {
  ShoppingBag,
  Heart,
  Package,
  User,
  LogIn,
  ShieldCheck,
  ArrowUp,
  ChevronRight,
  Headphones,
} from "lucide-react";

export default function Footer({ setPage }) {
  const go = (page) => {
    if (typeof setPage === "function") {
      setPage(page);
    }

    window.scrollTo?.({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  const openAIChat = () => {
    go("ai-chat");
  };

  return (
    <footer className="w-full bg-[#1A1A2E] text-slate-300 border-t border-slate-700/50 mt-16">
      <div className="w-full max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 xl:px-12">

        {/* =====================================================
            MAIN FOOTER
        ====================================================== */}

        <div className="py-10 sm:py-12 lg:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] gap-x-10 gap-y-10 lg:gap-x-14">

            {/* =================================================
                BRAND
            ================================================== */}

            <div className="min-w-0">
              <button
                type="button"
                onClick={() => go("home")}
                className="group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center group-hover:bg-white/15 transition">
                    <ShoppingBag
                      size={19}
                      className="text-white"
                    />
                  </div>

                  <div>
                    <div className="text-xl font-bold text-white tracking-tight">
                      TechNova
                    </div>

                    <div className="text-[9px] text-slate-500 uppercase tracking-[0.18em] font-semibold mt-0.5">
                      Smart electronics
                    </div>
                  </div>
                </div>
              </button>

              <p className="text-sm text-slate-400 mt-5 max-w-[390px] leading-6">
                Smart electronics for everyday work,
                entertainment, and life. Discover useful
                technology, save your favorites, and shop
                with confidence.
              </p>

              {/* TRUST BADGES */}

              <div className="flex flex-wrap items-center gap-2.5 mt-6">

                {/* Secure shopping */}

                <div className="inline-flex items-center gap-2 rounded-lg bg-white/5 border border-white/5 px-3 py-2">
                  <ShieldCheck
                    size={14}
                    className="text-emerald-400"
                  />

                  <span className="text-[10px] font-semibold text-slate-400">
                    Secure shopping
                  </span>
                </div>

                {/* Customer support → AI CHAT */}

                <button
                  type="button"
                  onClick={openAIChat}
                  className="inline-flex items-center gap-2 rounded-lg bg-white/5 border border-white/5 px-3 py-2 text-left hover:bg-white/10 hover:border-white/10 transition cursor-pointer"
                >
                  <Headphones
                    size={14}
                    className="text-blue-300"
                  />

                  <span className="text-[10px] font-semibold text-slate-400 hover:text-white">
                    Customer support
                  </span>
                </button>
              </div>
            </div>

            {/* =================================================
                SHOP
            ================================================== */}

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                Shop
              </h4>

              <ul className="space-y-3">
                {/* All products */}

                <li>
                  <button
                    type="button"
                    onClick={() => go("home")}
                    className="group flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
                  >
                    <ShoppingBag size={14} />

                    <span>All products</span>

                    <ChevronRight
                      size={13}
                      className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition"
                    />
                  </button>
                </li>

                {/* Featured products */}

                <li>
                  <button
                    type="button"
                    onClick={() => go("home")}
                    className="group flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
                  >
                    <Package size={14} />

                    <span>Featured products</span>

                    <ChevronRight
                      size={13}
                      className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition"
                    />
                  </button>
                </li>

                {/* Saved items */}

                <li>
                  <button
                    type="button"
                    onClick={() => go("wishlist")}
                    className="group flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
                  >
                    <Heart size={14} />

                    <span>Saved items</span>

                    <ChevronRight
                      size={13}
                      className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition"
                    />
                  </button>
                </li>
              </ul>
            </div>

            {/* =================================================
                CUSTOMER SERVICE
            ================================================== */}

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                Customer service
              </h4>

              <ul className="space-y-3">
                {/* Order history */}

                <li>
                  <button
                    type="button"
                    onClick={() => go("orders")}
                    className="group flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
                  >
                    <Package size={14} />

                    <span>Order history</span>

                    <ChevronRight
                      size={13}
                      className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition"
                    />
                  </button>
                </li>

                {/* Shopping cart */}

                <li>
                  <button
                    type="button"
                    onClick={() => go("cart")}
                    className="group flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
                  >
                    <ShoppingBag size={14} />

                    <span>Shopping cart</span>

                    <ChevronRight
                      size={13}
                      className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition"
                    />
                  </button>
                </li>

                {/* Returns & support → AI CHAT */}

                <li>
                  <button
                    type="button"
                    onClick={openAIChat}
                    className="group flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
                  >
                    <Headphones size={14} />

                    <span>Returns &amp; support</span>

                    <ChevronRight
                      size={13}
                      className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition"
                    />
                  </button>
                </li>
              </ul>
            </div>

            {/* =================================================
                ACCOUNT
            ================================================== */}

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                Account
              </h4>

              <ul className="space-y-3">
                {/* Profile */}

                <li>
                  <button
                    type="button"
                    onClick={() => go("profile")}
                    className="group flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
                  >
                    <User size={14} />

                    <span>Your profile</span>

                    <ChevronRight
                      size={13}
                      className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition"
                    />
                  </button>
                </li>

                {/* Sign in */}

                <li>
                  <button
                    type="button"
                    onClick={() => go("auth")}
                    className="group flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
                  >
                    <LogIn size={14} />

                    <span>Sign in</span>

                    <ChevronRight
                      size={13}
                      className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition"
                    />
                  </button>
                </li>

                {/* Privacy */}

                <li>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <ShieldCheck size={14} />

                    <span>Privacy</span>
                  </div>
                </li>

                {/* Terms */}

                <li>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <ShieldCheck size={14} />

                    <span>Terms of use</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* =====================================================
            BOTTOM BAR
        ====================================================== */}

        <div className="border-t border-slate-700/50 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

            {/* Copyright */}

            <div className="text-[10px] text-slate-500 text-center sm:text-left">
              © {new Date().getFullYear()} TechNova.
              All rights reserved.
            </div>

            {/* Bottom trust information */}

            <div className="flex items-center gap-4 sm:gap-5">

              <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <ShieldCheck size={12} />
                Secure shopping
              </span>

              <span className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-500">
                <Package size={12} />
                Easy order tracking
              </span>

              {/* Back to top */}

              <button
                type="button"
                onClick={() =>
                  window.scrollTo?.({
                    top: 0,
                    left: 0,
                    behavior: "smooth",
                  })
                }
                className="w-8 h-8 rounded-lg border border-slate-700 bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 hover:bg-white/10 transition"
                aria-label="Back to top"
                title="Back to top"
              >
                <ArrowUp size={14} />
              </button>
            </div>
          </div>

          {/* Demo notice */}

          <div className="text-[9px] text-slate-600 text-center mt-4">
            TechNova is a demonstration e-commerce project.
          </div>
        </div>
      </div>
    </footer>
  );
}