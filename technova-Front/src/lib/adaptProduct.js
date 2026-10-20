const PALETTE = [
  "#2F5EFF",
  "#12151B",
  "#FF5A36",
  "#1C9A6C",
  "#6B7280",
  "#B8860B",
];

export function adaptProduct(bp) {
  try {
    if (!bp) return null;

    const sub =
      bp.subcategoryName ??
      bp.subCategoryName ??
      bp.subcategory ??
      bp.subCategory ??
      null;

    const images = Array.isArray(bp.images)
      ? bp.images
          .filter(
            (img) =>
              img &&
              (img.image || img.url)
          )
          .map((img) => ({
            id: img.id,
            productId: String(
              img.productId ?? bp.id
            ),
            color:
              img.color ?? "Default",
            image:
              img.image ??
              img.url ??
              "",
            isPrimary:
              Boolean(img.isPrimary),
          }))
      : [];

    const primaryImage =
      images.find(
        (img) => img.isPrimary
      )?.image ??
      images[0]?.image ??
      bp.image ??
      bp.productImage ??
      "";

    let specs = {};

    if (bp.specs) {
      if (typeof bp.specs === "string") {
        try {
          specs = JSON.parse(bp.specs);
        } catch {
          specs = {};
        }
      } else if (
        typeof bp.specs === "object"
      ) {
        specs = bp.specs;
      }
    }

    const productId =
      bp.id ??
      bp.productId ??
      bp.product_id ??
      "";

    return {
      id: String(productId),

      name:
        bp.name ??
        "Unnamed Product",

      cat:
        bp.categoryName ??
        bp.category?.name ??
        bp.category ??
        "Other",

      sub: sub || null,

      price: Number(
        bp.price ?? 0
      ),

      discountPrice:
        bp.discountPrice !== null &&
        bp.discountPrice !== undefined
          ? Number(bp.discountPrice)
          : null,

      stock:
        bp.stock !== undefined &&
        bp.stock !== null &&
        bp.stock !== ""
          ? Number(bp.stock)
          : null,

      popularity: Number(
        bp.viewCount ??
          bp.popularity ??
          50
      ),

      createdAt:
        bp.createTime ??
        bp.createdAt ??
        new Date().toISOString(),

      specs,

      tint:
        PALETTE[
          Math.abs(
            Number(productId || 0)
          ) % PALETTE.length
        ],

      why:
        bp.why ??
        "Popular pick",

      reviews: {
        total: Number(
          bp.reviewCount ??
            bp.reviews?.total ??
            0
        ),

        avg: Number(
          bp.rating ??
            bp.reviews?.avg ??
            0
        ),

        breakdown:
          bp.reviews?.breakdown ??
          {},
      },

      description:
        bp.description ??
        "",

      image: primaryImage,

      images,

      isFeatured:
        Boolean(
          bp.isFeatured ?? false
        ),
    };
  } catch (error) {
    console.error(
      "Failed to adapt product:",
      bp,
      error
    );

    return null;
  }
}

export function adaptProducts(list) {
  if (!Array.isArray(list)) {
    return [];
  }

  return list
    .map(adaptProduct)
    .filter(
      (product) =>
        product !== null
    );
}

export function adaptCartItem(civ) {
  if (!civ) {
    return null;
  }

  /*
   * The cart row ID is NOT the product ID.
   *
   * civ.id       -> cart item ID
   * civ.productId -> product ID
   *
   * Some backend responses may return the
   * product inside a nested "product" object,
   * so we support both formats.
   */

  const product =
    civ.product ??
    civ.productInfo ??
    null;

  const productId =
    civ.productId ??
    civ.product_id ??
    product?.id ??
    product?.productId ??
    product?.product_id ??
    null;

  const productName =
    civ.productName ??
    civ.product_name ??
    product?.name ??
    "Unnamed Product";

  const productImage =
    civ.productImage ??
    civ.product_image ??
    product?.image ??
    product?.productImage ??
    product?.images?.find(
      (img) => img?.isPrimary
    )?.image ??
    product?.images?.[0]?.image ??
    product?.images?.[0]?.url ??
    "";

  const rawStock =
    civ.stock ??
    product?.stock ??
    null;

  const stock =
    rawStock !== null &&
    rawStock !== undefined &&
    rawStock !== ""
      ? Number(rawStock)
      : null;

  const rawQuantity =
    civ.quantity ??
    civ.qty ??
    0;

  const quantity = Number(
    rawQuantity
  );

  const numericProductId =
    Number(productId);

  return {
    // IMPORTANT:
    // This is the CART ROW ID.
    id: civ.id,

    // IMPORTANT:
    // This is the actual PRODUCT ID.
    productId:
      productId !== null &&
      productId !== undefined &&
      productId !== ""
        ? String(productId)
        : null,

    name: productName,

    image: productImage,

    tint:
      PALETTE[
        Math.abs(
          Number.isFinite(
            numericProductId
          )
            ? numericProductId
            : 0
        ) % PALETTE.length
      ],

    price: Number(
      civ.price ??
        product?.price ??
        0
    ),

    stock:
      Number.isFinite(stock)
        ? stock
        : null,

    quantity:
      Number.isFinite(quantity)
        ? quantity
        : 0,
  };
}

export function adaptCartItems(list) {
  if (!Array.isArray(list)) {
    return [];
  }

  return list
    .map(adaptCartItem)
    .filter(
      (item) => item !== null
    );
}

