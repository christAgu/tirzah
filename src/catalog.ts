export type Product = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  category: "matcha" | "coffee" | "iced";
  price: number;
  image: string;
  color: string;
  tag: string;
  temperatures: readonly Temperature[];
  allergens: string;
  milkFree?: boolean;
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
  {
    id: "speculoos-matcha",
    name: "Spéculoos Matcha",
    subtitle: "Le matcha qui sent bon le goûter.",
    description:
      "Un matcha latte onctueux, des tourbillons de pâte de spéculoos et un crumble de biscuit croquant sur le dessus. Cannelle, douceur et green mood.",
    category: "matcha",
    price: 700,
    image: "/images/speculoos-matcha.webp",
    color: "biscuit",
    tag: "Cozy crush",
    temperatures: ["iced", "hot"],
    allergens:
      "Gluten (biscuit spéculoos) et lait selon la base choisie ; peut contenir du soja. Composition et allergènes à confirmer au café.",
  },
  {
    id: "mint-matcha",
    name: "Mint Matcha",
    subtitle: "Fraîcheur verte, version matcha.",
    description:
      "Un matcha latte bien frais, une touche de menthe fraîche et des glaçons. Le grand bol d’air de ta journée, en vert.",
    category: "matcha",
    price: 650,
    image: "/images/mint-matcha.webp",
    color: "mint",
    tag: "Fresh crush",
    temperatures: ["iced", "hot"],
    allergens:
      "Lait selon la base choisie. Composition et allergènes à confirmer au café.",
  },
  {
    id: "vanilla-matcha",
    name: "Vanilla Matcha",
    subtitle: "Doux comme un câlin vanillé.",
    description:
      "Un matcha latte tout en rondeur, un sirop de vanille délicat et un nuage de lait. Le réconfort, en version green.",
    category: "matcha",
    price: 650,
    image: "/images/vanilla-matcha.webp",
    color: "vanilla",
    tag: "Soft crush",
    temperatures: ["iced", "hot"],
    allergens:
      "Lait selon la base choisie. Composition et allergènes à confirmer au café.",
  },
  {
    id: "saffron-matcha",
    name: "Saffron Matcha",
    subtitle: "La spécialité de la maison.",
    description:
      "Notre création signature : un matcha latte infusé au safran, une note dorée et délicatement épicée, quelques pistils sur la mousse. Rare, précieux, tirzah.",
    category: "matcha",
    price: 800,
    image: "/images/saffron-matcha.webp",
    color: "saffron",
    tag: "Spécialité maison",
    temperatures: ["iced", "hot"],
    allergens:
      "Lait selon la base choisie. Composition et allergènes à confirmer au café.",
  },
  {
    id: "matcha-lemonade",
    name: "Matcha Lemonade",
    subtitle: "Pétillant, vert, désaltérant.",
    description:
      "Une limonade bien fraîche, des glaçons et un voile de matcha qui flotte au-dessus. Sans lait, 100 % fraîcheur.",
    category: "iced",
    price: 600,
    image: "/images/matcha-lemonade.webp",
    color: "citrus",
    tag: "Iced crush",
    temperatures: ["iced"],
    allergens: "Sans lait. Composition et allergènes à confirmer au café.",
    milkFree: true,
  },
  {
    id: "peach-iced-tea",
    name: "Peach Iced Tea",
    subtitle: "Le thé glacé pêche-hibiscus.",
    description:
      "Un thé glacé maison à la pêche, une pointe d’hibiscus et beaucoup de glaçons. L’été dans un gobelet, toute l’année.",
    category: "iced",
    price: 550,
    image: "/images/peach-iced-tea.webp",
    color: "peach",
    tag: "Summer mood",
    temperatures: ["iced"],
    allergens: "Sans lait. Composition et allergènes à confirmer au café.",
    milkFree: true,
  },
  {
    id: "iced-vanilla-latte",
    name: "Iced Vanilla Latte",
    subtitle: "Le café glacé, version douce.",
    description:
      "Un café latte glacé, un sirop de vanille et un petit nuage de crème. Pour les coffee lovers qui aiment la fraîcheur.",
    category: "iced",
    price: 650,
    image: "/images/iced-vanilla-latte.webp",
    color: "cocoa",
    tag: "Cool coffee",
    temperatures: ["iced"],
    allergens:
      "Lait dans la crème, même avec une boisson végétale. Composition et allergènes à confirmer au café.",
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
export const itemPrice = (item: CartItem) => {
  const product = products.find((p) => p.id === item.productId);
  const extra = product?.milkFree
    ? 0
    : (milks.find((m) => m.id === item.milk)?.extra ?? 0);
  return (product?.price ?? 0) + extra;
};
export const milkLabel = (item: Pick<CartItem, "productId" | "milk">) =>
  products.find((p) => p.id === item.productId)?.milkFree
    ? "Sans lait"
    : (milks.find((m) => m.id === item.milk)?.label ?? "");
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

const byId = (id: string) => products.find((p) => p.id === id) ?? products[0];

export function recommend(taste: string, mood: string) {
  if (mood === "coffee") return byId("caramel-latte");
  if (mood === "iced") return byId("matcha-lemonade");
  if (taste === "fruity") return byId("strawberry-matcha");
  if (taste === "pure") return byId("matcha-classic");
  if (taste === "biscuit") return byId("speculoos-matcha");
  if (taste === "fresh") return byId("mint-matcha");
  if (taste === "spiced") return byId("saffron-matcha");
  return byId("matcha-caramel");
}
