import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeftRight,
  Sparkles,
  X,
  Loader2,
} from "lucide-react";

import { C } from "../lib/tokens";
import { PRODUCTS } from "../lib/data";
import { ProductArt } from "./Primitives";
import { compareProducts } from "../lib/ai";


// ============================================================
// COMPARE TRAY
// ============================================================

export function CompareTray({
  compareIds,
  toggleCompare,
  onOpenCompare,
}) {

  if (compareIds.length === 0) {
    return null;
  }

  const items =
    compareIds
      .map((id) =>
        PRODUCTS.find(
          (p) =>
            String(p.id) === String(id)
        )
      )
      .filter(Boolean);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: C.ink,
        zIndex: 40,
        borderTop:
          "1px solid #2A2E37",
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
        }}
        className="px-4 py-3 flex items-center gap-3"
      >

        <div
          className="flex items-center gap-2"
          style={{
            color: "#fff",
          }}
        >
          <ArrowLeftRight
            size={14}
            color={C.electric}
          />

          <span
            className="f-mono"
            style={{
              fontSize: 11,
            }}
          >
            COMPARE ({items.length}/3)
          </span>
        </div>


        <div
          className="flex gap-2 flex-1 overflow-x-auto"
        >

          {items.map((p) => (

            <div
              key={p.id}
              className="flex items-center gap-2"
              style={{
                background: "#1D2129",
                borderRadius: 8,
                padding: "5px 8px",
              }}
            >

              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background:
                    p.tint || C.electric,
                }}
              />

              <span
                className="f-body"
                style={{
                  fontSize: 12,
                  color: "#fff",
                  whiteSpace:
                    "nowrap",
                }}
              >
                {p.name}
              </span>

              <button
                onClick={() =>
                  toggleCompare(p.id)
                }
                style={{
                  background:
                    "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#8A94A6",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <X size={12} />
              </button>

            </div>

          ))}

        </div>


        <button
          disabled={
            items.length < 2
          }
          onClick={
            onOpenCompare
          }
          className="f-body"
          style={{
            background:
              items.length < 2
                ? "#2A2E37"
                : C.electric,

            color:
              items.length < 2
                ? "#6B7280"
                : "#fff",

            border: "none",
            borderRadius: 8,
            padding:
              "9px 16px",
            fontSize: 12.5,
            fontWeight: 600,

            cursor:
              items.length < 2
                ? "not-allowed"
                : "pointer",

            whiteSpace:
              "nowrap",

            display: "flex",
            gap: 6,
            alignItems:
              "center",
          }}
        >

          <Sparkles size={13} />

          Compare with AI

        </button>

      </div>
    </div>
  );
}


// ============================================================
// COMPARE MODAL
// ============================================================

export function CompareModal({
  compareIds,
  onClose,
}) {

  const [aiReply, setAiReply] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  const items =
    compareIds
      .map((id) =>
        PRODUCTS.find(
          (p) =>
            String(p.id) === String(id)
        )
      )
      .filter(Boolean);


  // ----------------------------------------------------------
  // Load AI comparison
  // ----------------------------------------------------------

  useEffect(() => {

    let cancelled = false;

    async function loadComparison() {

      if (items.length < 2) {
        return;
      }

      setLoading(true);
      setError("");
      setAiReply("");

      try {

        const result =
          await compareProducts(
            items.map(
              (product) =>
                product.id
            )
          );

        if (!cancelled) {

          setAiReply(
            result?.reply || ""
          );
        }

      } catch (err) {

        if (!cancelled) {

          setError(
            err?.message ||
              "Unable to generate the AI comparison."
          );
        }

      } finally {

        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadComparison();

    return () => {
      cancelled = true;
    };

  }, [compareIds]);


  // ----------------------------------------------------------
  // Specs
  // ----------------------------------------------------------

  const allKeys = [
    ...new Set(
      items.flatMap((p) => {

        if (!p.specs) {
          return [];
        }

        if (
          typeof p.specs ===
          "object"
        ) {
          return Object.keys(
            p.specs
          );
        }

        try {

          const parsed =
            JSON.parse(
              p.specs
            );

          return Object.keys(
            parsed
          );

        } catch {

          return [];
        }
      })
    ),
  ];


  function getSpec(
    product,
    key
  ) {

    if (!product.specs) {
      return "—";
    }

    if (
      typeof product.specs ===
      "object"
    ) {

      return (
        product.specs[key] ??
        "—"
      );
    }

    try {

      const parsed =
        JSON.parse(
          product.specs
        );

      return (
        parsed[key] ??
        "—"
      );

    } catch {

      return "—";
    }
  }


  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background:
          "rgba(18,21,27,0.55)",
        zIndex: 50,
        display: "flex",
        alignItems:
          "center",
        justifyContent:
          "center",
      }}
      className="px-4"
    >

      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          width: "100%",
          maxWidth: 820,
          maxHeight: "85vh",
          overflow: "auto",
        }}
      >

        {/* HEADER */}

        <div
          className="flex items-center justify-between px-6 py-4"
          style={{
            borderBottom:
              `1px solid ${C.line}`,
          }}
        >

          <div
            className="flex items-center gap-2"
          >

            <Sparkles
              size={15}
              color={C.electric}
            />

            <span
              className="f-display"
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: C.ink,
              }}
            >
              AI comparison
            </span>

          </div>


          <button
            onClick={onClose}
            style={{
              background:
                "none",
              border: "none",
              cursor:
                "pointer",
            }}
          >
            <X
              size={18}
              color={C.muted}
            />
          </button>

        </div>


        <div className="px-6 py-4">

          {/* PRODUCTS */}

          <div
            className="grid"
            style={{
              gridTemplateColumns:
                `140px repeat(${items.length}, 1fr)`,
              gap: 0,
            }}
          >

            <div />

            {items.map((p) => (

              <div
                key={p.id}
                className="text-center px-2 pb-3"
              >

                <ProductArt
                  tint={
                    p.tint ||
                    C.electric
                  }
                  size={40}
                />

                <div
                  className="f-body"
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    marginTop: 6,
                  }}
                >
                  {p.name}
                </div>

                <div
                  className="f-mono"
                  style={{
                    fontSize: 12,
                    color: C.signal,
                  }}
                >
                  $
                  {p.price}
                </div>

              </div>

            ))}


            {/* SPECIFICATIONS */}

            {allKeys.map((key) => (

              <React.Fragment
                key={key}
              >

                <div
                  className="f-mono"
                  style={{
                    fontSize: 10.5,
                    color: C.muted,
                    padding:
                      "8px 0",
                    borderTop:
                      `1px solid ${C.mutedLine}`,
                  }}
                >
                  {key.toUpperCase()}
                </div>


                {items.map((p) => (

                  <div
                    key={
                      p.id +
                      key
                    }
                    className="f-mono text-center"
                    style={{
                      fontSize: 11.5,
                      color: C.ink,
                      padding:
                        "8px 4px",
                      borderTop:
                        `1px solid ${C.mutedLine}`,
                    }}
                  >
                    {getSpec(
                      p,
                      key
                    )}
                  </div>

                ))}

              </React.Fragment>

            ))}

          </div>


          {/* AI ANALYSIS */}

          <div
            style={{
              background:
                C.electricSoft,
              borderRadius: 10,
              padding: 16,
              marginTop: 16,
            }}
          >

            <div
              className="flex items-center gap-2"
              style={{
                marginBottom: 8,
              }}
            >

              <Sparkles
                size={14}
                color={C.electric}
              />

              <div
                className="f-body"
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: C.ink,
                }}
              >
                AI Analysis
              </div>

            </div>


            {/* LOADING */}

            {loading && (

              <div
                className="flex items-center gap-2"
                style={{
                  color: C.muted,
                  fontSize: 12,
                }}
              >

                <Loader2
                  size={14}
                  className="animate-spin"
                />

                AI is analyzing the selected products...

              </div>

            )}


            {/* ERROR */}

            {!loading &&
              error && (

                <div
                  className="f-body"
                  style={{
                    fontSize: 12,
                    color: "#B42318",
                    lineHeight: 1.5,
                  }}
                >
                  {error}
                </div>

              )}


            {/* RESULT */}

            {!loading &&
              !error &&
              aiReply && (

                <div
                  className="f-body"
                  style={{
                    fontSize: 12,
                    color: C.muted,
                    lineHeight: 1.65,
                    whiteSpace:
                      "pre-wrap",
                  }}
                >
                  {aiReply}
                </div>

              )}

          </div>

        </div>

      </div>

    </div>
  );
}