import { useState } from "react";
import { ChevronDown, ChevronRight, X, SlidersHorizontal } from "lucide-react";

export const SORT_OPTIONS = [
  { key: "relevance", label: "Relevance" },
  { key: "price_asc", label: "Price: Low to High" },
  { key: "price_desc", label: "Price: High to Low" },
  { key: "rating", label: "Highest Rated" },
  { key: "newest", label: "Newest" },
];

export default function FilterSidebar({ filters, setFilters, categories }) {
  const { cat, sub, priceMax, inStockOnly } = filters;
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    stock: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const setCat = (c, s) => setFilters((f) => ({ ...f, cat: c, sub: s }));

  const clearFilters = () => {
    setFilters({
      cat: "All",
      sub: null,
      priceMax: 1800,
      inStockOnly: false,
      keyword: "",
    });
  };

  const hasActiveFilters = cat !== "All" || sub !== null || priceMax < 1800 || inStockOnly;

  return (
    <aside className="w-56 flex-shrink-0 hidden md:block">
      <div className="sticky top-20 bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-slate-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Filters</h3>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition"
            >
              <X size={12} /> Clear all
            </button>
          )}
        </div>

        {/* Category Section */}
        <div>
          <button
            onClick={() => toggleSection("category")}
            className="flex items-center justify-between w-full text-left text-sm font-semibold text-slate-700 py-1 hover:text-blue-600 transition group"
          >
            <span>Category</span>
            <span className="text-slate-400 group-hover:text-blue-600 transition">
              {expandedSections.category ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          </button>
          {expandedSections.category && (
            <div className="mt-2 space-y-0.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
              <button
                onClick={() => setCat("All", null)}
                className={`block w-full text-left py-1.5 px-2 rounded-lg text-sm transition ${
                  cat === "All" && !sub
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                All products
              </button>
              {categories.map((c) => (
                <div key={c.id} className="mt-1">
                  <button
                    onClick={() => setCat(c.name, null)}
                    className={`block w-full text-left py-1.5 px-2 rounded-lg text-sm transition ${
                      cat === c.name && !sub
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {c.name}
                  </button>
                  {cat === c.name && c.children?.length > 0 && (
                    <div className="ml-4 mt-0.5 space-y-0.5 border-l-2 border-slate-200 pl-2">
                      {c.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => setCat(c.name, child.name)}
                          className={`block w-full text-left py-1.5 px-2 rounded-lg text-sm transition ${
                            sub === child.name
                              ? "bg-blue-50 text-blue-700 font-semibold"
                              : "text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          {child.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price Section */}
        <div className="border-t border-slate-200 pt-3">
          <button
            onClick={() => toggleSection("price")}
            className="flex items-center justify-between w-full text-left text-sm font-semibold text-slate-700 py-1 hover:text-blue-600 transition group"
          >
            <span>Price</span>
            <span className="text-slate-400 group-hover:text-blue-600 transition">
              {expandedSections.price ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          </button>
          {expandedSections.price && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">$0</span>
                <span className="font-medium text-slate-900">${priceMax}</span>
              </div>
              <input
                type="range"
                min={30}
                max={1800}
                step={10}
                value={priceMax}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, priceMax: Number(e.target.value) }))
                }
                className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer"
              />
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-400">Max</span>
                <input
                  type="number"
                  value={priceMax}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      priceMax: Math.min(1800, Math.max(30, Number(e.target.value) || 30)),
                    }))
                  }
                  className="w-20 px-2 py-0.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>
          )}
        </div>

        {/* Stock Section */}
        <div className="border-t border-slate-200 pt-3">
          <button
            onClick={() => toggleSection("stock")}
            className="flex items-center justify-between w-full text-left text-sm font-semibold text-slate-700 py-1 hover:text-blue-600 transition group"
          >
            <span>Availability</span>
            <span className="text-slate-400 group-hover:text-blue-600 transition">
              {expandedSections.stock ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          </button>
          {expandedSections.stock && (
            <label className="flex items-center gap-2 mt-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, inStockOnly: e.target.checked }))
                }
                className="accent-blue-600 w-4 h-4 rounded border-slate-300 focus:ring-2 focus:ring-blue-500/50"
              />
              In stock only
            </label>
          )}
        </div>
      </div>
    </aside>
  );
}