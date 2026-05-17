import { create } from "zustand";

const GUEST_CART_KEY = "cart_guest";

const cartItemKey = (item) => {
  const id = item?._id ?? item?.productId ?? item?.product ?? "";
  const size = item?.size ?? "";
  const color = item?.color ?? "";
  return `${id}-${size}-${color}`;
};

const mergeCarts = (cartA, cartB) => {
  const map = new Map();
  for (const item of [...(cartA || []), ...(cartB || [])]) {
    const key = cartItemKey(item);
    if (!map.has(key)) {
      map.set(key, { ...item });
      continue;
    }
    const prev = map.get(key);
    map.set(key, { ...prev, quantity: Number(prev.quantity || 0) + Number(item.quantity || 0) });
  }
  return Array.from(map.values());
};

const safeJsonParse = (raw) => {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useCartStore = create((set, get) => ({
  cart: [],
  storageKey: GUEST_CART_KEY,

  setStorageKey: (key) => set({ storageKey: key || GUEST_CART_KEY }),

  // Hydrate cart from localStorage, with merge behavior:
  // - guest -> user: merge current guest cart into saved user cart
  // - user -> guest: restore saved guest cart
  hydrateCart: (nextKey) => {
    const prevKey = get().storageKey;
    const prevCart = get().cart || [];
    const targetKey = nextKey || GUEST_CART_KEY;

    const nextCartFromStorage = safeJsonParse(localStorage.getItem(targetKey)) || [];

    // guest -> user: merge
    if (prevKey === GUEST_CART_KEY && targetKey !== GUEST_CART_KEY) {
      set({
        storageKey: targetKey,
        cart: mergeCarts(prevCart, nextCartFromStorage),
      });
      return;
    }

    // user -> guest: restore guest only
    if (targetKey === GUEST_CART_KEY && prevKey !== GUEST_CART_KEY) {
      set({
        storageKey: targetKey,
        cart: nextCartFromStorage,
      });
      return;
    }

    // same type: prefer stored, fallback to current
    set({
      storageKey: targetKey,
      cart: nextCartFromStorage.length ? nextCartFromStorage : prevCart,
    });
  },

  persistCart: (nextCart) => {
    const key = get().storageKey || GUEST_CART_KEY;
    try {
      localStorage.setItem(key, JSON.stringify(nextCart));
    } catch {
      // ignore localStorage quota errors
    }
  },

  // 1. Thêm vào giỏ (hoặc tăng số lượng nếu đã có)
  addToCart: (product) =>
    set((state) => {
      const existingItem = state.cart.find(
        (item) =>
          item._id === product._id &&
          item.size === product.size &&
          item.color === product.color,
      );

      let nextCart;
      if (existingItem) {
        nextCart = state.cart.map((item) =>
          item._id === product._id &&
          item.size === product.size &&
          item.color === product.color
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item,
        );
      } else {
        nextCart = [...state.cart, { ...product, quantity: product.quantity || 1 }];
      }

      // persist by current storageKey
      try {
        localStorage.setItem(
          state.storageKey || GUEST_CART_KEY,
          JSON.stringify(nextCart),
        );
      } catch {
        // ignore localStorage quota/security errors
      }

      return { cart: nextCart };
    }),

  // 2. Giảm số lượng
  decreaseQuantity: (productId, size, color) =>
    set((state) => {
      const existingItem = state.cart.find(
        (item) =>
          item._id === productId && item.size === size && item.color === color,
      );

      let nextCart;
      if (existingItem && existingItem.quantity > 1) {
        nextCart = state.cart.map((item) =>
          item._id === productId &&
          item.size === size &&
          item.color === color
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        );
      } else {
        // Nếu số lượng là 1 mà bấm giảm nữa thì xóa luôn khỏi giỏ
        nextCart = state.cart.filter(
          (item) =>
            !(
              item._id === productId &&
              item.size === size &&
              item.color === color
            ),
        );
      }

      try {
        localStorage.setItem(
          state.storageKey || GUEST_CART_KEY,
          JSON.stringify(nextCart),
        );
      } catch {
        // ignore localStorage quota/security errors
      }

      return { cart: nextCart };
    }),

  // 3. Xóa hẳn sản phẩm khỏi giỏ
  removeFromCart: (productId, size, color) =>
    set((state) => {
      const nextCart = state.cart.filter(
        (item) =>
          !(
            item._id === productId &&
            item.size === size &&
            item.color === color
          ),
      );

      try {
        localStorage.setItem(
          state.storageKey || GUEST_CART_KEY,
          JSON.stringify(nextCart),
        );
      } catch {
        // ignore localStorage quota/security errors
      }

      return { cart: nextCart };
    }),

  removeMultipleFromCart: (keys) =>
    set((state) => {
      const nextCart = state.cart.filter(
        (item) => !keys.includes(`${item._id}-${item.size}-${item.color}`)
      );
      try {
        localStorage.setItem(
          state.storageKey || GUEST_CART_KEY,
          JSON.stringify(nextCart),
        );
      } catch {}
      return { cart: nextCart };
    }),

  clearCart: () =>
    set((state) => {
      const nextCart = [];
      try {
        localStorage.setItem(
          state.storageKey || GUEST_CART_KEY,
          JSON.stringify(nextCart),
        );
      } catch {
        // ignore localStorage quota/security errors
      }
      return { cart: nextCart };
    }),
}));
