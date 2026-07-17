import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export interface CartItem {
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  customerEmail: string;
  setCustomerEmail: (email: string) => void;
  syncCartToBackend: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_STORAGE_KEY = "flowcart-cart";
const CART_EMAIL_KEY = "flowcart-email";

function loadCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

function loadEmailFromStorage(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(CART_EMAIL_KEY) ?? "";
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");

  // Hydrate from localStorage after mount
  useEffect(() => {
    setItems(loadCartFromStorage());
    setCustomerEmail(loadEmailFromStorage());
    setHydrated(true);
  }, []);

  // Persist whenever items change (after hydration)
  useEffect(() => {
    if (hydrated && typeof window !== "undefined") {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  // Persist email
  useEffect(() => {
    if (hydrated && typeof window !== "undefined") {
      localStorage.setItem(CART_EMAIL_KEY, customerEmail);
    }
  }, [customerEmail, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.slug === item.slug);
      if (existing) {
        return prev.map((i) =>
          i.slug === item.slug ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  const updateQuantity = useCallback((slug: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.slug !== slug));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.slug === slug ? { ...i, quantity } : i)),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  /** Sync cart to the backend API for tracking */
  const syncCartToBackend = useCallback(async () => {
    if (!customerEmail || items.length === 0) return;
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerEmail, items }),
      });
    } catch {
      // Silently fail — cart sync is best-effort
    }
  }, [customerEmail, items]);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        customerEmail,
        setCustomerEmail,
        syncCartToBackend,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
