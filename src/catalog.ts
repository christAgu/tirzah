export type Product = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  category: "matcha" | "coffee";
  price: number;
  image: string;
  color: string;
  tag: string;
  temperatures: readonly Temperature[];
  allergens: string;
};

export type Temperature = "iced" | "hot";
export type Milk = "classic" | "oat" | "coconut";
export type CartItem = {
  productId: string;
  milk: Milk;
  temperature: Temperature;
  quantity: number;
};

export const products: Product[] = [
  {
    id: "matcha-caramel",
    name: "Caramel Matcha",
    subtitle: "Le matcha, en mode gourmand.",
    description:
      "La douceur d’un matcha latte, des glaçons et un tourbillon de caramel. Le petit crush qui change ta journée.",
    category: "matcha",
    price: 650,
    image: "/images/matcha-caramel.webp",
    color: "sage",
    tag: "La signature",
    temperatures: ["iced"],
    allergens:
      "Lait. Le caramel peut contenir du lait, même avec une boisson végétale. Composition et allergènes à confirmer au café.",
  },
  {
    id: "strawberry-matcha",
    name: "Strawberry Matcha",
    subtitle: "Une rencontre un peu inattendue.",
    description:
      "Un nuage de lait, une note de fraise et un matcha tout en douceur. Rose en bas, green mood en haut.",
    category: "matcha",
    price: 700,
    image: "/images/strawberry-matcha.webp",
    color: "pink",
    tag: "Sweet crush",
    temperatures: ["iced"],
    allergens:
      "Lait selon la base choisie. Composition et allergènes à confirmer au café.",
  },
  {
    id: "caramel-latte",
    name: "Caramel Cloud",
    subtitle: "Pour les coffee lovers, aussi.",
    description:
      "Un café latte glacé, du caramel et un nuage de chantilly. Parce que le bonheur n’a pas qu’une couleur.",
    category: "coffee",
    price: 650,
    image: "/images/caramel-latte.webp",
    color: "sand",
    tag: "Coffee lover",
    temperatures: ["iced"],
    allergens:
      "Lait dans la chantilly et potentiellement le caramel, même avec une boisson végétale. Composition et allergènes à confirmer au café.",
  },
  {
    id: "matcha-classic",
    name: "Matcha Essential",
    subtitle: "Simple. Doux. Juste ce qu’il faut.",
    description:
      "Le rituel dans sa forme la plus simple : du matcha, ton lait préféré et un moment rien qu’à toi. Chaud ou glacé.",
    category: "matcha",
    price: 550,
    image: "/images/matcha-classic.webp",
    color: "olive",
    tag: "Back to basics",
    temperatures: ["hot", "iced"],
    allergens:
      "Lait selon la base choisie. Composition et allergènes à confirmer au café.",
  },
];

export const milks: { id: Milk; label: string; extra: number }[] = [
  { id: "classic", label: "Lait classique", extra: 0 },
  { id: "oat", label: "Avoine", extra: 50 },
  { id: "coconut", label: "Coco", extra: 50 },
];

export const money = (cents: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
    cents / 100,
  );
export const itemKey = (item: Omit<CartItem, "quantity">) =>
  `${item.productId}:${item.milk}:${item.temperature}`;
export const itemPrice = (item: CartItem) =>
  (products.find((p) => p.id === item.productId)?.price ?? 0) +
  (milks.find((m) => m.id === item.milk)?.extra ?? 0);
export const cartTotal = (items: CartItem[]) =>
  items.reduce((sum, item) => sum + itemPrice(item) * item.quantity, 0);

export function addToCart(items: CartItem[], next: CartItem): CartItem[] {
  const existing = items.find((item) => itemKey(item) === itemKey(next));
  return existing
    ? items.map((item) =>
        itemKey(item) === itemKey(next)
          ? { ...item, quantity: Math.min(20, item.quantity + next.quantity) }
          : item,
      )
    : [...items, next];
}

export function isCart(value: unknown): value is CartItem[] {
  return (
    Array.isArray(value) &&
    value.length <= 24 &&
    value.every((item) => {
      if (!item || typeof item !== "object") return false;
      const product = products.find((p) => p.id === item.productId);
      return (
        product &&
        milks.some((m) => m.id === item.milk) &&
        product.temperatures.includes(item.temperature) &&
        Number.isInteger(item.quantity) &&
        item.quantity >= 1 &&
        item.quantity <= 20
      );
    })
  );
}

export function isFavorites(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every(
      (id) => typeof id === "string" && products.some((p) => p.id === id),
    )
  );
}

export function recommend(taste: string, mood: string) {
  if (mood === "coffee") return products[2];
  if (taste === "fruity") return products[1];
  if (taste === "pure") return products[3];
  return products[0];
}
