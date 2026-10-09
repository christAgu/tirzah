import { describe, expect, it } from "vitest";
import {
  addToCart,
  cartTotal,
  isCart,
  isFavorites,
  itemKey,
  itemPrice,
  money,
  recommend,
  type CartItem,
} from "./catalog";

const matcha: CartItem = {
  productId: "matcha-caramel",
  milk: "classic",
  temperature: "iced",
  quantity: 1,
};

describe("cart calculations", () => {
  it("prices milk supplements in integer cents", () => {
    expect(itemPrice(matcha)).toBe(650);
    expect(itemPrice({ ...matcha, milk: "oat" })).toBe(700);
    expect(
      cartTotal([
        { ...matcha, quantity: 2 },
        { ...matcha, milk: "coconut", quantity: 3 },
      ]),
    ).toBe(3400);
    expect(cartTotal([])).toBe(0);
    expect(money(650)).toMatch(/6,50/);
  });
  it("merges matching customizations and retains distinct milks", () => {
    const merged = addToCart([matcha], { ...matcha, quantity: 2 });
    expect(merged).toEqual([{ ...matcha, quantity: 3 }]);
    expect(addToCart(merged, { ...matcha, milk: "oat" })).toHaveLength(2);
    expect(itemKey(matcha)).not.toBe(itemKey({ ...matcha, milk: "oat" }));
  });
  it("caps each customization at 20 drinks", () => {
    expect(
      addToCart([{ ...matcha, quantity: 19 }], { ...matcha, quantity: 5 })[0]
        .quantity,
    ).toBe(20);
  });
});

describe("storage validation", () => {
  it("accepts valid carts and favorites", () => {
    expect(isCart([matcha])).toBe(true);
    expect(isCart([])).toBe(true);
    expect(isFavorites(["matcha-caramel"])).toBe(true);
  });
  it.each([
    null,
    {},
    [null],
    [{ ...matcha, productId: "unknown" }],
    [{ ...matcha, milk: "invalid" }],
    [{ ...matcha, temperature: "hot" }],
    [{ ...matcha, quantity: 0 }],
    [{ ...matcha, quantity: 21 }],
    [{ ...matcha, quantity: 1.5 }],
    [{ ...matcha, quantity: "1" }],
  ])("rejects malformed cart %j", (value) => {
    expect(isCart(value)).toBe(false);
  });
  it("rejects unknown favorites", () => {
    expect(isFavorites(["missing"])).toBe(false);
    expect(isFavorites([3])).toBe(false);
    expect(isFavorites({})).toBe(false);
  });
});

describe("matcha quiz", () => {
  it("matches sweet, fruity, essential, and coffee moods", () => {
    expect(recommend("sweet", "matcha").id).toBe("matcha-caramel");
    expect(recommend("fruity", "matcha").id).toBe("strawberry-matcha");
    expect(recommend("pure", "matcha").id).toBe("matcha-classic");
    expect(recommend("biscuit", "matcha").id).toBe("speculoos-matcha");
    expect(recommend("fruity", "coffee").id).toBe("caramel-latte");
  });
});
