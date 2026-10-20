import { useState, useEffect, useRef, useMemo } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Edit2,
  Check,
  LogOut,
  ShoppingBag,
  Heart,
  Package,
  Loader2,
  Shield,
  ChevronRight,
  Camera,
  Bell,
  MapPin,
  CreditCard,
  Lock,
  Ticket,
  Star,
  ArrowRight,
  Eye,
  RefreshCw,
  Trash2,
  Wallet,
  EyeOff,
} from "lucide-react";

import { api } from "../lib/api";
import ProductImage from "../components/ProductImage";
import { useToast } from "../lib/ToastContext";
import { useAuth } from "../lib/AuthContext";
import { PRODUCTS } from "../lib/data";

const PROFILE_IMAGE_KEY = "technova_profile_image";
const RECENTLY_VIEWED_KEY = "technova_recently_viewed";

/* =========================================================
   HELPERS
========================================================= */

function formatDate(dateString) {
  if (!dateString) return "N/A";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

/*
 * IMPORTANT:
 * Order item id and product id are NOT necessarily the same.
 */
function getProductId(item) {
  if (!item) return null;

  if (
    item.productId !== undefined &&
    item.productId !== null
  ) {
    return item.productId;
  }

  if (
    item.product_id !== undefined &&
    item.product_id !== null
  ) {
    return item.product_id;
  }

  if (
    item.product?.id !== undefined &&
    item.product?.id !== null
  ) {
    return item.product.id;
  }

  if (
    item.id !== undefined &&
    item.id !== null
  ) {
    return item.id;
  }

  return null;
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const config = {
    pending: {
      label: "Pending",
      className:
        "bg-amber-50 text-amber-600 border-amber-200",
    },

    paid: {
      label: "Paid",
      className:
        "bg-blue-50 text-blue-600 border-blue-200",
    },

    shipped: {
      label: "Shipped",
      className:
        "bg-indigo-50 text-indigo-600 border-indigo-200",
    },

    completed: {
      label: "Delivered",
      className:
        "bg-emerald-50 text-emerald-600 border-emerald-200",
    },

    cancelled: {
      label: "Cancelled",
      className:
        "bg-red-50 text-red-600 border-red-200",
    },
  };

  const current =
    config[String(status || "").toLowerCase()] ||
    config.pending;

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full border text-xs font-bold ${current.className}`}
    >
      {current.label}
    </span>
  );
}

/* =========================================================
   PROFILE PAGE
========================================================= */

export default function ProfilePage({
  setPage,
  wishlistProducts = [],
  recentlyViewed = [],
  openProduct,
  addToCart,
  products = [],
  onClearRecentlyViewed,
}) {
  const toast = useToast();
  const { logout } = useAuth();

  const fileInputRef = useRef(null);

  /*
   * "main" = dashboard
   * Other values = subpages inside this same ProfilePage
   */
  const [profileSection, setProfileSection] =
    useState("main");

  /* -------------------------------------------------------
     PROFILE
  ------------------------------------------------------- */

  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    createTime: null,

    /* SAVED SHIPPING INFORMATION */
    receiverName: "",
    receiverPhone: "",
    shippingStreet: "",
    shippingCity: "",
    shippingZip: "",

    /* SAVED PAYMENT INFORMATION */
    savedPaymentMethod: "",
    savedCardName: "",
    savedCardLast4: "",
    savedCardExpiry: "",
  });

  /* -------------------------------------------------------
     EDIT PROFILE
  ------------------------------------------------------- */

  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    dateOfBirth: "",
  });

  const [errors, setErrors] = useState({});

  /* -------------------------------------------------------
     ADDRESS FORM
  ------------------------------------------------------- */

  const [addressForm, setAddressForm] = useState({
    receiverName: "",
    receiverPhone: "",
    shippingStreet: "",
    shippingCity: "",
    shippingZip: "",
  });

  const [addressSaving, setAddressSaving] =
    useState(false);

  const [addressErrors, setAddressErrors] =
    useState({});

  const [showAddressForm, setShowAddressForm] =
    useState(false);

  /* -------------------------------------------------------
     PAYMENT FORM
  ------------------------------------------------------- */

const [paymentForm, setPaymentForm] = useState({
  method: "card",
  cardNumber: "",
  cardName: "",
  cardExpiry: "",
  cardCvc: "",
});

const [paymentSaving, setPaymentSaving] =
  useState(false);

const [paymentErrors, setPaymentErrors] =
  useState({});

const [showPaymentForm, setShowPaymentForm] =
  useState(false);

const [editingPayment, setEditingPayment] =
  useState(false);

const editPayment = () => {
  setEditingPayment(true);
  setPaymentErrors({});

  setPaymentForm({
    method: profile.savedPaymentMethod || "card",
    cardNumber: "",
    cardName: profile.savedCardName || "",
    cardExpiry: profile.savedCardExpiry || "",
    cardCvc: "",
  });

  setShowPaymentForm(true);
};

const addNewPayment = () => {
  setEditingPayment(false);
  setPaymentErrors({});

  setPaymentForm({
    method: "card",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvc: "",
  });

  setShowPaymentForm(true);
};
  /* -------------------------------------------------------
     PASSWORD FORM
  ------------------------------------------------------- */

  const [passwordForm, setPasswordForm] =
    useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

  const [passwordSaving, setPasswordSaving] =
    useState(false);

  const [passwordErrors, setPasswordErrors] =
    useState({});

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  /* -------------------------------------------------------
     PROFILE IMAGE
  ------------------------------------------------------- */

  const [profileImage, setProfileImage] =
    useState(null);

  /* -------------------------------------------------------
     ORDERS
  ------------------------------------------------------- */

  const [orders, setOrders] = useState([]);

  const [ordersLoading, setOrdersLoading] =
    useState(true);

  const [orderItems, setOrderItems] =
    useState({});

  const [itemsLoading, setItemsLoading] =
    useState(false);

  /* =========================================================
     CATALOG PRODUCTS
  ========================================================= */

  const catalogProducts = useMemo(() => {
    if (
      Array.isArray(products) &&
      products.length > 0
    ) {
      return products;
    }

    return Array.isArray(PRODUCTS)
      ? PRODUCTS
      : [];
  }, [products]);

  /* =========================================================
     LOAD PROFILE + ORDERS
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    /* -------------------------------------------------------
       Load profile image
    ------------------------------------------------------- */

    try {
      const savedImage =
        localStorage.getItem(
          PROFILE_IMAGE_KEY
        );

      if (savedImage && mounted) {
        setProfileImage(savedImage);
      }
    } catch (error) {
      console.warn(
        "Unable to load profile image.",
        error
      );
    }

    /* -------------------------------------------------------
       Load profile
    ------------------------------------------------------- */

    api
      .get("/users/me")
      .then((user) => {
        if (!mounted) return;

        const nextProfile = {
          firstName:
            user?.firstName ||
            user?.first_name ||
            "",

          lastName:
            user?.lastName ||
            user?.last_name ||
            "",

          username:
            user?.username || "",

          email:
            user?.email || "",

          phone:
            user?.phone || "",

          dateOfBirth:
            user?.dateOfBirth ||
            user?.date_of_birth ||
            "",

          createTime:
            user?.createTime || null,

          /* -------------------------------------------------
             SAVED SHIPPING INFORMATION
          ------------------------------------------------- */

          receiverName:
            user?.receiverName ||
            user?.receiver_name ||
            "",

          receiverPhone:
            user?.receiverPhone ||
            user?.receiver_phone ||
            "",

          shippingStreet:
            user?.shippingStreet ||
            user?.shipping_street ||
            "",

          shippingCity:
            user?.shippingCity ||
            user?.shipping_city ||
            "",

          shippingZip:
            user?.shippingZip ||
            user?.shipping_zip ||
            "",

          /* -------------------------------------------------
             SAVED PAYMENT INFORMATION
          ------------------------------------------------- */

          savedPaymentMethod:
            user?.savedPaymentMethod ||
            user?.saved_payment_method ||
            "",

          savedCardName:
            user?.savedCardName ||
            user?.saved_card_name ||
            "",

          savedCardLast4:
            user?.savedCardLast4 ||
            user?.saved_card_last4 ||
            "",

          savedCardExpiry:
            user?.savedCardExpiry ||
            user?.saved_card_expiry ||
            "",
        };

        setProfile(nextProfile);

        setFormData({
          firstName:
            nextProfile.firstName,

          lastName:
            nextProfile.lastName,

          username:
            nextProfile.username,

          email:
            nextProfile.email,

          phone:
            nextProfile.phone,

          dateOfBirth:
            nextProfile.dateOfBirth,
        });

        /* -------------------------------------------------
           Load saved address into editable form
        ------------------------------------------------- */

        setAddressForm({
          receiverName:
            nextProfile.receiverName,

          receiverPhone:
            nextProfile.receiverPhone,

          shippingStreet:
            nextProfile.shippingStreet,

          shippingCity:
            nextProfile.shippingCity,

          shippingZip:
            nextProfile.shippingZip,
        });

        /* -------------------------------------------------
           Load saved payment into editable form
        ------------------------------------------------- */

        setPaymentForm({
          method:
            nextProfile.savedPaymentMethod ||
            "card",

          cardNumber: "",

          cardName:
            nextProfile.savedCardName,

          cardExpiry:
            nextProfile.savedCardExpiry,

          cardCvc: "",
        });
      })
      .catch((err) => {
        if (mounted) {
          toast(
            err?.message ||
              "Unable to load your profile.",
            "warn"
          );
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    /* -------------------------------------------------------
       Load orders
    ------------------------------------------------------- */

    api
      .get("/orders")
      .then((data) => {
        if (!mounted) return;

        const nextOrders =
          Array.isArray(data)
            ? [...data]
            : [];

        nextOrders.sort((a, b) => {
          const dateA = new Date(
            a?.createTime || 0
          ).getTime();

          const dateB = new Date(
            b?.createTime || 0
          ).getTime();

          return dateB - dateA;
        });

        setOrders(nextOrders);
      })
      .catch((err) => {
        console.warn(
          "Unable to load orders.",
          err
        );
      })
      .finally(() => {
        if (mounted) {
          setOrdersLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [toast]);

  /* =========================================================
     LOAD ORDER ITEMS
  ========================================================= */

  useEffect(() => {
    if (!orders.length) {
      setOrderItems({});
      return;
    }

    let cancelled = false;

    const completedOrders =
      orders.filter(
        (order) =>
          String(
            order?.status || ""
          ).toLowerCase() ===
          "completed"
      );

    const recentOrders =
      orders.slice(0, 3);

    const neededOrders = [
      ...completedOrders,
      ...recentOrders,
    ];

    const uniqueOrders =
      Array.from(
        new Map(
          neededOrders.map(
            (order) => [
              order.id,
              order,
            ]
          )
        ).values()
      );

    if (!uniqueOrders.length) return;

    setItemsLoading(true);

    Promise.all(
      uniqueOrders.map(async (order) => {
        if (orderItems[order.id]) {
          return {
            id: order.id,
            items:
              orderItems[order.id],
          };
        }

        try {
          const items =
            await api.get(
              `/orders/${order.id}/items`
            );

          return {
            id: order.id,
            items:
              Array.isArray(items)
                ? items
                : [],
          };
        } catch (error) {
          console.warn(
            `Unable to load items for order ${order.id}`,
            error
          );

          return {
            id: order.id,
            items: [],
          };
        }
      })
    )
      .then((results) => {
        if (cancelled) return;

        setOrderItems(
          (previous) => {
            const next = {
              ...previous,
            };

            results.forEach(
              (result) => {
                next[result.id] =
                  result.items;
              }
            );

            return next;
          }
        );
      })
      .finally(() => {
        if (!cancelled) {
          setItemsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [orders]);

  /* =========================================================
     PROFILE IMAGE
  ========================================================= */

  const openImagePicker = () => {
    fileInputRef.current?.click();
  };

  const handleImageSelect = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      toast(
        "Please select a valid image file.",
        "warn"
      );

      event.target.value = "";
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      toast(
        "Profile image must be smaller than 5 MB.",
        "warn"
      );

      event.target.value = "";
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      const imageData =
        reader.result;

      setProfileImage(
        imageData
      );

      try {
        localStorage.setItem(
          PROFILE_IMAGE_KEY,
          imageData
        );

        toast(
          "Profile picture updated successfully."
        );
      } catch {
        toast(
          "Unable to save profile picture.",
          "warn"
        );
      }
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  };

  const handleRemoveImage = () => {
    if (
      !window.confirm(
        "Remove your profile picture?"
      )
    ) {
      return;
    }

    setProfileImage(null);

    try {
      localStorage.removeItem(
        PROFILE_IMAGE_KEY
      );
    } catch {
      // Ignore localStorage errors.
    }

    toast(
      "Profile picture removed.",
      "info"
    );
  };

  /* =========================================================
     PROFILE EDITING
  ========================================================= */

  const validate = () => {
    const newErrors = {};

    if (
      !formData.username.trim()
    ) {
      newErrors.username =
        "Username is required";
    } else if (
      formData.username.trim()
        .length < 3
    ) {
      newErrors.username =
        "Username must be at least 3 characters";
    }

    if (
      !formData.email.trim()
    ) {
      newErrors.email =
        "Email is required";
    } else if (
      !/^\S+@\S+\.\S+$/.test(
        formData.email.trim()
      )
    ) {
      newErrors.email =
        "Enter a valid email address";
    }

    if (
      formData.phone &&
      !/^\d{6,15}$/.test(
        formData.phone
      )
    ) {
      newErrors.phone =
        "Phone must contain 6-15 digits";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors)
        .length === 0
    );
  };

  const startEditing = () => {
    setFormData({
      firstName:
        profile.firstName || "",

      lastName:
        profile.lastName || "",

      username:
        profile.username || "",

      email:
        profile.email || "",

      phone:
        profile.phone || "",

      dateOfBirth:
        profile.dateOfBirth || "",
    });

    setErrors({});

    setProfileSection(
      "edit-profile"
    );
  };

  const cancelEditing = () => {
    setFormData({
      firstName:
        profile.firstName || "",

      lastName:
        profile.lastName || "",

      username:
        profile.username || "",

      email:
        profile.email || "",

      phone:
        profile.phone || "",

      dateOfBirth:
        profile.dateOfBirth || "",
    });

    setErrors({});

    setProfileSection("main");
  };

  const saveProfile = async () => {
    if (!validate()) {
      toast(
        "Please correct the highlighted fields.",
        "warn"
      );

      return;
    }

    setSaving(true);

    try {
      const payload = {
        username:
          formData.username.trim(),

        email:
          formData.email.trim(),

        phone:
          formData.phone.trim(),
      };

      const updated =
        await api.put(
          "/users/me",
          payload
        );

      const nextProfile = {
        ...profile,

        firstName:
          updated?.firstName ??
          updated?.first_name ??
          formData.firstName,

        lastName:
          updated?.lastName ??
          updated?.last_name ??
          formData.lastName,

        username:
          updated?.username ||
          formData.username.trim(),

        email:
          updated?.email ||
          formData.email.trim(),

        phone:
          updated?.phone ||
          formData.phone.trim(),

        dateOfBirth:
          updated?.dateOfBirth ??
          updated?.date_of_birth ??
          formData.dateOfBirth,

        createTime:
          profile.createTime,

        receiverName:
          updated?.receiverName ??
          updated?.receiver_name ??
          profile.receiverName,

        receiverPhone:
          updated?.receiverPhone ??
          updated?.receiver_phone ??
          profile.receiverPhone,

        shippingStreet:
          updated?.shippingStreet ??
          updated?.shipping_street ??
          profile.shippingStreet,

        shippingCity:
          updated?.shippingCity ??
          updated?.shipping_city ??
          profile.shippingCity,

        shippingZip:
          updated?.shippingZip ??
          updated?.shipping_zip ??
          profile.shippingZip,

        savedPaymentMethod:
          updated?.savedPaymentMethod ??
          updated?.saved_payment_method ??
          profile.savedPaymentMethod,

        savedCardName:
          updated?.savedCardName ??
          updated?.saved_card_name ??
          profile.savedCardName,

        savedCardLast4:
          updated?.savedCardLast4 ??
          updated?.saved_card_last4 ??
          profile.savedCardLast4,

        savedCardExpiry:
          updated?.savedCardExpiry ??
          updated?.saved_card_expiry ??
          profile.savedCardExpiry,
      };

      setProfile(
        nextProfile
      );

      setFormData({
        firstName:
          nextProfile.firstName,

        lastName:
          nextProfile.lastName,

        username:
          nextProfile.username,

        email:
          nextProfile.email,

        phone:
          nextProfile.phone,

        dateOfBirth:
          nextProfile.dateOfBirth,
      });

      setErrors({});

      setProfileSection(
        "main"
      );

      toast(
        "Profile updated successfully."
      );
    } catch (err) {
      toast(
        err?.message ||
          "Unable to update your profile.",
        "warn"
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     ADDRESS MANAGEMENT
  ========================================================= */

  const editAddress = () => {
    setAddressErrors({});

    setAddressForm({
      receiverName: profile.receiverName || "",
      receiverPhone: profile.receiverPhone || "",
      shippingStreet: profile.shippingStreet || "",
      shippingCity: profile.shippingCity || "",
      shippingZip: profile.shippingZip || "",
    });

    setShowAddressForm(true);
  };

  const addNewAddress = () => {
    setAddressErrors({});

    setAddressForm({
      receiverName: "",
      receiverPhone: "",
      shippingStreet: "",
      shippingCity: "",
      shippingZip: "",
    });

    setShowAddressForm(true);
  };

  const cancelAddressForm = () => {
    setAddressErrors({});

    setAddressForm({
      receiverName: profile.receiverName || "",
      receiverPhone: profile.receiverPhone || "",
      shippingStreet: profile.shippingStreet || "",
      shippingCity: profile.shippingCity || "",
      shippingZip: profile.shippingZip || "",
    });

    setShowAddressForm(false);
  };

  const validateAddress = () => {
    const newErrors = {};

    if (
      !addressForm.receiverName.trim()
    ) {
      newErrors.receiverName =
        "Receiver name is required";
    }

    if (
      !addressForm.receiverPhone.trim()
    ) {
      newErrors.receiverPhone =
        "Phone number is required";
    }

    if (
      !addressForm.shippingStreet.trim()
    ) {
      newErrors.shippingStreet =
        "Street address is required";
    }

    if (
      !addressForm.shippingCity.trim()
    ) {
      newErrors.shippingCity =
        "City is required";
    }

    if (
      !addressForm.shippingZip.trim()
    ) {
      newErrors.shippingZip =
        "ZIP code is required";
    }

    setAddressErrors(newErrors);

    return (
      Object.keys(newErrors)
        .length === 0
    );
  };

  const saveAddress = async () => {
    if (!validateAddress()) {
      toast(
        "Please complete the address fields.",
        "warn"
      );

      return;
    }

    setAddressSaving(true);

    try {
      const updated =
        await api.put(
          "/users/me/shipping-address",
          {
            receiverName:
              addressForm.receiverName.trim(),

            receiverPhone:
              addressForm.receiverPhone.trim(),

            shippingStreet:
              addressForm.shippingStreet.trim(),

            shippingCity:
              addressForm.shippingCity.trim(),

            shippingZip:
              addressForm.shippingZip.trim(),
          }
        );

      const nextProfile = {
        ...profile,

        receiverName:
          updated?.receiverName ??
          updated?.receiver_name ??
          addressForm.receiverName.trim(),

        receiverPhone:
          updated?.receiverPhone ??
          updated?.receiver_phone ??
          addressForm.receiverPhone.trim(),

        shippingStreet:
          updated?.shippingStreet ??
          updated?.shipping_street ??
          addressForm.shippingStreet.trim(),

        shippingCity:
          updated?.shippingCity ??
          updated?.shipping_city ??
          addressForm.shippingCity.trim(),

        shippingZip:
          updated?.shippingZip ??
          updated?.shipping_zip ??
          addressForm.shippingZip.trim(),
      };

      setProfile(
        nextProfile
      );

      setAddressForm({
        receiverName:
          nextProfile.receiverName,

        receiverPhone:
          nextProfile.receiverPhone,

        shippingStreet:
          nextProfile.shippingStreet,

        shippingCity:
          nextProfile.shippingCity,

        shippingZip:
          nextProfile.shippingZip,
      });

      setAddressErrors({});
      setShowAddressForm(false);

      toast(
        "Shipping address saved successfully."
      );
    } catch (err) {
      toast(
        err?.message ||
          "Unable to save your address.",
        "warn"
      );
    } finally {
      setAddressSaving(false);
    }
  };

  /* =========================================================
     PAYMENT MANAGEMENT
  ========================================================= */

  const openPaymentForm = () => {
    setPaymentErrors({});

    setPaymentForm({
      method:
        profile.savedPaymentMethod ||
        "card",

      cardNumber: "",

      cardName:
        profile.savedCardName || "",

      cardExpiry:
        profile.savedCardExpiry || "",

      cardCvc: "",
    });

    setShowPaymentForm(true);
  };

  const cancelPaymentForm = () => {
    setPaymentErrors({});

    setPaymentForm({
      method:
        profile.savedPaymentMethod ||
        "card",

      cardNumber: "",

      cardName:
        profile.savedCardName || "",

      cardExpiry:
        profile.savedCardExpiry || "",

      cardCvc: "",
    });

    setShowPaymentForm(false);
  };

  const validatePayment = () => {
    const newErrors = {};

    if (
      !paymentForm.method
    ) {
      newErrors.method =
        "Please select a payment method";
    }

    if (
      paymentForm.method ===
      "card"
    ) {
      const cleanCard =
        paymentForm.cardNumber.replace(
          /\s/g,
          ""
        );

      /*
       * When editing an existing card, the full
       * card number is intentionally NOT loaded.
       *
       * Therefore:
       * - empty card number = keep existing card
       * - entered card number = replace existing card
       */

      const hasExistingCard =
        profile.savedPaymentMethod ===
          "card" &&
        profile.savedCardLast4;

      if (
        !hasExistingCard &&
        cleanCard.length < 12
      ) {
        newErrors.cardNumber =
          "Please enter a valid card number";
      }

      if (
        paymentForm.cardNumber &&
        cleanCard.length < 12
      ) {
        newErrors.cardNumber =
          "Please enter a valid card number";
      }

      if (
        !paymentForm.cardName.trim()
      ) {
        newErrors.cardName =
          "Cardholder name is required";
      }

      if (
        !/^\d{2}\/\d{2}$/.test(
          paymentForm.cardExpiry
        )
      ) {
        newErrors.cardExpiry =
          "Use MM/YY format";
      }

      /*
       * CVC is required only when entering
       * a new card.
       */
      if (
        !hasExistingCard &&
        !/^\d{3,4}$/.test(
          paymentForm.cardCvc
        )
      ) {
        newErrors.cardCvc =
          "Enter a valid security code";
      }
    }

    setPaymentErrors(newErrors);

    return (
      Object.keys(newErrors)
        .length === 0
    );
  };

  const savePayment = async () => {
    if (!validatePayment()) {
      toast(
        "Please correct the payment information.",
        "warn"
      );

      return;
    }

    setPaymentSaving(true);

    try {
      let payload;

      if (
        paymentForm.method ===
        "card"
      ) {
        const cleanCard =
          paymentForm.cardNumber.replace(
            /\s/g,
            ""
          );

        /*
         * If no new full card number was entered,
         * keep the existing last four digits.
         *
         * The full card number and CVC are NEVER
         * sent to the backend for storage.
         */
        const last4 =
          cleanCard.length >= 4
            ? cleanCard.slice(-4)
            : profile.savedCardLast4;

        payload = {
          savedPaymentMethod:
            "card",

          savedCardName:
            paymentForm.cardName.trim(),

          savedCardLast4:
            last4,

          savedCardExpiry:
            paymentForm.cardExpiry.trim(),
        };
      } else {
        payload = {
          savedPaymentMethod:
            paymentForm.method,

          savedCardName: null,

          savedCardLast4: null,

          savedCardExpiry: null,
        };
      }

      const updated =
        await api.put(
          "/users/me/payment-details",
          payload
        );

      const nextProfile = {
        ...profile,

        savedPaymentMethod:
          updated?.savedPaymentMethod ??
          updated?.saved_payment_method ??
          payload.savedPaymentMethod,

        savedCardName:
          updated?.savedCardName ??
          updated?.saved_card_name ??
          payload.savedCardName ??
          "",

        savedCardLast4:
          updated?.savedCardLast4 ??
          updated?.saved_card_last4 ??
          payload.savedCardLast4 ??
          "",

        savedCardExpiry:
          updated?.savedCardExpiry ??
          updated?.saved_card_expiry ??
          payload.savedCardExpiry ??
          "",
      };

      setProfile(
        nextProfile
      );

      setPaymentForm({
        method:
          nextProfile.savedPaymentMethod ||
          "card",

        cardNumber: "",

        cardName:
          nextProfile.savedCardName,

        cardExpiry:
          nextProfile.savedCardExpiry,

        cardCvc: "",
      });

      setPaymentErrors({});
      setShowPaymentForm(false);

      toast(
        "Payment method saved successfully."
      );
    } catch (err) {
      toast(
        err?.message ||
          "Unable to save your payment method.",
        "warn"
      );
    } finally {
      setPaymentSaving(false);
    }
  };

  /* =========================================================
     PASSWORD MANAGEMENT
  ========================================================= */

  const validatePassword = () => {
    const newErrors = {};

    if (
      !passwordForm.currentPassword
    ) {
      newErrors.currentPassword =
        "Current password is required";
    }

    if (
      !passwordForm.newPassword
    ) {
      newErrors.newPassword =
        "New password is required";
    } else if (
      passwordForm.newPassword.length < 6
    ) {
      newErrors.newPassword =
        "New password must be at least 6 characters";
    }

    if (
      !passwordForm.confirmPassword
    ) {
      newErrors.confirmPassword =
        "Please confirm your new password";
    } else if (
      passwordForm.confirmPassword !==
      passwordForm.newPassword
    ) {
      newErrors.confirmPassword =
        "Passwords do not match";
    }

    setPasswordErrors(
      newErrors
    );

    return (
      Object.keys(newErrors)
        .length === 0
    );
  };

  const changePassword = async () => {
    if (!validatePassword()) {
      toast(
        "Please correct the password fields.",
        "warn"
      );

      return;
    }

    setPasswordSaving(true);

    try {
      await api.put(
        "/users/me/password",
        {
          currentPassword:
            passwordForm.currentPassword,

          newPassword:
            passwordForm.newPassword,
        }
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setPasswordErrors({});
      setProfileSection("main");
      toast(
        "Password changed successfully."
      );
    } catch (err) {
      toast(
        err?.message ||
          "Unable to change your password.",
        "warn"
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    if (
      !window.confirm(
        "Are you sure you want to sign out?"
      )
    ) {
      return;
    }

    logout();

    toast(
      "Logged out.",
      "info"
    );

    setPage("home");
  };

  /* =========================================================
     HELPERS
  ========================================================= */

  const getInitials = () => {
    const name =
      profile.firstName ||
      profile.username;

    if (!name) {
      return "U";
    }

    const fullName =
      [
        profile.firstName,
        profile.lastName,
      ]
        .filter(Boolean)
        .join(" ") ||
      profile.username;

    return fullName
      .trim()
      .split(/\s+/)
      .map(
        (word) => word[0]
      )
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const deliveredOrders =
    orders.filter(
      (order) =>
        String(
          order?.status || ""
        ).toLowerCase() ===
        "completed"
    ).length;

  const activeOrders =
    orders.filter((order) => {
      const status =
        String(
          order?.status || ""
        ).toLowerCase();

      return (
        status !==
          "completed" &&
        status !==
          "cancelled"
      );
    }).length;

  /* =========================================================
     WISHLIST COUNT
  ========================================================= */

  const wishlistCount =
    Array.isArray(
      wishlistProducts
    )
      ? wishlistProducts.length
      : 0;

  const couponCount = 0;
  const rewardPoints = 0;

  /* =========================================================
     RECENT ORDERS
  ========================================================= */

  const recentOrders =
    orders.slice(0, 3);

  /* =========================================================
     BUY AGAIN PRODUCTS
  ========================================================= */

  const buyAgainProducts =
    useMemo(() => {
      const result = [];
      const seen = new Set();

      orders
        .filter(
          (order) =>
            String(
              order?.status || ""
            ).toLowerCase() ===
            "completed"
        )
        .forEach((order) => {
          const items =
            orderItems[
              order.id
            ];

          if (
            !Array.isArray(
              items
            )
          ) {
            return;
          }

          items.forEach((item) => {
            const productId =
              getProductId(item);

            if (
              productId ===
                undefined ||
              productId === null
            ) {
              return;
            }

            const key =
              String(productId);

            if (
              seen.has(key)
            ) {
              return;
            }

            seen.add(key);

            const catalogProduct =
              catalogProducts.find(
                (product) =>
                  String(
                    product.id
                  ) === key
              );

            if (catalogProduct) {
              result.push({
                ...catalogProduct,
                productId,
              });

              return;
            }

            const fallback =
              item?.product ||
              item;

            if (!fallback) {
              return;
            }

            result.push({
              ...fallback,

              id:
                fallback.id ??
                productId,

              productId,

              name:
                fallback.name ||
                fallback.productName ||
                "Product",

              price:
                fallback.price ??
                fallback.unitPrice ??
                0,

              image:
                fallback.image ||
                fallback.productImage ||
                "",
            });
          });
        });

      return result;
    }, [
      orders,
      orderItems,
      catalogProducts,
    ]);

  /* =========================================================
     RECENTLY VIEWED PRODUCTS
  ========================================================= */

  const recentlyViewedProducts =
    useMemo(() => {
      if (
        !Array.isArray(
          recentlyViewed
        )
      ) {
        return [];
      }

      const result = [];

      recentlyViewed.forEach(
        (item) => {
          let product = null;

          if (
            typeof item ===
              "object" &&
            item !== null
          ) {
            const itemId =
              item.id ??
              item.productId;

            product =
              catalogProducts.find(
                (p) =>
                  String(p.id) ===
                  String(itemId)
              ) || item;
          } else {
            product =
              catalogProducts.find(
                (p) =>
                  String(p.id) ===
                  String(item)
              );
          }

          if (!product) {
            return;
          }

          const exists =
            result.some(
              (p) =>
                String(p.id) ===
                String(product.id)
            );

          if (!exists) {
            result.push(product);
          }
        }
      );

      return result.slice(0, 4);
    }, [
      recentlyViewed,
      catalogProducts,
    ]);

  /* =========================================================
     CLEAR RECENTLY VIEWED
  ========================================================= */

  const clearRecentlyViewed = () => {
    if (
      typeof onClearRecentlyViewed ===
      "function"
    ) {
      onClearRecentlyViewed();

      toast(
        "Recently viewed products cleared.",
        "info"
      );

      return;
    }

    try {
      localStorage.removeItem(
        RECENTLY_VIEWED_KEY
      );
    } catch {
      // Ignore storage errors.
    }

    window.dispatchEvent(
      new Event(
        "technova:recently-viewed-cleared"
      )
    );

    toast(
      "Recently viewed products cleared.",
      "info"
    );
  };

  /* =========================================================
     OPEN PRODUCT
  ========================================================= */

  const handleOpenProduct = (
    product
  ) => {
    const productId =
      product?.id ??
      product?.productId;

    if (
      productId ===
        undefined ||
      productId === null
    ) {
      toast(
        "Unable to open this product.",
        "warn"
      );

      return;
    }

    if (
      typeof openProduct ===
      "function"
    ) {
      openProduct(productId);
      return;
    }

    setPage("home");
  };

  /* =========================================================
     BUY AGAIN
  ========================================================= */

  const handleBuyAgain = async (
    product
  ) => {
    const productId =
      product?.productId ??
      product?.id;

    if (
      productId ===
        undefined ||
      productId === null
    ) {
      toast(
        "Unable to identify this product.",
        "warn"
      );

      return;
    }

    if (
      typeof addToCart !==
      "function"
    ) {
      toast(
        "Unable to add this product to your cart.",
        "warn"
      );

      return;
    }

    try {
      await addToCart(
        productId
      );

      setPage("cart");
    } catch (error) {
      console.warn(
        "Buy Again failed:",
        error
      );
    }
  };

  /* =========================================================
     VIEW ALL PRODUCTS
  ========================================================= */

  const handleViewAllProducts =
    () => {
      setPage("home");

      setTimeout(() => {
        document
          .getElementById(
            "catalog"
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 100);
    };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#2D3E8C]/10 flex items-center justify-center mx-auto">
            <Loader2
              size={25}
              className="text-[#2D3E8C] animate-spin"
            />
          </div>

          <h2 className="text-lg font-bold text-slate-800 mt-4">
            Loading your dashboard
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            Please wait a moment...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     PROFILE SUBPAGES
  ========================================================= */

  if (profileSection !== "main") {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* ===================================================
            BACK TO PROFILE
        ==================================================== */}

        <button
          type="button"
          onClick={() => {
            setErrors({});
            setAddressErrors({});
            setPaymentErrors({});
            setPasswordErrors({});
            setShowAddressForm(false);
            setShowPaymentForm(false);
            setProfileSection("main");
          }}
          className="inline-flex items-center gap-2 text-sm font-bold text-[#2D3E8C] hover:text-[#24316f] mb-5 transition"
        >
          ← Back to Profile
        </button>

        {/* ===================================================
            EDIT PROFILE
        ==================================================== */}

        {profileSection ===
          "edit-profile" && (
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">

            <div className="px-4 py-3.5 border-b border-slate-100">

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#2D3E8C]/10 flex items-center justify-center">
                  <User
                    size={15}
                    className="text-[#2D3E8C]"
                  />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Edit Profile
                  </h2>

                  <p className="text-xs text-slate-400 mt-0.5">
                    Update your personal information
                  </p>
                </div>
              </div>

            </div>

            <div className="p-4 sm:p-5">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* First Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    First Name
                  </label>

                  <input
                    type="text"
                    value={
                      formData.firstName ||
                      ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        firstName:
                          e.target.value,
                      })
                    }
                    placeholder="Enter your first name"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-300 outline-none focus:border-[#2D3E8C] focus:ring-2 focus:ring-[#2D3E8C]/10 transition"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Last Name
                  </label>

                  <input
                    type="text"
                    value={
                      formData.lastName ||
                      ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lastName:
                          e.target.value,
                      })
                    }
                    placeholder="Enter your last name"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-300 outline-none focus:border-[#2D3E8C] focus:ring-2 focus:ring-[#2D3E8C]/10 transition"
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Username
                  </label>

                  <input
                    type="text"
                    value={
                      formData.username ||
                      ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        username:
                          e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#2D3E8C]/10 transition ${
                      errors.username
                        ? "border-red-300 focus:border-red-400"
                        : "border-slate-200 focus:border-[#2D3E8C]"
                    }`}
                  />

                  {errors.username && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.username}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Email
                  </label>

                  <input
                    type="email"
                    value={
                      formData.email ||
                      ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email:
                          e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#2D3E8C]/10 transition ${
                      errors.email
                        ? "border-red-300 focus:border-red-400"
                        : "border-slate-200 focus:border-[#2D3E8C]"
                    }`}
                  />

                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Phone
                  </label>

                  <input
                    type="tel"
                    value={
                      formData.phone ||
                      ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone:
                          e.target.value,
                      })
                    }
                    placeholder="Enter phone number"
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm text-slate-800 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-[#2D3E8C]/10 transition ${
                      errors.phone
                        ? "border-red-300 focus:border-red-400"
                        : "border-slate-200 focus:border-[#2D3E8C]"
                    }`}
                  />

                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Date of Birth
                  </label>

                  <input
                    type="date"
                    value={
                      formData.dateOfBirth ||
                      ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dateOfBirth:
                          e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 outline-none focus:border-[#2D3E8C] focus:ring-2 focus:ring-[#2D3E8C]/10 transition"
                  />
                </div>

              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 mt-6 pt-4 border-t border-slate-100">

                <button
                  type="button"
                  onClick={
                    cancelEditing
                  }
                  disabled={saving}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    saveProfile
                  }
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#2D3E8C] text-white text-sm font-semibold hover:bg-[#24316f] transition disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={14}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      Save Changes
                    </>
                  )}
                </button>

              </div>

            </div>

          </section>
        )}

        {/* ===================================================
            ADDRESSES
        ==================================================== */}

        {profileSection ===
          "addresses" && (
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">

            <div className="px-5 py-4 border-b border-slate-100">

              <div className="flex items-center justify-between gap-3">

                <div className="flex items-center gap-3">

                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                    <MapPin
                      size={17}
                      className="text-blue-500"
                    />
                  </div>

                  <div>
                    <h1 className="text-lg font-bold text-slate-900">
                      My Addresses
                    </h1>

                    <p className="text-sm text-slate-400 mt-1">
                      Manage your delivery addresses
                    </p>
                  </div>

                </div>

{/*
{!showAddressForm && (
  <button
    type="button"
    onClick={editAddress}
    className="hidden sm:inline-flex px-4 py-2.5 rounded-lg bg-[#2D3E8C] text-white text-sm font-bold hover:bg-[#24316f] transition"
  >
    + Add New Address
  </button>
)}
*/}

              </div>

            </div>

            <div className="p-5">

              {/* ADDRESS FORM */}

              {showAddressForm ? (
                <div className="border border-blue-100 bg-blue-50/40 rounded-xl p-4">

                  <div className="flex items-center gap-2 mb-4">

                    <MapPin
                      size={16}
                      className="text-blue-500"
                    />

                    <h2 className="text-sm font-bold text-slate-900">
                      {profile.receiverName ||
                      profile.shippingStreet
                        ? "Edit Address"
                        : "Add New Address"}
                    </h2>

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* Receiver Name */}

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Receiver Name
                      </label>

                      <input
                        type="text"
                        value={
                          addressForm.receiverName
                        }
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            receiverName:
                              e.target.value,
                          })
                        }
                        placeholder="Full name"
                        className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-[#2D3E8C]/10 ${
                          addressErrors.receiverName
                            ? "border-red-300"
                            : "border-slate-200 focus:border-[#2D3E8C]"
                        }`}
                      />

                      {addressErrors.receiverName && (
                        <p className="text-xs text-red-500 mt-1">
                          {
                            addressErrors.receiverName
                          }
                        </p>
                      )}
                    </div>

                    {/* Phone */}

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Phone
                      </label>

                      <input
                        type="tel"
                        value={
                          addressForm.receiverPhone
                        }
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            receiverPhone:
                              e.target.value,
                          })
                        }
                        placeholder="Phone number"
                        className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-[#2D3E8C]/10 ${
                          addressErrors.receiverPhone
                            ? "border-red-300"
                            : "border-slate-200 focus:border-[#2D3E8C]"
                        }`}
                      />

                      {addressErrors.receiverPhone && (
                        <p className="text-xs text-red-500 mt-1">
                          {
                            addressErrors.receiverPhone
                          }
                        </p>
                      )}
                    </div>

                    {/* Street */}

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Street Address
                      </label>

                      <input
                        type="text"
                        value={
                          addressForm.shippingStreet
                        }
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            shippingStreet:
                              e.target.value,
                          })
                        }
                        placeholder="Street address"
                        className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-[#2D3E8C]/10 ${
                          addressErrors.shippingStreet
                            ? "border-red-300"
                            : "border-slate-200 focus:border-[#2D3E8C]"
                        }`}
                      />

                      {addressErrors.shippingStreet && (
                        <p className="text-xs text-red-500 mt-1">
                          {
                            addressErrors.shippingStreet
                          }
                        </p>
                      )}
                    </div>

                    {/* City */}

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        City
                      </label>

                      <input
                        type="text"
                        value={
                          addressForm.shippingCity
                        }
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            shippingCity:
                              e.target.value,
                          })
                        }
                        placeholder="City"
                        className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-[#2D3E8C]/10 ${
                          addressErrors.shippingCity
                            ? "border-red-300"
                            : "border-slate-200 focus:border-[#2D3E8C]"
                        }`}
                      />

                      {addressErrors.shippingCity && (
                        <p className="text-xs text-red-500 mt-1">
                          {
                            addressErrors.shippingCity
                          }
                        </p>
                      )}
                    </div>

                    {/* ZIP */}

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        ZIP Code
                      </label>

                      <input
                        type="text"
                        value={
                          addressForm.shippingZip
                        }
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            shippingZip:
                              e.target.value,
                          })
                        }
                        placeholder="ZIP code"
                        className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-[#2D3E8C]/10 ${
                          addressErrors.shippingZip
                            ? "border-red-300"
                            : "border-slate-200 focus:border-[#2D3E8C]"
                        }`}
                      />

                      {addressErrors.shippingZip && (
                        <p className="text-xs text-red-500 mt-1">
                          {
                            addressErrors.shippingZip
                          }
                        </p>
                      )}
                    </div>

                  </div>

                  <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-blue-100">

                    <button
                      type="button"
                      onClick={cancelAddressForm}
                      disabled={
                        addressSaving
                      }
                      className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={
                        saveAddress
                      }
                      disabled={
                        addressSaving
                      }
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2D3E8C] text-white text-sm font-bold hover:bg-[#24316f] transition disabled:opacity-50"
                    >
                      {addressSaving ? (
                        <>
                          <Loader2
                            size={14}
                            className="animate-spin"
                          />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check
                            size={14}
                          />
                          Save Address
                        </>
                      )}
                    </button>

                  </div>

                </div>
              ) : profile.shippingStreet ||
                profile.shippingCity ||
                profile.shippingZip ||
                profile.receiverName ? (
                <div>

                  <div className="border border-slate-200 rounded-xl p-4">

                    <div className="flex items-start gap-3">

                      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <MapPin
                          size={16}
                          className="text-blue-500"
                        />
                      </div>

                      <div className="flex-1 min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="text-sm font-bold text-slate-900">
                            {profile.receiverName ||
                              "Shipping Address"}
                          </h3>

                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                            Saved
                          </span>

                        </div>

                        {profile.receiverPhone && (
                          <p className="text-xs text-slate-400 mt-1">
                            {profile.receiverPhone}
                          </p>
                        )}

                        <div className="text-sm text-slate-600 mt-2 leading-6">

                          {profile.shippingStreet && (
                            <div>
                              {
                                profile.shippingStreet
                              }
                            </div>
                          )}

                          {(profile.shippingCity ||
                            profile.shippingZip) && (
                            <div>
                              {
                                profile.shippingCity
                              }

                              {profile.shippingCity &&
                              profile.shippingZip
                                ? ", "
                                : ""}

                              {
                                profile.shippingZip
                              }
                            </div>
                          )}

                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={editAddress}
                        className="text-xs font-bold text-[#2D3E8C] hover:underline flex-shrink-0"
                      >
                        Edit
                      </button>

                    </div>

                  </div>

                </div>
              ) : (
                <div>

                  <button
                    type="button"
                    onClick={
                      addNewAddress
                    }
                    className="sm:hidden w-full px-4 py-2.5 rounded-lg bg-[#2D3E8C] text-white text-sm font-bold hover:bg-[#24316f] transition mb-5"
                  >
                    + Add New Address
                  </button>

                  <div className="p-6 rounded-lg border border-dashed border-slate-300 text-center">

                    <MapPin
                      size={24}
                      className="mx-auto text-slate-300"
                    />

                    <p className="text-sm font-semibold text-slate-500 mt-2">
                      No addresses added yet.
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      Your checkout address will appear here.
                    </p>

                  </div>

                </div>
              )}

            </div>

          </section>
        )}
        {/* ===================================================
            PAYMENT METHODS
        ==================================================== */}

        {profileSection === "payment-methods" && (
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">

            <div className="px-5 py-4 border-b border-slate-100">

              <div className="flex items-center justify-between gap-3">

                <div className="flex items-center gap-3">

                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <CreditCard
                      size={17}
                      className="text-emerald-500"
                    />
                  </div>

                  <div>
                    <h1 className="text-lg font-bold text-slate-900">
                      Payment Methods
                    </h1>

                    <p className="text-sm text-slate-400 mt-1">
                      Manage your saved payment methods
                    </p>
                  </div>

                </div>

                {!showPaymentForm && (
                  <button
                    type="button"
                    onClick={editPayment}
                    className="hidden sm:inline-flex px-4 py-2.5 rounded-lg bg-[#2D3E8C] text-white text-sm font-bold hover:bg-[#24316f] transition"
                  >
                    + Add Payment Method
                  </button>
                )}

              </div>

            </div>

            <div className="p-5">

              {/* =================================================
                  PAYMENT FORM
              ================================================= */}

              {showPaymentForm ? (
                <div className="border border-emerald-100 bg-emerald-50/40 rounded-xl p-4">

                  <div className="flex items-center gap-2 mb-4">

                    <CreditCard
                      size={16}
                      className="text-emerald-500"
                    />

                    <h2 className="text-sm font-bold text-slate-900">
                      {editingPayment
                        ? "Edit Payment Method"
                        : "Add Payment Method"}
                    </h2>

                  </div>

                  {/* =================================================
                      METHOD
                  ================================================= */}

                  <div className="mb-4">

                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Payment Method
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">

                      {/* CARD */}

                      <button
                        type="button"
                        onClick={() =>
                          setPaymentForm({
                            ...paymentForm,
                            method: "card",
                          })
                        }
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-semibold text-left transition ${
                          paymentForm.method === "card"
                            ? "border-[#2D3E8C] bg-white text-[#2D3E8C]"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <CreditCard size={15} />
                        Card
                      </button>

                      {/* WALLET */}

                      <button
                        type="button"
                        onClick={() =>
                          setPaymentForm({
                            ...paymentForm,
                            method: "wallet",
                          })
                        }
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-semibold text-left transition ${
                          paymentForm.method === "wallet"
                            ? "border-[#2D3E8C] bg-white text-[#2D3E8C]"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <Wallet size={15} />
                        Wallet
                      </button>

                      {/* CASH ON DELIVERY */}

                      <button
                        type="button"
                        onClick={() =>
                          setPaymentForm({
                            ...paymentForm,
                            method: "cod",
                          })
                        }
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-semibold text-left transition ${
                          paymentForm.method === "cod"
                            ? "border-[#2D3E8C] bg-white text-[#2D3E8C]"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <Package size={15} />
                        Cash on Delivery
                      </button>

                    </div>

                  </div>

                  {/* =================================================
                      CARD FIELDS
                  ================================================= */}

                  {paymentForm.method === "card" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      {/* CARD NUMBER */}

                      <div className="sm:col-span-2">

                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Card Number
                        </label>

                        {editingPayment &&
                        profile.savedPaymentMethod === "card" &&
                        profile.savedCardLast4 ? (
                          <div className="mb-2 p-3 rounded-lg bg-white border border-emerald-200">

                            <div className="flex items-center gap-2">

                              <CreditCard
                                size={15}
                                className="text-emerald-500"
                              />

                              <div>

                                <div className="text-sm font-bold text-slate-800">
                                  •••• •••• ••••{" "}
                                  {profile.savedCardLast4}
                                </div>

                                <div className="text-xs text-slate-400 mt-0.5">
                                  Leave blank to keep this card
                                </div>

                              </div>

                            </div>

                          </div>
                        ) : null}

                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="off"
                          value={paymentForm.cardNumber}
                          onChange={(e) =>
                            setPaymentForm({
                              ...paymentForm,
                              cardNumber: e.target.value,
                            })
                          }
                          placeholder={
                            editingPayment &&
                            profile.savedPaymentMethod === "card" &&
                            profile.savedCardLast4
                              ? "Enter a new card number only if replacing the saved card"
                              : "Enter card number"
                          }
                          className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-[#2D3E8C]/10 ${
                            paymentErrors.cardNumber
                              ? "border-red-300"
                              : "border-slate-200 focus:border-[#2D3E8C]"
                          }`}
                        />

                        <p className="text-[11px] text-slate-400 mt-1">
                          Your full card number is never stored in TechNova.
                        </p>

                        {paymentErrors.cardNumber && (
                          <p className="text-xs text-red-500 mt-1">
                            {paymentErrors.cardNumber}
                          </p>
                        )}

                      </div>

                      {/* CARDHOLDER NAME */}

                      <div>

                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Cardholder Name
                        </label>

                        <input
                          type="text"
                          value={paymentForm.cardName}
                          onChange={(e) =>
                            setPaymentForm({
                              ...paymentForm,
                              cardName: e.target.value,
                            })
                          }
                          placeholder="Name on card"
                          className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-[#2D3E8C]/10 ${
                            paymentErrors.cardName
                              ? "border-red-300"
                              : "border-slate-200 focus:border-[#2D3E8C]"
                          }`}
                        />

                        {paymentErrors.cardName && (
                          <p className="text-xs text-red-500 mt-1">
                            {paymentErrors.cardName}
                          </p>
                        )}

                      </div>

                      {/* EXPIRY */}

                      <div>

                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Expiry
                        </label>

                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={5}
                          value={paymentForm.cardExpiry}
                          onChange={(e) =>
                            setPaymentForm({
                              ...paymentForm,
                              cardExpiry: e.target.value,
                            })
                          }
                          placeholder="MM/YY"
                          className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-[#2D3E8C]/10 ${
                            paymentErrors.cardExpiry
                              ? "border-red-300"
                              : "border-slate-200 focus:border-[#2D3E8C]"
                          }`}
                        />

                        {paymentErrors.cardExpiry && (
                          <p className="text-xs text-red-500 mt-1">
                            {paymentErrors.cardExpiry}
                          </p>
                        )}

                      </div>

                      {/* CVC */}

                      <div>

                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Security Code
                        </label>

                        <input
                          type="password"
                          inputMode="numeric"
                          maxLength={4}
                          autoComplete="off"
                          value={paymentForm.cardCvc}
                          onChange={(e) =>
                            setPaymentForm({
                              ...paymentForm,
                              cardCvc: e.target.value,
                            })
                          }
                          placeholder={
                            editingPayment &&
                            profile.savedPaymentMethod === "card" &&
                            profile.savedCardLast4
                              ? "Only needed for a new card"
                              : "CVC"
                          }
                          className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-[#2D3E8C]/10 ${
                            paymentErrors.cardCvc
                              ? "border-red-300"
                              : "border-slate-200 focus:border-[#2D3E8C]"
                          }`}
                        />

                        <p className="text-[11px] text-slate-400 mt-1">
                          CVC is never stored.
                        </p>

                        {paymentErrors.cardCvc && (
                          <p className="text-xs text-red-500 mt-1">
                            {paymentErrors.cardCvc}
                          </p>
                        )}

                      </div>

                    </div>
                  )}

                  {/* =================================================
                      WALLET
                  ================================================= */}

                  {paymentForm.method === "wallet" && (
                    <div className="p-4 bg-white border border-slate-200 rounded-lg">

                      <div className="flex items-center gap-3">

                        <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                          <Wallet
                            size={17}
                            className="text-emerald-500"
                          />
                        </div>

                        <div>

                          <p className="text-sm font-bold text-slate-800">
                            Digital Wallet
                          </p>

                          <p className="text-xs text-slate-400 mt-0.5">
                            Save digital wallet as your preferred payment method.
                          </p>

                        </div>

                      </div>

                    </div>
                  )}

                  {/* =================================================
                      CASH ON DELIVERY
                  ================================================= */}

                  {paymentForm.method === "cod" && (
                    <div className="p-4 bg-white border border-slate-200 rounded-lg">

                      <div className="flex items-center gap-3">

                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Package
                            size={17}
                            className="text-blue-500"
                          />
                        </div>

                        <div>

                          <p className="text-sm font-bold text-slate-800">
                            Cash on Delivery
                          </p>

                          <p className="text-xs text-slate-400 mt-0.5">
                            Save cash on delivery as your preferred payment method.
                          </p>

                        </div>

                      </div>

                    </div>
                  )}

                  {/* =================================================
                      ACTION BUTTONS
                  ================================================= */}

                  <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-emerald-100">

                    <button
                      type="button"
                      onClick={cancelPaymentForm}
                      disabled={paymentSaving}
                      className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={savePayment}
                      disabled={paymentSaving}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2D3E8C] text-white text-sm font-bold hover:bg-[#24316f] transition disabled:opacity-50"
                    >
                      {paymentSaving ? (
                        <>
                          <Loader2
                            size={14}
                            className="animate-spin"
                          />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check size={14} />
                          Save Payment Method
                        </>
                      )}
                    </button>

                  </div>

                </div>

              ) : profile.savedPaymentMethod ? (

                /* =================================================
                   EXISTING SAVED PAYMENT
                ================================================= */

                <div>

                  {/* MOBILE ADD BUTTON */}

                  <button
                    type="button"
                    onClick={addNewPayment}
                    className="sm:hidden w-full px-4 py-2.5 rounded-lg bg-[#2D3E8C] text-white text-sm font-bold hover:bg-[#24316f] transition mb-5"
                  >
                    + Add Payment Method
                  </button>

                  <div className="border border-slate-200 rounded-xl p-4">

                    <div className="flex items-start gap-3">

                      <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">

                        {profile.savedPaymentMethod === "wallet" ? (
                          <Wallet
                            size={17}
                            className="text-emerald-500"
                          />
                        ) : (
                          <CreditCard
                            size={17}
                            className="text-emerald-500"
                          />
                        )}

                      </div>

                      <div className="flex-1 min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="text-sm font-bold text-slate-900">
                            {profile.savedPaymentMethod === "card"
                              ? "Credit / Debit Card"
                              : profile.savedPaymentMethod === "wallet"
                              ? "Digital Wallet"
                              : profile.savedPaymentMethod === "cod"
                              ? "Cash on Delivery"
                              : "Saved Payment Method"}
                          </h3>

                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                            Saved
                          </span>

                        </div>

                        {profile.savedPaymentMethod === "card" && (
                          <>

                            <p className="text-sm font-semibold text-slate-700 mt-2">
                              •••• •••• ••••{" "}
                              {profile.savedCardLast4 || "----"}
                            </p>

                            {profile.savedCardName && (
                              <p className="text-xs text-slate-400 mt-1">
                                {profile.savedCardName}
                              </p>
                            )}

                            {profile.savedCardExpiry && (
                              <p className="text-xs text-slate-400 mt-1">
                                Expires {profile.savedCardExpiry}
                              </p>
                            )}

                          </>
                        )}

                        {profile.savedPaymentMethod === "wallet" && (
                          <p className="text-xs text-slate-400 mt-2">
                            Digital wallet saved for checkout.
                          </p>
                        )}

                        {profile.savedPaymentMethod === "cod" && (
                          <p className="text-xs text-slate-400 mt-2">
                            Cash on delivery selected.
                          </p>
                        )}

                      </div>

                      {/* EDIT */}

                      <button
                        type="button"
                        onClick={editPayment}
                        className="text-xs font-bold text-[#2D3E8C] hover:underline flex-shrink-0"
                      >
                        Edit
                      </button>

                    </div>

                  </div>

                </div>

              ) : (

                /* =================================================
                   NO PAYMENT METHOD
                ================================================= */

                <div>

                  <button
                    type="button"
                    onClick={addNewPayment}
                    className="sm:hidden w-full px-4 py-2.5 rounded-lg bg-[#2D3E8C] text-white text-sm font-bold hover:bg-[#24316f] transition mb-5"
                  >
                    + Add Payment Method
                  </button>

                  <div className="p-6 rounded-lg border border-dashed border-slate-300 text-center">

                    <CreditCard
                      size={24}
                      className="mx-auto text-slate-300"
                    />

                    <p className="text-sm font-semibold text-slate-500 mt-2">
                      No payment methods added yet.
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      Your saved payment methods will appear here.
                    </p>

                  </div>

                </div>
              )}

            </div>

          </section>
        )}



        {/* ===================================================
            SECURITY
        ==================================================== */}

        {profileSection ===
          "security" && (
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">

            <div className="px-5 py-4 border-b border-slate-100">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Lock
                    size={17}
                    className="text-purple-500"
                  />
                </div>

                <div>
                  <h1 className="text-lg font-bold text-slate-900">
                    Security
                  </h1>

                  <p className="text-sm text-slate-400 mt-1">
                    Manage your password and account security
                  </p>
                </div>

              </div>

            </div>

            <div className="p-5">

              {/* CHANGE PASSWORD */}

              <div className="py-4 border-b border-slate-100">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Password
                    </h3>

                    <p className="text-sm text-slate-400 mt-1">
                      Change your account password
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPasswordErrors(
                        {}
                      );

                      setPasswordForm({
                        currentPassword:
                          "",
                        newPassword: "",
                        confirmPassword:
                          "",
                      });
                    }}
                    className="self-start sm:self-auto px-4 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Change Password
                  </button>

                </div>

                <div className="mt-5 p-4 bg-slate-50 border border-slate-200 rounded-xl">

                  <div className="grid grid-cols-1 gap-4">

                    {/* Current Password */}

                    <div>

                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Current Password
                      </label>

                      <div className="relative">

                        <input
                          type={
                            showCurrentPassword
                              ? "text"
                              : "password"
                          }
                          value={
                            passwordForm.currentPassword
                          }
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              currentPassword:
                                e.target.value,
                            })
                          }
                          autoComplete="current-password"
                          className={`w-full px-3 py-2.5 pr-10 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-[#2D3E8C]/10 ${
                            passwordErrors.currentPassword
                              ? "border-red-300"
                              : "border-slate-200 focus:border-[#2D3E8C]"
                          }`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(
                              !showCurrentPassword
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showCurrentPassword ? (
                            <EyeOff
                              size={15}
                            />
                          ) : (
                            <Eye
                              size={15}
                            />
                          )}
                        </button>

                      </div>

                      {passwordErrors.currentPassword && (
                        <p className="text-xs text-red-500 mt-1">
                          {
                            passwordErrors.currentPassword
                          }
                        </p>
                      )}

                    </div>

                    {/* New Password */}

                    <div>

                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        New Password
                      </label>

                      <div className="relative">

                        <input
                          type={
                            showNewPassword
                              ? "text"
                              : "password"
                          }
                          value={
                            passwordForm.newPassword
                          }
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              newPassword:
                                e.target.value,
                            })
                          }
                          autoComplete="new-password"
                          className={`w-full px-3 py-2.5 pr-10 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-[#2D3E8C]/10 ${
                            passwordErrors.newPassword
                              ? "border-red-300"
                              : "border-slate-200 focus:border-[#2D3E8C]"
                          }`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowNewPassword(
                              !showNewPassword
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showNewPassword ? (
                            <EyeOff
                              size={15}
                            />
                          ) : (
                            <Eye
                              size={15}
                            />
                          )}
                        </button>

                      </div>

                      {passwordErrors.newPassword && (
                        <p className="text-xs text-red-500 mt-1">
                          {
                            passwordErrors.newPassword
                          }
                        </p>
                      )}

                    </div>

                    {/* Confirm Password */}

                    <div>

                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Confirm New Password
                      </label>

                      <div className="relative">

                        <input
                          type={
                            showConfirmPassword
                              ? "text"
                              : "password"
                          }
                          value={
                            passwordForm.confirmPassword
                          }
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              confirmPassword:
                                e.target.value,
                            })
                          }
                          autoComplete="new-password"
                          className={`w-full px-3 py-2.5 pr-10 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-[#2D3E8C]/10 ${
                            passwordErrors.confirmPassword
                              ? "border-red-300"
                              : "border-slate-200 focus:border-[#2D3E8C]"
                          }`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(
                              !showConfirmPassword
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? (
                            <EyeOff
                              size={15}
                            />
                          ) : (
                            <Eye
                              size={15}
                            />
                          )}
                        </button>

                      </div>

                      {passwordErrors.confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">
                          {
                            passwordErrors.confirmPassword
                          }
                        </p>
                      )}

                    </div>

                  </div>

                  <div className="flex justify-end mt-4">

                    <button
                      type="button"
                      onClick={
                        changePassword
                      }
                      disabled={
                        passwordSaving
                      }
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2D3E8C] text-white text-sm font-bold hover:bg-[#24316f] transition disabled:opacity-50"
                    >
                      {passwordSaving ? (
                        <>
                          <Loader2
                            size={14}
                            className="animate-spin"
                          />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Lock
                            size={14}
                          />
                          Update Password
                        </>
                      )}
                    </button>

                  </div>

                </div>

              </div>

              {/* TWO FACTOR */}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4">

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Two-Factor Authentication
                  </h3>

                  <p className="text-sm text-slate-400 mt-1">
                    Add an extra layer of protection to your account
                  </p>
                </div>

                <span className="text-xs font-bold text-slate-400">
                  Not configured
                </span>

              </div>

            </div>

          </section>
        )}

        {/* ===================================================
            NOTIFICATIONS
        ==================================================== */}

        {profileSection ===
          "notifications" && (
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">

            <div className="px-5 py-4 border-b border-slate-100">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Bell
                    size={17}
                    className="text-amber-500"
                  />
                </div>

                <div>
                  <h1 className="text-lg font-bold text-slate-900">
                    Notifications
                  </h1>

                  <p className="text-sm text-slate-400 mt-1">
                    Choose which notifications you want to receive
                  </p>
                </div>

              </div>

            </div>

            <div className="divide-y divide-slate-100">

              <div className="flex items-center justify-between gap-4 px-5 py-4">

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Order Updates
                  </h3>

                  <p className="text-sm text-slate-400 mt-1">
                    Get updates about your orders
                  </p>
                </div>

                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 accent-[#2D3E8C] flex-shrink-0"
                />

              </div>

              <div className="flex items-center justify-between gap-4 px-5 py-4">

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Promotions
                  </h3>

                  <p className="text-sm text-slate-400 mt-1">
                    Receive offers and promotional notifications
                  </p>
                </div>

                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 accent-[#2D3E8C] flex-shrink-0"
                />

              </div>

              <div className="flex items-center justify-between gap-4 px-5 py-4">

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Wishlist Alerts
                  </h3>

                  <p className="text-sm text-slate-400 mt-1">
                    Get notified about wishlist products
                  </p>
                </div>

                <input
                  type="checkbox"
                  className="w-4 h-4 accent-[#2D3E8C] flex-shrink-0"
                />

              </div>

            </div>

          </section>
        )}

      </div>
    );
  }

  /* =========================================================
     MAIN DASHBOARD
  ========================================================= */

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

      {/* =====================================================
          WELCOME HEADER
      ====================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">

        <div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back,{" "}
            {profile.username ||
              "User"}{" "}
            👋
          </h1>

          <p className="text-sm text-slate-400 mt-1">
            Here's what's happening with
            your account today.
          </p>

        </div>

        <button
          type="button"
          onClick={
            handleViewAllProducts
          }
          className="self-start sm:self-auto inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-all duration-200"
          onMouseEnter={(event) => {
            event.currentTarget.style.borderColor =
              "#93C5FD";
            event.currentTarget.style.background =
              "#EFF6FF";
            event.currentTarget.style.color =
              "#2563EB";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.borderColor =
              "#E2E8F0";
            event.currentTarget.style.background =
              "#FFFFFF";
            event.currentTarget.style.color =
              "#334155";
          }}
        >
          <span
            style={{
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ←
          </span>

          <span>
            Continue shopping
          </span>
        </button>

      </div>

      {/* =====================================================
          PROFILE SUMMARY
      ====================================================== */}

      <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

        <div className="p-4 sm:p-5">

          <div className="flex flex-col md:flex-row md:items-center gap-5">

            <div className="relative flex-shrink-0">

              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-white border border-slate-200 shadow-sm">

                {profileImage ? (
                  <img
                    src={
                      profileImage
                    }
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-[#5266D8] to-[#2D3E8C] flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
                    {getInitials()}
                  </div>
                )}

              </div>

              <button
                type="button"
                onClick={
                  openImagePicker
                }
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-[#2D3E8C] transition"
                title="Change profile photo"
              >
                <Camera size={12} />
              </button>

              {profileImage && (
                <button
                  type="button"
                  onClick={
                    handleRemoveImage
                  }
                  className="hidden absolute top-0 right-0 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm items-center justify-center text-red-400 hover:text-red-600 transition"
                  title="Remove profile photo"
                >
                  <Trash2 size={10} />
                </button>
              )}

              <input
                ref={
                  fileInputRef
                }
                type="file"
                accept="image/*"
                onChange={
                  handleImageSelect
                }
                className="hidden"
              />

            </div>

            <div className="flex-1 min-w-0">

              <div className="flex items-center gap-2">

                <h2 className="text-lg font-bold text-slate-900">
                  {profile.username ||
                    "User"}
                </h2>

                <span className="w-4 h-4 rounded-full bg-[#2D3E8C] text-white flex items-center justify-center">
                  <Check size={10} />
                </span>

              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-1.5">

                <span className="flex items-center gap-1.5 text-sm text-slate-400">
                  <Mail size={12} />
                  {profile.email ||
                    "No email"}
                </span>

                {profile.phone && (
                  <span className="flex items-center gap-1.5 text-sm text-slate-400">
                    <Phone size={12} />
                    {profile.phone}
                  </span>
                )}

              </div>

              <div className="flex items-center gap-1.5 text-sm text-slate-400 mt-2">
                <Calendar size={11} />
                Member since{" "}
                {formatDate(
                  profile.createTime
                )}
              </div>

            </div>

            <button
              type="button"
              onClick={
                startEditing
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#8A78FF]/40 text-sm font-bold text-[#6B5CE7] hover:bg-[#8A78FF]/5 transition"
            >
              <Edit2 size={12} />
              Edit Profile
            </button>

          </div>

        </div>

      </section>

      {/* =====================================================
          STAT CARDS
      ====================================================== */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">

        {/* MY ORDERS */}

        <button
          type="button"
          onClick={() =>
            setPage("orders")
          }
          className="group text-left bg-white border border-slate-200 rounded-xl p-3.5 hover:border-[#2D3E8C]/30 hover:shadow-sm transition"
        >

          <div className="flex items-start justify-between">

            <div className="w-8 h-8 rounded-lg bg-[#2D3E8C]/10 flex items-center justify-center">
              <Package
                size={15}
                className="text-[#2D3E8C]"
              />
            </div>

            <ChevronRight
              size={13}
              className="text-slate-300 group-hover:text-[#2D3E8C]"
            />

          </div>

          <div className="text-xs text-slate-400 mt-2.5">
            My Orders
          </div>

          <div className="text-lg font-bold text-slate-900">
            {orders.length}
          </div>

          <div className="text-[11px] text-[#2D3E8C] mt-0.5">
            View all orders →
          </div>

        </button>

        {/* WISHLIST */}

        <button
          type="button"
          onClick={() =>
            setPage("wishlist")
          }
          className="group text-left bg-white border border-slate-200 rounded-xl p-3.5 hover:border-red-200 hover:shadow-sm transition"
        >

          <div className="flex items-start justify-between">

            <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
              <Heart
                size={15}
                className="text-pink-500 fill-pink-500"
              />
            </div>

            <ChevronRight
              size={13}
              className="text-slate-300 group-hover:text-pink-500"
            />

          </div>

          <div className="text-xs text-slate-400 mt-2.5">
            Wishlist
          </div>

          <div className="text-lg font-bold text-slate-900">
            {wishlistCount}
          </div>

          <div className="text-[11px] text-[#2D3E8C] mt-0.5">
            View wishlist →
          </div>

        </button>

        {/* COUPONS */}

        <button
          type="button"
          className="group text-left bg-white border border-slate-200 rounded-xl p-3.5 hover:border-emerald-200 hover:shadow-sm transition"
        >

          <div className="flex items-start justify-between">

            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Ticket
                size={15}
                className="text-emerald-500"
              />
            </div>

            <ChevronRight
              size={13}
              className="text-slate-300 group-hover:text-emerald-500"
            />

          </div>

          <div className="text-xs text-slate-400 mt-2.5">
            Coupons
          </div>

          <div className="text-lg font-bold text-slate-900">
            {couponCount}
          </div>

          <div className="text-[11px] text-[#2D3E8C] mt-0.5">
            View coupons →
          </div>

        </button>

        {/* REWARDS */}

        <button
          type="button"
          className="group text-left bg-white border border-slate-200 rounded-xl p-3.5 hover:border-amber-200 hover:shadow-sm transition"
        >

          <div className="flex items-start justify-between">

            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Star
                size={15}
                className="text-amber-500"
              />
            </div>

            <ChevronRight
              size={13}
              className="text-slate-300 group-hover:text-amber-500"
            />

          </div>

          <div className="text-xs text-slate-400 mt-2.5">
            Reward Points
          </div>

          <div className="text-lg font-bold text-slate-900">
            {rewardPoints}
          </div>

          <div className="text-[11px] text-[#2D3E8C] mt-0.5">
            View rewards →
          </div>

        </button>

      </div>

      {/* =====================================================
          RECENT ORDERS + ACCOUNT SHORTCUTS
      ====================================================== */}

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4 mt-4">

        {/* RECENT ORDERS */}

        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">

          <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">

            <div>

              <h2 className="text-sm font-bold text-slate-900">
                Recent Orders
              </h2>

              <p className="text-sm text-slate-400 mt-0.5">
                Your latest purchases
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setPage("orders")
              }
              className="text-xs font-bold text-[#2D3E8C] hover:underline"
            >
              View All Orders →
            </button>

          </div>

          <div className="divide-y divide-slate-100">

            {ordersLoading ? (
              <div className="py-10 flex justify-center">

                <Loader2
                  size={18}
                  className="animate-spin text-[#2D3E8C]"
                />

              </div>
            ) : recentOrders.length ===
              0 ? (
              <div className="py-10 text-center">

                <Package
                  size={28}
                  className="mx-auto text-slate-300"
                />

                <p className="text-sm font-semibold text-slate-500 mt-2">
                  No orders yet
                </p>

                <button
                  type="button"
                  onClick={
                    handleViewAllProducts
                  }
                  className="text-xs text-[#2D3E8C] font-bold mt-1"
                >
                  Start shopping →
                </button>

              </div>
            ) : (
              recentOrders.map(
                (order) => {

                  const items =
                    orderItems[
                      order.id
                    ] || [];

                  const firstItem =
                    items[0];

                  const image =
                    firstItem?.productImage ||
                    firstItem?.image ||
                    "";

                  return (
                    <button
                      key={
                        order.id
                      }
                      type="button"
                      onClick={() =>
                        setPage(
                          "orders"
                        )
                      }
                      className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition"
                    >

                      <div className="w-11 h-11 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">

                        {image ? (
                          <ProductImage
                            src={image}
                            alt={
                              firstItem?.productName ||
                              "Product"
                            }
                            className="w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package
                              size={17}
                              className="text-slate-300"
                            />
                          </div>
                        )}

                      </div>

                      <div className="flex-1 min-w-0">

                        <div className="text-sm font-bold text-slate-800 truncate">
                          Order #
                          {
                            order.orderNo
                          }
                        </div>

                        <div className="text-xs text-slate-400 mt-0.5">
                          {items.length ||
                            "—"}{" "}
                          {items.length ===
                          1
                            ? "item"
                            : "items"}
                        </div>

                        <div className="text-xs text-slate-400 mt-0.5">
                          {formatDate(
                            order.createTime
                          )}
                        </div>

                      </div>

                      <div className="hidden sm:block">
                        <StatusBadge
                          status={
                            order.status
                          }
                        />
                      </div>

                      <div className="text-right">

                        <div className="text-sm font-bold text-slate-800">
                          {formatPrice(
                            order.totalPrice
                          )}
                        </div>

                        <ChevronRight
                          size={13}
                          className="text-slate-300 ml-auto mt-1"
                        />

                      </div>

                    </button>
                  );
                }
              )
            )}

          </div>

        </section>

        {/* ACCOUNT SHORTCUTS */}

        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">

          <div className="px-4 py-3.5 border-b border-slate-100">

            <h2 className="text-sm font-bold text-slate-900">
              Account Shortcuts
            </h2>

            <p className="text-sm text-slate-400 mt-0.5">
              Manage your account settings
            </p>

          </div>

          <div className="divide-y divide-slate-100">

            {/* ADDRESSES */}

            <button
              type="button"
              onClick={() =>
                setProfileSection(
                  "addresses"
                )
              }
              className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-slate-50 transition"
            >

              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <MapPin
                  size={16}
                  className="text-blue-500"
                />
              </div>

              <div className="flex-1">

                <h3 className="text-sm font-bold text-slate-800">
                  Addresses
                </h3>

                <p className="text-xs text-slate-400 mt-0.5">
                  Manage your delivery addresses
                </p>

              </div>

              <ChevronRight
                size={15}
                className="text-slate-300"
              />

            </button>

            {/* PAYMENT METHODS */}

            <button
              type="button"
              onClick={() =>
                setProfileSection(
                  "payment-methods"
                )
              }
              className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-slate-50 transition"
            >

              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <CreditCard
                  size={16}
                  className="text-emerald-500"
                />
              </div>

              <div className="flex-1">

                <h3 className="text-sm font-bold text-slate-800">
                  Payment Methods
                </h3>

                <p className="text-xs text-slate-400 mt-0.5">
                  Add or manage payment methods
                </p>

              </div>

              <ChevronRight
                size={15}
                className="text-slate-300"
              />

            </button>

            {/* SECURITY */}

            <button
              type="button"
              onClick={() =>
                setProfileSection(
                  "security"
                )
              }
              className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-slate-50 transition"
            >

              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                <Lock
                  size={16}
                  className="text-purple-500"
                />
              </div>

              <div className="flex-1">

                <h3 className="text-sm font-bold text-slate-800">
                  Security
                </h3>

                <p className="text-xs text-slate-400 mt-0.5">
                  Password, 2FA and login activity
                </p>

              </div>

              <ChevronRight
                size={15}
                className="text-slate-300"
              />

            </button>

            {/* NOTIFICATIONS */}

            <button
              type="button"
              onClick={() =>
                setProfileSection(
                  "notifications"
                )
              }
              className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-slate-50 transition"
            >

              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Bell
                  size={16}
                  className="text-amber-500"
                />
              </div>

              <div className="flex-1">

                <h3 className="text-sm font-bold text-slate-800">
                  Notifications
                </h3>

                <p className="text-xs text-slate-400 mt-0.5">
                  Manage your email preferences
                </p>

              </div>

              <ChevronRight
                size={15}
                className="text-slate-300"
              />

            </button>

          </div>

        </section>

      </div>

      {/* =====================================================
          RECENTLY VIEWED + BUY AGAIN
      ====================================================== */}

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4 mt-4">

        {/* RECENTLY VIEWED */}

        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">

          <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">

            <div>

              <h2 className="text-sm font-bold text-slate-900">
                Recently Viewed
              </h2>

              <p className="text-sm text-slate-400 mt-0.5">
                Products you've looked at
              </p>

            </div>

            <div className="flex items-center gap-3">

              {recentlyViewedProducts.length >
                0 && (
                <button
                  type="button"
                  onClick={
                    clearRecentlyViewed
                  }
                  className="text-xs font-bold text-slate-400 hover:text-red-500 transition"
                >
                  Clear
                </button>
              )}

              <button
                type="button"
                onClick={
                  handleViewAllProducts
                }
                className="text-xs font-bold text-[#2D3E8C] hover:underline inline-flex items-center gap-1"
              >
                View All
                <ArrowRight size={10} />
              </button>

            </div>

          </div>

          <div className="p-3">

            {recentlyViewedProducts.length ===
            0 ? (
              <button
                type="button"
                onClick={
                  handleViewAllProducts
                }
                className="w-full h-32 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center text-center hover:bg-slate-100 transition"
              >

                <div>

                  <Eye
                    size={22}
                    className="mx-auto text-slate-300"
                  />

                  <div className="text-xs font-semibold text-slate-500 mt-2">
                    No recently viewed
                    products
                  </div>

                  <div className="text-xs text-[#2D3E8C] mt-1">
                    Browse all products →
                  </div>

                </div>

              </button>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">

                {recentlyViewedProducts.map(
                  (product) => (
                    <button
                      key={
                        product.id
                      }
                      type="button"
                      onClick={() =>
                        handleOpenProduct(
                          product
                        )
                      }
                      className="text-left group min-w-0"
                    >

                      <div className="aspect-square rounded-lg border border-slate-100 bg-slate-50 overflow-hidden">

                        <ProductImage
                          src={
                            product.image ||
                            product.productImage ||
                            ""
                          }
                          alt={
                            product.name ||
                            "Product"
                          }
                          className="w-full h-full group-hover:scale-105 transition"
                        />

                      </div>

                      <div className="text-sm font-semibold text-slate-700 mt-1.5 line-clamp-2">
                        {product.name ||
                          product.productName ||
                          "Product"}
                      </div>

                      <div className="text-xs font-bold text-slate-500 mt-0.5">
                        {formatPrice(
                          product.price
                        )}
                      </div>

                    </button>
                  )
                )}

              </div>
            )}

          </div>

        </section>

        {/* BUY AGAIN */}

        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">

          <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">

            <div>

              <h2 className="text-sm font-bold text-slate-900">
                Buy Again
              </h2>

              <p className="text-sm text-slate-400 mt-0.5">
                Quickly reorder past purchases
              </p>

            </div>

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={
                  handleViewAllProducts
                }
                className="text-xs font-bold text-[#2D3E8C] hover:underline inline-flex items-center gap-1"
              >
                View All
                <ArrowRight size={10} />
              </button>

              <RefreshCw
                size={13}
                className="text-slate-300"
              />

            </div>

          </div>

          <div className="p-3">

            {itemsLoading ? (
              <div className="h-32 flex items-center justify-center">

                <Loader2
                  size={17}
                  className="animate-spin text-[#2D3E8C]"
                />

              </div>
            ) : buyAgainProducts.length ===
              0 ? (
              <div className="h-32 flex flex-col items-center justify-center text-center">

                <ShoppingBag
                  size={21}
                  className="text-slate-300"
                />

                <p className="text-xs text-slate-400 mt-2">
                  Your purchased products
                  will appear here.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setPage("orders")
                  }
                  className="text-xs font-bold text-[#2D3E8C] mt-1"
                >
                  View your orders →
                </button>

              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">

                {buyAgainProducts
                  .slice(0, 3)
                  .map(
                    (
                      item,
                      index
                    ) => {

                      const image =
                        item.productImage ||
                        item.image ||
                        "";

                      const name =
                        item.productName ||
                        item.name ||
                        "Product";

                      return (
                        <div
                          key={
                            item.productId ||
                            item.id ||
                            index
                          }
                          className="min-w-0"
                        >

                          <button
                            type="button"
                            onClick={() =>
                              handleOpenProduct(
                                item
                              )
                            }
                            className="w-full text-left"
                          >

                            <div className="aspect-square rounded-lg bg-slate-50 border border-slate-100 overflow-hidden">

                              <ProductImage
                                src={
                                  image
                                }
                                alt={
                                  name
                                }
                                className="w-full h-full hover:scale-105 transition"
                              />

                            </div>

                            <div className="text-xs font-semibold text-slate-700 mt-1.5 line-clamp-2">
                              {name}
                            </div>

                            <div className="text-xs font-bold text-slate-500 mt-0.5">
                              {formatPrice(
                                item.price
                              )}
                            </div>

                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleBuyAgain(
                                item
                              )
                            }
                            className="w-full mt-1.5 border border-[#8A78FF]/50 text-[#6B5CE7] rounded-md py-1 text-xs font-bold hover:bg-[#8A78FF]/5 transition"
                          >
                            <span className="inline-flex items-center justify-center gap-1">
                              <ShoppingBag
                                size={9}
                              />
                              Buy Again
                            </span>
                          </button>

                        </div>
                      );
                    }
                  )}

              </div>
            )}

          </div>

        </section>

      </div>

      {/* =====================================================
          WISHLIST PREVIEW
      ====================================================== */}

      {wishlistCount > 0 && (
        <section className="mt-4 bg-white border border-slate-200 rounded-xl overflow-hidden">

          <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">

            <div>

              <div className="flex items-center gap-2">

                <Heart
                  size={13}
                  className="text-pink-500 fill-pink-500"
                />

                <h2 className="text-sm font-bold text-slate-900">
                  Wishlist
                </h2>

              </div>

              <p className="text-sm text-slate-400 mt-0.5">
                Your saved products
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setPage("wishlist")
              }
              className="text-xs font-bold text-[#2D3E8C] hover:underline"
            >
              View Wishlist →
            </button>

          </div>

          <div className="p-3">

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">

              {wishlistProducts
                .slice(0, 6)
                .map((product) => (
                  <button
                    key={
                      product.id
                    }
                    type="button"
                    onClick={() =>
                      handleOpenProduct(
                        product
                      )
                    }
                    className="text-left group min-w-0"
                  >

                    <div className="aspect-square rounded-lg bg-slate-50 border border-slate-100 overflow-hidden">

                      <ProductImage
                        src={
                          product.image ||
                          product.productImage ||
                          ""
                        }
                        alt={
                          product.name ||
                          "Product"
                        }
                        className="w-full h-full group-hover:scale-105 transition"
                      />

                    </div>

                    <div className="text-xs font-semibold text-slate-700 mt-1.5 line-clamp-2">
                      {product.name ||
                        product.productName ||
                        "Product"}
                    </div>

                    <div className="text-xs font-bold text-slate-500 mt-0.5">
                      {formatPrice(
                        product.price
                      )}
                    </div>

                  </button>
                ))}

            </div>

          </div>

        </section>
      )}

      {/* =====================================================
          ACCOUNT STATUS
      ====================================================== */}

      <section className="mt-4 bg-white border border-slate-200 rounded-xl p-4">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Shield
                size={16}
                className="text-emerald-500"
              />
            </div>

            <div>

              <div className="text-sm font-bold text-slate-700">
                Account active
              </div>

              <div className="text-xs text-slate-400 mt-0.5">
                Your TechNova account is
                active and protected.
              </div>

            </div>

          </div>

          <div className="flex items-center gap-5">

            <div className="text-center">

              <div className="text-sm font-bold text-slate-800">
                {activeOrders}
              </div>

              <div className="text-xs text-slate-400">
                In progress
              </div>

            </div>

            <div className="w-px h-7 bg-slate-200" />

            <div className="text-center">

              <div className="text-sm font-bold text-emerald-600">
                {deliveredOrders}
              </div>

              <div className="text-xs text-slate-400">
                Delivered
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          SIGN OUT
      ====================================================== */}

      <div className="mt-4 flex justify-end">

        <button
          type="button"
          onClick={
            handleLogout
          }
          className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600"
        >
          <LogOut size={12} />
          Sign out of TechNova
        </button>

      </div>

      {/* =====================================================
          TRUST FOOTER
      ====================================================== */}

      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-5 text-xs text-slate-400">

        <span className="flex items-center gap-1">
          <Shield size={10} />
          Secure account
        </span>

        <span className="flex items-center gap-1">
          <Package size={10} />
          Order tracking
        </span>

        <span className="flex items-center gap-1">
          <Heart size={10} />
          Saved products
        </span>

      </div>

    </div>
  );
}