import AMap from "../components/AMap";

export default function StoreLocation({ setPage }) {
  return (
    <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">

      <div className="p-6 sm:p-8">

        {/* ==========================================
            HEADER
        =========================================== */}

        <div className="flex items-start justify-between gap-4 mb-6">

          <div>
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
              Visit TechNova
            </p>

            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
              Find Our Store
            </h2>

            <p className="mt-2 text-slate-600 max-w-2xl">
              Visit our TechNova electronics store in Chengdu.
              Explore our latest smartphones, laptops, audio
              devices, wearables and accessories.
            </p>
          </div>

          {/* ==========================================
              BACK TO DASHBOARD
          =========================================== */}

          <button
            type="button"
            onClick={() => {
              setPage?.("home");
            }}
            className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          >
            <span className="text-lg leading-none">
              ←
            </span>

            <span className="hidden sm:inline">
              Back to Dashboard
            </span>

            <span className="sm:hidden">
              Back
            </span>
          </button>

        </div>

        {/* ==========================================
            MAP + STORE INFORMATION
        =========================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ==========================================
              AMAP
          =========================================== */}

          <div className="lg:col-span-2">
            <AMap />
          </div>

          {/* ==========================================
              STORE INFORMATION
          =========================================== */}

          <div className="flex flex-col justify-center rounded-2xl bg-slate-50 border border-slate-200 p-6">

            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl mb-5">
              📍
            </div>

            <h3 className="text-xl font-bold text-slate-900">
              TechNova Electronics Store
            </h3>

            <p className="mt-3 text-slate-600 leading-relaxed">
              Chengdu, Sichuan, China
            </p>

            {/* ==========================================
                STORE HOURS
            =========================================== */}

            <div className="mt-6 space-y-4 text-sm">

              <div>
                <p className="font-semibold text-slate-900">
                  Store Hours
                </p>

                <p className="text-slate-600 mt-1">
                  Monday - Sunday: 9:00 AM - 8:00 PM
                </p>
              </div>

              {/* ==========================================
                  CUSTOMER SUPPORT
              =========================================== */}

              <div>
                <p className="font-semibold text-slate-900">
                  Customer Support
                </p>

                <p className="text-slate-600 mt-1">
                  Available during store hours
                </p>
              </div>

            </div>

            {/* ==========================================
                OPEN IN AMAP
            =========================================== */}

            <button
              type="button"
              onClick={() => {
                window.open(
                  "https://uri.amap.com/marker?position=104.0668,30.5728&name=TechNova%20Electronics%20Store",
                  "_blank",
                  "noopener,noreferrer"
                );
              }}
              className="mt-7 w-full px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              Open in AMap
            </button>

          </div>

        </div>

      </div>

    </section>
  );
}