export function payload(response) {
  return response?.data ?? response;
}

export function listFrom(response, keys = []) {
  const value = payload(response);
  if (Array.isArray(value)) return value;
  for (const key of keys) {
    if (Array.isArray(value?.[key])) return value[key];
  }
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

export function oneFrom(response, keys = []) {
  const value = payload(response);
  if (!value || Array.isArray(value)) return value?.[0] ?? null;
  for (const key of keys) {
    if (value[key] && !Array.isArray(value[key])) return value[key];
  }
  if (value.data && !Array.isArray(value.data)) return value.data;
  return value;
}

export function normalizeCategory(category = {}) {
  if (!category) return null;
  const id = category.id ?? category._id;
  return {
    ...category,
    id,
    slug: category.slug ?? id,
    name: category.name ?? category.title ?? 'Category',
    image_url: category.image_url ?? category.imageUrl ?? category.image,
  };
}

export function normalizeProduct(product = {}) {
  if (!product) return null;
  const id = product.id ?? product._id;
  const category = product.categories ?? product.category ?? null;
  const normalizedCategory = category ? normalizeCategory(category) : null;
  const categoryId =
    product.category_id ??
    product.categoryId ??
    normalizedCategory?.id ??
    (typeof product.category === 'string' ? product.category : null);

  return {
    ...product,
    id,
    _id: product._id ?? id,
    slug: product.slug ?? id,
    price: Number(product.price ?? 0),
    compare_at_price:
      product.compare_at_price ?? product.compareAtPrice
        ? Number(product.compare_at_price ?? product.compareAtPrice)
        : null,
    image_url: product.image_url ?? product.imageUrl ?? product.image,
    category_id: categoryId,
    categories: normalizedCategory,
    stock: Number(product.stock ?? product.quantity ?? 0),
    featured: Boolean(product.featured),
  };
}

export function normalizeProducts(response) {
  return listFrom(response, ['products', 'items', 'results']).map(normalizeProduct).filter(Boolean);
}

export function normalizeCategories(response) {
  return listFrom(response, ['categories', 'items', 'results']).map(normalizeCategory).filter(Boolean);
}

export function normalizeCartItem(item = {}) {
  if (!item) return null;
  const id = item.id ?? item._id;
  const product = item.products ?? item.product ?? null;
  const normalizedProduct = product ? normalizeProduct(product) : null;
  const productId =
    item.product_id ??
    item.productId ??
    normalizedProduct?.id ??
    (typeof item.product === 'string' ? item.product : null);

  return {
    ...item,
    id,
    product_id: productId,
    quantity: Number(item.quantity ?? 1),
    products: normalizedProduct,
  };
}

export function normalizeCartItems(response) {
  return listFrom(response, ['cart_items', 'cartItems', 'items', 'cart']).map(normalizeCartItem).filter(Boolean);
}

export function normalizeOrderItem(item = {}) {
  if (!item) return null;
  const product = item.products ?? item.product ?? null;
  return {
    ...item,
    quantity: Number(item.quantity ?? 1),
    price: Number(item.price ?? product?.price ?? 0),
    products: product ? normalizeProduct(product) : null,
  };
}

export function normalizeOrder(order = {}) {
  if (!order) return null;
  const id = order.id ?? order._id;
  const profile = order.profiles ?? order.profile ?? order.user ?? null;
  const items = order.order_items ?? order.orderItems ?? order.items ?? [];

  return {
    ...order,
    id,
    total: Number(order.total ?? order.totalPrice ?? order.amount ?? 0),
    payment_method: order.payment_method ?? order.paymentMethod ?? 'cod',
    created_at: order.created_at ?? order.createdAt ?? new Date().toISOString(),
    updated_at: order.updated_at ?? order.updatedAt,
    order_items: items.map(normalizeOrderItem).filter(Boolean),
    profiles: profile
      ? {
          ...profile,
          full_name: profile.full_name ?? profile.fullName ?? profile.name ?? '',
        }
      : null,
  };
}

export function normalizeOrders(response) {
  return listFrom(response, ['orders', 'items', 'results']).map(normalizeOrder).filter(Boolean);
}
