import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle,
  CreditCard,
  MapPin,
  Package,
  ShieldCheck,
  Truck,
  Wallet,
} from "lucide-react";

import ProductImage from "../components/ProductImage";
import { api } from "../lib/api";
import { useAuth } from "../lib/AuthContext";

// =================================================================
// IMAGE HELPER
// =================================================================

function getProductImage(item) {
  if (!item) {
    return "";
  }

  if (item.productImage) {
    return item.productImage;
  }

  if (item.image) {
    return item.image;
  }

  if (item.product?.image) {
    return item.product.image;
  }

  if (Array.isArray(item.images) && item.images.length > 0) {
    const primaryImage =
      item.images.find(
        (image) =>
          image?.isPrimary === true ||
          image?.isPrimary === 1
      ) || item.images[0];

    return primaryImage?.image || "";
  }

  if (
    Array.isArray(item.product?.images) &&
    item.product.images.length > 0
  ) {
    const primaryImage =
      item.product.images.find(
        (image) =>
          image?.isPrimary === true ||
          image?.isPrimary === 1
      ) || item.product.images[0];

    return primaryImage?.image || "";
  }

  return "";
}

// =================================================================
// MAIN CHECKOUT PAGE
// =================================================================

export default function CheckoutPage({
  cartItems = [],
  buyNowItems = [],
  onCheckout,
  setPage,
}) {
  // ============================================================
  // AUTH
  // ============================================================

  const { token } = useAuth();

  // ============================================================
  // CHECKOUT MODE
  // ============================================================

  const isBuyNow =
    Array.isArray(buyNowItems) &&
    buyNowItems.length > 0;

  const checkoutItems = isBuyNow
    ? buyNowItems
    : cartItems;

  // ============================================================
  // CHECKOUT STATE
  // ============================================================

  const [step, setStep] = useState(1);

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    zip: "",
  });

  // ============================================================
  // PAYMENT STATE
  // ============================================================

  const [payment, setPayment] = useState("card");

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  // ============================================================
  // SAVED PAYMENT STATE
  // ============================================================

  const [savedPayment, setSavedPayment] = useState(null);
  const [useSavedCard, setUseSavedCard] = useState(false);

  const [loadingPayment, setLoadingPayment] =
    useState(true);

  // ============================================================
  // OTHER STATE
  // ============================================================

  const [loadingAddress, setLoadingAddress] =
    useState(true);

  const [savingAddress, setSavingAddress] =
    useState(false);

  const [error, setError] = useState("");

  const [order, setOrder] = useState(null);

  // ============================================================
  // SUCCESS POPUP
  // ============================================================

  const [showSuccessModal, setShowSuccessModal] =
    useState(false);

  // ============================================================
  // LOAD SAVED USER INFORMATION
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const loadSavedUserInformation = async () => {
      // --------------------------------------------------------
      // USER IS LOGGED OUT
      // --------------------------------------------------------

      if (!token) {
        setSavedPayment(null);
        setUseSavedCard(false);

        setAddress({
          name: "",
          phone: "",
          street: "",
          city: "",
          zip: "",
        });

        setPayment("card");

        setCardNumber("");
        setCardName("");
        setCardExpiry("");
        setCardCvc("");

        setLoadingAddress(false);
        setLoadingPayment(false);

        return;
      }

      try {
        setLoadingAddress(true);
        setLoadingPayment(true);
        setError("");

        // api.js already returns body.data
        const user = await api.get("/users/me");

        if (cancelled || !user) {
          return;
        }

        // --------------------------------------------------------
        // LOAD SAVED SHIPPING ADDRESS
        // --------------------------------------------------------

        setAddress({
          name: user.receiverName || "",
          phone: user.receiverPhone || "",
          street: user.shippingStreet || "",
          city: user.shippingCity || "",
          zip: user.shippingZip || "",
        });

        // --------------------------------------------------------
        // LOAD SAVED PAYMENT INFORMATION
        // --------------------------------------------------------

        if (user.savedPaymentMethod) {
          const saved = {
            method: user.savedPaymentMethod,
            cardName: user.savedCardName || "",
            cardLast4: user.savedCardLast4 || "",
            cardExpiry: user.savedCardExpiry || "",
          };

          setSavedPayment(saved);

          setPayment(user.savedPaymentMethod);

          // ------------------------------------------------------
          // RESTORE SAVED CARD
          // ------------------------------------------------------

          if (
            user.savedPaymentMethod === "card" &&
            user.savedCardLast4
          ) {
            setUseSavedCard(true);

            setCardNumber(
              `•••• •••• •••• ${user.savedCardLast4}`
            );

            setCardName(
              user.savedCardName || ""
            );

            setCardExpiry(
              user.savedCardExpiry || ""
            );

            // CVC is NEVER stored.
            setCardCvc("•••");
          } else {
            setUseSavedCard(false);

            setCardNumber("");
            setCardName("");
            setCardExpiry("");
            setCardCvc("");
          }
        } else {
          // ------------------------------------------------------
          // NO SAVED PAYMENT
          // ------------------------------------------------------

          setSavedPayment(null);
          setUseSavedCard(false);
          setPayment("card");

          setCardNumber("");
          setCardName("");
          setCardExpiry("");
          setCardCvc("");
        }
      } catch (err) {
        console.error(
          "Failed to load saved user information:",
          err
        );

        if (!cancelled) {
          setError(
            "Could not load your saved information."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingAddress(false);
          setLoadingPayment(false);
        }
      }
    };

    loadSavedUserInformation();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // ============================================================
  // TOTALS
  // ============================================================

  const subtotal = useMemo(() => {
    return checkoutItems.reduce(
      (sum, item) =>
        sum +
        Number(item?.price || 0) *
          Number(item?.quantity || 0),
      0
    );
  }, [checkoutItems]);

  /*
   * TechNova shipping policy:
   * $12 below $200
   * Free at $200+
   */

  const shipping =
    subtotal > 0 && subtotal < 200
      ? 12
      : 0;

  const total = subtotal + shipping;

  // ============================================================
  // UPDATE ADDRESS FIELD
  // ============================================================

  const updateAddress = (
    field,
    value
  ) => {
    setAddress((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // ============================================================
  // FORMAT CARD NUMBER
  // ============================================================

  const handleCardNumberChange = (
    value
  ) => {
    const numbersOnly =
      value
        .replace(/\D/g, "")
        .slice(0, 16);

    const formatted =
      numbersOnly
        .match(/.{1,4}/g)
        ?.join(" ") || "";

    setCardNumber(formatted);

    if (error) {
      setError("");
    }
  };

  // ============================================================
  // FORMAT EXPIRY
  // ============================================================

  const handleExpiryChange = (
    value
  ) => {
    const numbersOnly =
      value
        .replace(/\D/g, "")
        .slice(0, 4);

    let formatted = numbersOnly;

    if (numbersOnly.length > 2) {
      formatted =
        `${numbersOnly.slice(
          0,
          2
        )}/${numbersOnly.slice(2)}`;
    }

    setCardExpiry(formatted);

    if (error) {
      setError("");
    }
  };

  // ============================================================
  // VALIDATE SHIPPING
  // ============================================================

  const validateAddress = () => {
    if (!address.name.trim()) {
      setError(
        "Please enter the receiver name."
      );
      return false;
    }

    if (!address.phone.trim()) {
      setError(
        "Please enter the receiver phone number."
      );
      return false;
    }

    if (!address.street.trim()) {
      setError(
        "Please enter the street address."
      );
      return false;
    }

    if (!address.city.trim()) {
      setError(
        "Please enter the city."
      );
      return false;
    }

    if (!address.zip.trim()) {
      setError(
        "Please enter the ZIP / postal code."
      );
      return false;
    }

    return true;
  };

  // ============================================================
  // SHIPPING → PAYMENT
  // ============================================================

  const continueToPayment = () => {
    setError("");

    if (!validateAddress()) {
      return;
    }

    setStep(2);
  };

  // ============================================================
  // PAYMENT → REVIEW
  // ============================================================

  const continueToReview = async () => {
    setError("");

    if (payment === "card") {
      // --------------------------------------------------------
      // USING EXISTING SAVED CARD
      // --------------------------------------------------------

      if (
        useSavedCard &&
        savedPayment?.method === "card"
      ) {
        if (!savedPayment.cardLast4) {
          setError(
            "Saved card information is unavailable."
          );
          return;
        }

        if (!cardName.trim()) {
          setError(
            "Please enter the name on your card."
          );
          return;
        }

        if (
          !/^\d{2}\/\d{2}$/.test(
            cardExpiry
          )
        ) {
          setError(
            "Please enter a valid expiry date."
          );
          return;
        }

        setStep(3);
        return;
      }

      // --------------------------------------------------------
      // USING A NEW CARD
      // --------------------------------------------------------

      const cleanCard =
        cardNumber.replace(/\s/g, "");

      if (cleanCard.length < 12) {
        setError(
          "Please enter a valid card number."
        );
        return;
      }

      if (!cardName.trim()) {
        setError(
          "Please enter the name on your card."
        );
        return;
      }

      if (
        !/^\d{2}\/\d{2}$/.test(
          cardExpiry
        )
      ) {
        setError(
          "Please enter a valid expiry date."
        );
        return;
      }

      if (
        !/^\d{3,4}$/.test(
          cardCvc
        )
      ) {
        setError(
          "Please enter a valid security code."
        );
        return;
      }

      // --------------------------------------------------------
      // SAVE NEW CARD BEFORE GOING TO REVIEW
      // --------------------------------------------------------

      try {
        await savePaymentDetails();
      } catch (paymentError) {
        console.error(
          "Failed to save payment information:",
          paymentError
        );

        setError(
          "Could not save your payment information. Please try again."
        );

        return;
      }
    }

    setStep(3);
  };

  // ============================================================
  // SAVE SHIPPING ADDRESS
  // ============================================================

  const saveShippingAddress =
    async () => {
      return await api.put(
        "/users/me/shipping-address",
        {
          receiverName:
            address.name.trim(),

          receiverPhone:
            address.phone.trim(),

          shippingStreet:
            address.street.trim(),

          shippingCity:
            address.city.trim(),

          shippingZip:
            address.zip.trim(),
        }
      );
    };

  // ============================================================
  // SAVE PAYMENT INFORMATION
  // ============================================================

  const savePaymentDetails =
    async () => {
      // --------------------------------------------------------
      // CARD
      // --------------------------------------------------------

      if (payment === "card") {
        /*
         * Existing saved card is already stored.
         *
         * Do NOT send the visual masked card number
         * back to the backend.
         */

        if (
          useSavedCard &&
          savedPayment?.method === "card" &&
          savedPayment.cardLast4
        ) {
          return;
        }

        /*
         * NEW CARD
         *
         * Only save:
         * - cardholder name
         * - last 4 digits
         * - expiry
         *
         * Full card number and CVC are NEVER saved.
         */

        const cleanCard =
          cardNumber.replace(/\s/g, "");

        if (cleanCard.length < 4) {
          throw new Error(
            "Invalid card number."
          );
        }

        await api.put(
          "/users/me/payment-details",
          {
            savedPaymentMethod:
              "card",

            savedCardName:
              cardName.trim(),

            savedCardLast4:
              cleanCard.slice(-4),

            savedCardExpiry:
              cardExpiry.trim(),
          }
        );

        // Update local saved-card state.

        setSavedPayment({
          method: "card",
          cardName:
            cardName.trim(),
          cardLast4:
            cleanCard.slice(-4),
          cardExpiry:
            cardExpiry.trim(),
        });

        setUseSavedCard(true);

        return;
      }

      // --------------------------------------------------------
      // DIGITAL WALLET / COD
      // --------------------------------------------------------

      await api.put(
        "/users/me/payment-details",
        {
          savedPaymentMethod:
            payment,

          savedCardName: null,
          savedCardLast4: null,
          savedCardExpiry: null,
        }
      );

      setSavedPayment({
        method: payment,
        cardName: "",
        cardLast4: "",
        cardExpiry: "",
      });

      setUseSavedCard(false);
    };

  // ============================================================
  // PLACE ORDER
  // ============================================================

  const placeOrder = async () => {
    if (!validateAddress()) {
      setStep(1);
      return;
    }

    if (!checkoutItems.length) {
      setError(
        isBuyNow
          ? "No product selected."
          : "Your cart is empty."
      );
      return;
    }

    setError("");
    setSavingAddress(true);

    try {
      // --------------------------------------------------------
      // SAVE SHIPPING ADDRESS
      // --------------------------------------------------------

      await saveShippingAddress();

      // --------------------------------------------------------
      // PREPARE ORDER ITEMS
      // --------------------------------------------------------

      const orderItems =
        checkoutItems.map(
          (item) => ({
            productId: Number(
              item?.productId ??
                item?.product?.id ??
                item?.id
            ),

            quantity: Number(
              item?.quantity || 1
            ),
          })
        );

      // --------------------------------------------------------
      // VALIDATE PRODUCT IDS
      // --------------------------------------------------------

      const invalidItem =
        orderItems.find(
          (item) =>
            !Number.isFinite(
              item.productId
            ) ||
            item.productId <= 0 ||
            !Number.isFinite(
              item.quantity
            ) ||
            item.quantity <= 0
        );

      if (invalidItem) {
        throw new Error(
          "Invalid product information."
        );
      }

      // --------------------------------------------------------
      // SEND ORDER TO BACKEND
      // --------------------------------------------------------

      const result =
        await onCheckout({
          receiverName:
            address.name.trim(),

          receiverPhone:
            address.phone.trim(),

          address:
            `${address.street.trim()}, ` +
            `${address.city.trim()} ` +
            `${address.zip.trim()}`,

          paymentMethod:
            payment,

          buyNow: isBuyNow,

          items: orderItems,
        });

      // --------------------------------------------------------
      // READ CREATED ORDER
      // --------------------------------------------------------

      const createdOrder =
        result?.data?.data ??
        result?.data ??
        result;

      console.log(
        "Order created successfully:",
        createdOrder
      );

      setOrder(createdOrder);

      // --------------------------------------------------------
      // PAYMENT INFORMATION
      // --------------------------------------------------------
      /*
       * New card information was already saved when
       * Continue to Review was clicked.
       *
       * Existing saved card requires no update.
       *
       * Wallet/COD is saved here because those methods
       * do not require card fields.
       */

      if (payment !== "card") {
        try {
          await savePaymentDetails();
        } catch (paymentError) {
          console.error(
            "Order placed, but saved payment information could not be updated:",
            paymentError
          );
        }
      }

      // --------------------------------------------------------
      // SHOW SUCCESS POPUP
      // --------------------------------------------------------

      setStep(4);
      setShowSuccessModal(true);

    } catch (err) {
      console.error(
        "Checkout failed:",
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to place your order. Please try again.";

      setError(message);

    } finally {
      setSavingAddress(false);
    }
  };

  // ============================================================
  // EMPTY CHECKOUT
  // ============================================================

  if (
    !checkoutItems.length &&
    !showSuccessModal &&
    step !== 4
  ) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-10 text-center max-w-md w-full">

          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
            <Package
              size={30}
              className="text-slate-500"
            />
          </div>

          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            {isBuyNow
              ? "No product selected"
              : "Your cart is empty"}
          </h2>

          <p className="text-slate-500 mb-6">
            {isBuyNow
              ? "Please select a product before proceeding to checkout."
              : "Add some products before proceeding to checkout."}
          </p>

          <button
            type="button"
            onClick={() =>
              setPage("home")
            }
            className="w-full px-6 py-3.5 rounded-xl bg-[#2D3E8C] text-white font-semibold hover:bg-[#1e2a5e] hover:-translate-y-0.5 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Continue Shopping
          </button>

        </div>

      </div>
    );
  }

  // ============================================================
  // STEP INDICATOR
  // ============================================================

  const steps = [
    {
      number: 1,
      label: "Shipping",
      icon: MapPin,
    },
    {
      number: 2,
      label: "Payment",
      icon: CreditCard,
    },
    {
      number: 3,
      label: "Review",
      icon: Check,
    },
    {
      number: 4,
      label: "Complete",
      icon: Package,
    },
  ];

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="bg-white border-b border-slate-200">

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-7">

          <div className="flex items-center gap-4">

            {step < 4 && (
              <button
                type="button"
                onClick={() => {
                  if (step === 1) {
                    if (isBuyNow) {
                      setPage("product");
                    } else {
                      setPage("cart");
                    }
                  } else {
                    setStep(step - 1);
                  }
                }}
                className="group w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:bg-[#2D3E8C] hover:text-white hover:border-[#2D3E8C] transition-all duration-200 shadow-sm"
                aria-label="Go back"
              >
                <ArrowLeft
                  size={19}
                  className="transition-transform duration-200 group-hover:-translate-x-0.5"
                />
              </button>
            )}

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Checkout
              </h1>

              <p className="text-sm text-slate-500 mt-0.5">
                Complete your order securely
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* ======================================================
          STEP INDICATOR
      ======================================================= */}

      <div className="bg-white border-b border-slate-200">

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">

          <div className="flex items-center justify-between">

            {steps.map(
              (item, index) => {
                const Icon =
                  item.icon;

                const active =
                  step >= item.number;

                return (
                  <div
                    key={item.number}
                    className="flex items-center flex-1"
                  >

                    <div className="flex flex-col items-center">

                      <div
                        className={[
                          "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200",
                          active
                            ? "bg-[#2D3E8C] text-white border-[#2D3E8C] shadow-sm"
                            : "bg-white text-slate-400 border-slate-300",
                        ].join(" ")}
                      >
                        <Icon size={18} />
                      </div>

                      <span
                        className={[
                          "text-xs mt-2 font-medium",
                          active
                            ? "text-slate-900"
                            : "text-slate-400",
                        ].join(" ")}
                      >
                        {item.label}
                      </span>

                    </div>

                    {index <
                      steps.length - 1 && (
                      <div
                        className={[
                          "h-0.5 flex-1 mx-3 mt-[-18px] transition-colors duration-200",
                          step > item.number
                            ? "bg-[#2D3E8C]"
                            : "bg-slate-200",
                        ].join(" ")}
                      />
                    )}

                  </div>
                );
              }
            )}

          </div>

        </div>

      </div>

      {/* ======================================================
          CONTENT
      ======================================================= */}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-7 sm:py-10">

        {/* ====================================================
            STEP 1 — SHIPPING
        ===================================================== */}

        {step === 1 && (
          <div className="grid lg:grid-cols-[1fr_380px] gap-8">

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

              <div className="flex items-center gap-3 mb-6">

                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <MapPin
                    size={20}
                    className="text-slate-700"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Shipping Information
                  </h2>

                  <p className="text-sm text-slate-500">
                    Your address is saved automatically for future orders.
                  </p>
                </div>

              </div>

              {loadingAddress ? (
                <div className="py-10 text-center text-slate-500">
                  Loading your saved address...
                </div>
              ) : (
                <div className="space-y-5">

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name
                    </label>

                    <input
                      type="text"
                      value={address.name}
                      onChange={(e) =>
                        updateAddress(
                          "name",
                          e.target.value
                        )
                      }
                      placeholder="Enter receiver name"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#2D3E8C] focus:ring-1 focus:ring-[#2D3E8C] transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      value={address.phone}
                      onChange={(e) =>
                        updateAddress(
                          "phone",
                          e.target.value
                        )
                      }
                      placeholder="Enter phone number"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#2D3E8C] focus:ring-1 focus:ring-[#2D3E8C] transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Street Address
                    </label>

                    <input
                      type="text"
                      value={address.street}
                      onChange={(e) =>
                        updateAddress(
                          "street",
                          e.target.value
                        )
                      }
                      placeholder="Street address"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#2D3E8C] focus:ring-1 focus:ring-[#2D3E8C] transition-all duration-200"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        City
                      </label>

                      <input
                        type="text"
                        value={address.city}
                        onChange={(e) =>
                          updateAddress(
                            "city",
                            e.target.value
                          )
                        }
                        placeholder="City"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#2D3E8C] focus:ring-1 focus:ring-[#2D3E8C] transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        ZIP / Postal Code
                      </label>

                      <input
                        type="text"
                        value={address.zip}
                        onChange={(e) =>
                          updateAddress(
                            "zip",
                            e.target.value
                          )
                        }
                        placeholder="ZIP code"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#2D3E8C] focus:ring-1 focus:ring-[#2D3E8C] transition-all duration-200"
                      />
                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={continueToPayment}
                    className="w-full mt-3 py-3.5 rounded-xl bg-[#2D3E8C] text-white font-semibold hover:bg-[#1e2a5e] hover:-translate-y-0.5 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Continue to Payment
                  </button>

                </div>
              )}

            </div>

            <OrderSummary
              cartItems={checkoutItems}
              subtotal={subtotal}
              shipping={shipping}
              total={total}
            />

          </div>
        )}

        {/* ====================================================
            STEP 2 — PAYMENT
        ===================================================== */}

        {step === 2 && (
          <div className="grid lg:grid-cols-[1fr_380px] gap-8">

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

              <div className="flex items-center gap-3 mb-6">

                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <CreditCard
                    size={20}
                    className="text-slate-700"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Payment Method
                  </h2>

                  <p className="text-sm text-slate-500">
                    Choose how you would like to pay.
                  </p>
                </div>

              </div>

              <div className="space-y-3">

                <PaymentOption
                  value="card"
                  selected={payment}
                  onChange={(value) => {
                    setPayment(value);
                    setUseSavedCard(false);
                    setError("");

                    if (value !== "card") {
                      setCardNumber("");
                      setCardName("");
                      setCardExpiry("");
                      setCardCvc("");
                    } else if (
                      savedPayment?.method === "card" &&
                      savedPayment.cardLast4
                    ) {
                      setUseSavedCard(true);

                      setCardNumber(
                        `•••• •••• •••• ${savedPayment.cardLast4}`
                      );

                      setCardName(
                        savedPayment.cardName || ""
                      );

                      setCardExpiry(
                        savedPayment.cardExpiry || ""
                      );

                      setCardCvc("•••");
                    }
                  }}
                  icon={CreditCard}
                  title="Credit / Debit Card"
                  description="Pay securely with your card"
                />

                <PaymentOption
                  value="wallet"
                  selected={payment}
                  onChange={(value) => {
                    setPayment(value);
                    setUseSavedCard(false);
                    setError("");

                    setCardNumber("");
                    setCardName("");
                    setCardExpiry("");
                    setCardCvc("");
                  }}
                  icon={Wallet}
                  title="Digital Wallet"
                  description="Pay using your digital wallet"
                />

                <PaymentOption
                  value="cod"
                  selected={payment}
                  onChange={(value) => {
                    setPayment(value);
                    setUseSavedCard(false);
                    setError("");

                    setCardNumber("");
                    setCardName("");
                    setCardExpiry("");
                    setCardCvc("");
                  }}
                  icon={Truck}
                  title="Cash on Delivery"
                  description="Pay when your order arrives"
                />

              </div>

              {payment === "card" && (
                <div className="mt-6 pt-6 border-t border-slate-200 space-y-5">

                  {/* SAVED CARD / DIFFERENT CARD */}

                  {savedPayment?.method === "card" &&
                    savedPayment.cardLast4 && (
                      <div className="space-y-3">

                        {/* SAVED CARD */}

                        <button
                          type="button"
                          onClick={() => {
                            setUseSavedCard(true);

                            setCardNumber(
                              `•••• •••• •••• ${savedPayment.cardLast4}`
                            );

                            setCardName(
                              savedPayment.cardName || ""
                            );

                            setCardExpiry(
                              savedPayment.cardExpiry || ""
                            );

                            setCardCvc("•••");

                            setError("");
                          }}
                          className={[
                            "group w-full text-left p-4 rounded-xl border-2 transition-all duration-200",
                            useSavedCard
                              ? "border-[#2D3E8C] bg-[#2D3E8C]/5 shadow-sm"
                              : "border-slate-200 hover:border-slate-400 hover:bg-slate-50",
                          ].join(" ")}
                        >

                          <div className="flex items-center gap-3">

                            <div className="w-11 h-11 rounded-lg bg-white border border-slate-200 flex items-center justify-center group-hover:border-slate-300 transition-colors">
                              <CreditCard
                                size={19}
                                className="text-slate-700"
                              />
                            </div>

                            <div className="flex-1">

                              <p className="text-sm font-semibold text-slate-900">
                                Saved Card
                              </p>

                              <p className="text-sm text-slate-500 mt-1">
                                •••• {savedPayment.cardLast4}
                              </p>

                              {savedPayment.cardName && (
                                <p className="text-xs text-slate-500 mt-1">
                                  {savedPayment.cardName}
                                </p>
                              )}

                            </div>

                            <div
                              className={[
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                useSavedCard
                                  ? "border-[#2D3E8C]"
                                  : "border-slate-300",
                              ].join(" ")}
                            >
                              {useSavedCard && (
                                <div className="w-2.5 h-2.5 rounded-full bg-[#2D3E8C]" />
                              )}
                            </div>

                          </div>

                        </button>

                        {/* DIFFERENT CARD */}

                        <button
                          type="button"
                          onClick={() => {
                            setUseSavedCard(false);

                            setCardNumber("");
                            setCardName("");
                            setCardExpiry("");
                            setCardCvc("");

                            setError("");
                          }}
                          className={[
                            "group w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
                            !useSavedCard
                              ? "border-[#2D3E8C] bg-[#2D3E8C]/5 shadow-sm"
                              : "border-slate-200 hover:border-slate-400 hover:bg-slate-50",
                          ].join(" ")}
                        >

                          <div className="flex items-center gap-3">

                            <div className="w-11 h-11 rounded-lg bg-white border border-slate-200 flex items-center justify-center group-hover:border-slate-300 transition-colors">
                              <CreditCard
                                size={19}
                                className="text-slate-700"
                              />
                            </div>

                            <div className="flex-1">

                              <p className="text-sm font-semibold text-slate-900">
                                Use a different card
                              </p>

                              <p className="text-sm text-slate-500 mt-1">
                                Enter another card for this order
                              </p>

                            </div>

                            <div
                              className={[
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                !useSavedCard
                                  ? "border-[#2D3E8C]"
                                  : "border-slate-300",
                              ].join(" ")}
                            >
                              {!useSavedCard && (
                                <div className="w-2.5 h-2.5 rounded-full bg-[#2D3E8C]" />
                              )}
                            </div>

                          </div>

                        </button>

                      </div>
                    )}

                  {/* CARD NUMBER */}

                  <div>

                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Card Number
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={cardNumber}
                      readOnly={useSavedCard}
                      onChange={(e) =>
                        handleCardNumberChange(
                          e.target.value
                        )
                      }
                      placeholder="1234 5678 9012 3456"
                      autoComplete="cc-number"
                      className={[
                        "w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:border-[#2D3E8C] focus:ring-1 focus:ring-[#2D3E8C] transition-all duration-200",
                        useSavedCard
                          ? "bg-slate-50 text-slate-500 cursor-not-allowed"
                          : "bg-white text-slate-900 placeholder:text-slate-400",
                      ].join(" ")}
                    />

                  </div>

                  {/* CARD NAME */}

                  <div>

                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Name on Card
                    </label>

                    <input
                      type="text"
                      value={cardName}
                      readOnly={useSavedCard}
                      onChange={(e) => {
                        setCardName(e.target.value);

                        if (error) {
                          setError("");
                        }
                      }}
                      placeholder="Name on card"
                      autoComplete="cc-name"
                      className={[
                        "w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:border-[#2D3E8C] focus:ring-1 focus:ring-[#2D3E8C] transition-all duration-200",
                        useSavedCard
                          ? "bg-slate-50 text-slate-500 cursor-not-allowed"
                          : "bg-white text-slate-900 placeholder:text-slate-400",
                      ].join(" ")}
                    />

                  </div>

                  {/* EXPIRY + CVC */}

                  <div className="grid grid-cols-2 gap-4">

                    <div>

                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Expiry
                      </label>

                      <input
                        type="text"
                        inputMode="numeric"
                        value={cardExpiry}
                        readOnly={useSavedCard}
                        onChange={(e) =>
                          handleExpiryChange(
                            e.target.value
                          )
                        }
                        placeholder="MM/YY"
                        autoComplete="cc-exp"
                        className={[
                          "w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:border-[#2D3E8C] focus:ring-1 focus:ring-[#2D3E8C] transition-all duration-200",
                          useSavedCard
                            ? "bg-slate-50 text-slate-500 cursor-not-allowed"
                            : "bg-white text-slate-900 placeholder:text-slate-400",
                        ].join(" ")}
                      />

                    </div>

                    <div>

                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        CVC
                      </label>

                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        value={cardCvc}
                        readOnly={useSavedCard}
                        onChange={(e) => {
                          setCardCvc(
                            e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 4)
                          );

                          if (error) {
                            setError("");
                          }
                        }}
                        placeholder="123"
                        autoComplete="cc-csc"
                        className={[
                          "w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:border-[#2D3E8C] focus:ring-1 focus:ring-[#2D3E8C] transition-all duration-200",
                          useSavedCard
                            ? "bg-slate-50 text-slate-500 cursor-not-allowed"
                            : "bg-white text-slate-900 placeholder:text-slate-400",
                        ].join(" ")}
                      />

                    </div>

                  </div>

                </div>
              )}

              {/* SECURITY MESSAGE */}

              <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex gap-3">

                <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  <ShieldCheck
                    size={19}
                    className="text-slate-700"
                  />
                </div>

                <div>

                  <p className="text-sm font-medium text-slate-900">
                    Secure Payment
                  </p>

                  <p className="text-xs text-slate-500 mt-1 leading-5">
                    Your payment information is protected.
                    Only your payment method and limited
                    card details are saved for faster
                    future checkout.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={continueToReview}
                disabled={loadingPayment}
                className="w-full mt-6 py-3.5 rounded-xl bg-[#2D3E8C] text-white font-semibold hover:bg-[#1e2a5e] hover:-translate-y-0.5 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loadingPayment
                  ? "Loading Payment..."
                  : "Continue to Review"}
              </button>

            </div>

            <OrderSummary
              cartItems={checkoutItems}
              subtotal={subtotal}
              shipping={shipping}
              total={total}
            />

          </div>
        )}

        {/* ====================================================
            STEP 3 — REVIEW
        ===================================================== */}

        {step === 3 && (
          <div className="grid lg:grid-cols-[1fr_380px] gap-8">

            <div className="space-y-6">

              {/* SHIPPING REVIEW */}

              <ReviewCard
                title="Shipping Address"
                icon={MapPin}
                onEdit={() => setStep(1)}
              >

                <p className="font-medium text-slate-900">
                  {address.name}
                </p>

                <p className="text-slate-600">
                  {address.phone}
                </p>

                <p className="text-slate-600 mt-1">
                  {address.street}
                </p>

                <p className="text-slate-600">
                  {address.city}, {address.zip}
                </p>

              </ReviewCard>

              {/* PAYMENT REVIEW */}

              <ReviewCard
                title="Payment Method"
                icon={CreditCard}
                onEdit={() => setStep(2)}
              >

                <p className="font-medium text-slate-900">

                  {payment === "card" &&
                    "Credit / Debit Card"}

                  {payment === "wallet" &&
                    "Digital Wallet"}

                  {payment === "cod" &&
                    "Cash on Delivery"}

                </p>

                {payment === "card" && (
                  <>

                    <p className="text-sm text-slate-500 mt-1">
                      Card ending in{" "}
                      {useSavedCard &&
                      savedPayment?.cardLast4
                        ? savedPayment.cardLast4
                        : cardNumber
                            .replace(/\s/g, "")
                            .slice(-4)}
                    </p>

                    {cardName && (
                      <p className="text-sm text-slate-500">
                        {cardName}
                      </p>
                    )}

                    {cardExpiry && (
                      <p className="text-sm text-slate-500">
                        Expires {cardExpiry}
                      </p>
                    )}

                  </>
                )}

              </ReviewCard>

              {/* ORDER ITEMS */}

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

                <div className="flex items-center justify-between mb-5">

                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Order Items
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                      {checkoutItems.length}{" "}
                      {checkoutItems.length === 1
                        ? "item"
                        : "items"}{" "}
                      in this order
                    </p>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Package
                      size={19}
                      className="text-slate-700"
                    />
                  </div>

                </div>

                <div className="space-y-3">

                  {checkoutItems.map(
                    (item) => (
                      <div
                        key={
                          item.productId ??
                          item.id
                        }
                        className="group flex gap-4 rounded-xl border border-slate-200 p-3 hover:border-slate-300 hover:shadow-sm transition-all duration-200"
                      >

                        {/* PRODUCT IMAGE */}

                        <div className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">

                          <ProductImage
                            src={getProductImage(item)}
                            alt={item.name || "Product"}
                            className="w-full h-full p-2 transition-transform duration-300 group-hover:scale-110"
                          />

                        </div>

                        {/* PRODUCT INFO */}

                        <div className="flex-1 min-w-0 flex flex-col justify-center">

                          <p className="font-medium text-slate-900">
                            {item.name}
                          </p>

                          <p className="text-sm text-slate-500 mt-1">
                            Quantity: {item.quantity}
                          </p>

                        </div>

                        {/* PRICE */}

                        <div className="flex items-center">

                          <p className="font-semibold text-slate-900">

                            $
                            {(
                              Number(
                                item.price || 0
                              ) *
                              Number(
                                item.quantity || 0
                              )
                            ).toFixed(2)}

                          </p>

                        </div>

                      </div>
                    )
                  )}

                </div>

              </div>

              {/* PLACE ORDER */}

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

                <div className="flex items-center gap-3 mb-4">

                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <ShieldCheck
                      size={19}
                      className="text-slate-700"
                    />
                  </div>

                  <div>
                    <p className="font-semibold text-slate-900">
                      Ready to place your order?
                    </p>

                    <p className="text-sm text-slate-500">
                      Review your information before confirming.
                    </p>
                  </div>

                </div>

                <button
                  type="button"
                  disabled={savingAddress}
                  onClick={placeOrder}
                  className="w-full py-4 rounded-xl bg-[#2D3E8C] text-white font-semibold hover:bg-[#1e2a5e] hover:-translate-y-0.5 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {savingAddress
                    ? "Placing Order..."
                    : `Place Order • $${total.toFixed(2)}`}
                </button>

              </div>

            </div>

            <OrderSummary
              cartItems={checkoutItems}
              subtotal={subtotal}
              shipping={shipping}
              total={total}
            />

          </div>
        )}

        {/* ====================================================
            STEP 4 — FALLBACK COMPLETE
        ===================================================== */}

        {step === 4 && !showSuccessModal && (
          <div className="min-h-[500px] flex items-center justify-center">

            <div className="text-center max-w-md w-full">

              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">

                <CheckCircle
                  size={42}
                  className="text-[#2D3E8C]"
                />

              </div>

              <h2 className="text-3xl font-bold text-slate-900 mb-3">
                Congratulations! 🎉
              </h2>

              <p className="text-lg text-slate-600 mb-2">
                Your order has been placed successfully.
              </p>

              <p className="text-sm text-slate-500 mb-8">
                Thank you for shopping with TechNova.
              </p>

            </div>

          </div>
        )}

      </main>

      {/* ======================================================
          CHECKOUT ERROR POPUP
      ======================================================= */}

      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] w-[calc(100%-32px)] max-w-md">

          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-white px-4 py-3.5 shadow-xl">

            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">

              <span className="text-red-600 text-sm font-bold">
                !
              </span>

            </div>

            <p className="flex-1 text-sm font-medium text-slate-800">
              {error}
            </p>

            <button
              type="button"
              onClick={() => setError("")}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition text-lg leading-none"
              aria-label="Close"
            >
              ×
            </button>

          </div>

        </div>
      )}

      {/* ======================================================
          CONGRATULATIONS SUCCESS POPUP
      ======================================================= */}

      {showSuccessModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#2D3E8C]/50 backdrop-blur-sm px-4">

          <div className="relative w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">

            {/* SUCCESS ICON */}

            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2D3E8C] text-white shadow-lg">

                <Check
                  size={30}
                  strokeWidth={3}
                />

              </div>

            </div>

            {/* TITLE */}

            <h2 className="text-3xl font-bold text-slate-900">
              Congratulations! 🎉
            </h2>

            {/* MESSAGE */}

            <p className="mt-3 text-lg text-slate-600">
              Your order has been placed successfully.
            </p>

            <p className="mt-2 text-sm text-slate-500 leading-6">
              Thank you for shopping with TechNova.
              Your order is now being processed.
            </p>

            {/* BUTTONS */}

            <div className="mt-7 flex flex-col gap-3">

              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  setPage("orders");
                }}
                className="group w-full rounded-xl bg-[#2D3E8C] py-3.5 font-semibold text-white hover:bg-[#1e2a5e] hover:-translate-y-0.5 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                View My Orders
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  setPage("home");
                }}
                className="w-full rounded-xl border border-slate-300 py-3.5 font-semibold text-slate-900 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
              >
                Continue Shopping
              </button>

            </div>

            {/* PROCESSING MESSAGE */}

            <div className="mt-5 flex items-center justify-center gap-2 text-sm text-slate-500">

              <Truck
                size={17}
                className="text-slate-600"
              />

              <span>
                Your order will be processed shortly.
              </span>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}


// =================================================================
// ORDER SUMMARY
// =================================================================

function OrderSummary({
  cartItems,
  subtotal,
  shipping,
  total,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-fit lg:sticky lg:top-6">

      <div className="flex items-center justify-between mb-5">

        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Order Summary
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            Review your items and total
          </p>
        </div>

        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
          <Package
            size={18}
            className="text-slate-700"
          />
        </div>

      </div>

      <div className="space-y-2">

        {cartItems.map(
          (item) => (
            <div
              key={
                item.productId ??
                item.id
              }
              className="group flex items-center gap-3 rounded-xl p-2 -mx-2 hover:bg-slate-50 transition-colors duration-200"
            >

              {/* PRODUCT IMAGE */}

              <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">

                <ProductImage
                  src={getProductImage(item)}
                  alt={item.name || "Product"}
                  className="w-full h-full p-1.5 transition-transform duration-300 group-hover:scale-110"
                />

              </div>

              {/* PRODUCT INFO */}

              <div className="flex-1 min-w-0">

                <p className="text-sm font-medium text-slate-900 truncate">
                  {item.name}
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Qty: {item.quantity}
                </p>

              </div>

              {/* PRICE */}

              <p className="text-sm font-semibold text-slate-900">

                $
                {(
                  Number(
                    item.price || 0
                  ) *
                  Number(
                    item.quantity || 0
                  )
                ).toFixed(2)}

              </p>

            </div>
          )
        )}

      </div>

      <div className="border-t border-slate-200 mt-5 pt-5 space-y-3">

        <div className="flex justify-between text-sm">

          <span className="text-slate-500">
            Subtotal
          </span>

          <span className="font-medium text-slate-900">
            ${subtotal.toFixed(2)}
          </span>

        </div>

        <div className="flex justify-between text-sm">

          <span className="text-slate-500">
            Shipping
          </span>

          <span className="font-medium text-slate-900">
            {shipping === 0
              ? "Free"
              : `$${shipping.toFixed(2)}`}
          </span>

        </div>

        <div className="border-t border-slate-200 pt-4 flex justify-between items-center">

          <span className="font-semibold text-slate-900">
            Total
          </span>

          <span className="text-xl font-bold text-slate-900">
            ${total.toFixed(2)}
          </span>

        </div>

      </div>

      <div className="mt-5 pt-4 border-t border-slate-100">

        <div className="flex items-center gap-2 text-xs text-slate-500">

          <ShieldCheck
            size={15}
            className="text-slate-600 shrink-0"
          />

          <span>
            Secure checkout with TechNova
          </span>

        </div>

      </div>

    </div>
  );
}


// =================================================================
// PAYMENT OPTION
// =================================================================

function PaymentOption({
  value,
  selected,
  onChange,
  icon: Icon,
  title,
  description,
}) {
  const active =
    selected === value;

  return (
    <button
      type="button"
      onClick={() =>
        onChange(value)
      }
      className={[
        "group w-full text-left p-4 rounded-xl border-2 flex items-center gap-4 transition-all duration-200",
        active
          ? "border-[#2D3E8C] bg-[#2D3E8C]/5 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50",
      ].join(" ")}
    >

      <div
        className={[
          "w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 transition-colors duration-200",
          active
            ? "bg-white border-slate-300"
            : "bg-slate-50 border-slate-200 group-hover:bg-white",
        ].join(" ")}
      >
        <Icon
          size={20}
          className="text-slate-700"
        />
      </div>

      <div className="flex-1">

        <p className="font-medium text-slate-900">
          {title}
        </p>

        <p className="text-sm text-slate-500 mt-1">
          {description}
        </p>

      </div>

      <div
        className={[
          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
          active
            ? "border-[#2D3E8C]"
            : "border-slate-300",
        ].join(" ")}
      >

        {active && (
          <div className="w-2.5 h-2.5 rounded-full bg-[#2D3E8C]" />
        )}

      </div>

    </button>
  );
}


// =================================================================
// REVIEW CARD
// =================================================================

function ReviewCard({
  title,
  icon: Icon,
  children,
  onEdit,
}) {
  return (
    <div className="group bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:border-slate-300 hover:shadow-md transition-all duration-200">

      <div className="flex items-center justify-between mb-4">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors duration-200">
            <Icon
              size={19}
              className="text-slate-700"
            />
          </div>

          <h2 className="font-semibold text-slate-900">
            {title}
          </h2>

        </div>

        <button
          type="button"
          onClick={onEdit}
          className="text-sm font-medium text-slate-600 hover:text-[#2D3E8C] transition-colors"
        >
          Edit
        </button>

      </div>

      <div className="text-sm leading-6">
        {children}
      </div>

    </div>
  );
}