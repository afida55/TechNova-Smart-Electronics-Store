import { Star, ChevronRight } from "lucide-react";

// Pill - reusable badge with premium color variants
export function Pill({ children, tone = "muted" }) {
  const map = {
    electric:
      "bg-[#2D3E8C]/10 text-[#2D3E8C] border border-[#2D3E8C]/20",

    signal:
      "bg-red-50 text-red-600 border border-red-200",

    success:
      "bg-emerald-50 text-emerald-700 border border-emerald-200",

    gold:
      "bg-[#C9A96E]/10 text-[#C9A96E] border border-[#C9A96E]/20",

    muted:
      "bg-slate-100 text-slate-600 border border-slate-200",
  };

  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full ${map[tone]}`}
    >
      {children}
    </span>
  );
}

// StockTag - displays the current stock status
export function StockTag({ stock }) {
  if (stock === 0) {
    return (
      <Pill tone="signal">
        OUT OF STOCK
      </Pill>
    );
  }

  if (stock <= 6) {
    return (
      <Pill tone="signal">
        LOW · {stock} LEFT
      </Pill>
    );
  }

  return (
    <Pill tone="success">
      IN STOCK · {stock}
    </Pill>
  );
}

// Stars - rating display with half-star support
export function Stars({ value = 0, size = 12 }) {
  const safeValue = Math.max(
    0,
    Math.min(5, Number(value) || 0)
  );

  const full = Math.floor(safeValue);
  const half =
    safeValue - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${safeValue} out of 5 stars`}
    >
      {[...Array(full)].map((_, i) => (
        <Star
          key={`full-${i}`}
          size={size}
          className="fill-[#C9A96E] text-[#C9A96E]"
        />
      ))}

      {half === 1 && (
        <Star
          size={size}
          className="fill-[#C9A96E] text-[#C9A96E]"
        />
      )}

      {[...Array(empty)].map((_, i) => (
        <Star
          key={`empty-${i}`}
          size={size}
          className="text-slate-300"
        />
      ))}
    </div>
  );
}

// Breadcrumb - navigation trail
export function Breadcrumb({ items = [] }) {
  return (
    <div className="flex items-center gap-1 text-sm text-slate-500 flex-wrap mb-4">
      {items.map((item, index) => (
        <span
          key={`${item.label}-${index}`}
          className="flex items-center gap-1"
        >
          {index > 0 && (
            <ChevronRight
              size={12}
              className="text-slate-300"
            />
          )}

          {item.onClick ? (
            <button
              type="button"
              onClick={item.onClick}
              className={`hover:text-[#2D3E8C] transition ${
                index === items.length - 1
                  ? "font-semibold text-[#1A1A2E]"
                  : ""
              }`}
            >
              {item.label}
            </button>
          ) : (
            <span
              className={
                index === items.length - 1
                  ? "font-semibold text-[#1A1A2E]"
                  : ""
              }
            >
              {item.label}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

// ProductArt - simple product visual used in comparison UI
export function ProductArt({ tint = "#2D3E8C", size = 40 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        background: tint,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      <div
        style={{
          width: size * 0.42,
          height: size * 0.58,
          borderRadius: 5,
          background: "#fff",
          opacity: 0.9,
        }}
      />
    </div>
  );
}