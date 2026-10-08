import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "./App";
import { useStoredState } from "./useStoredState";

describe("Pre-rendering and storage", () => {
  it("hydrates the public HTML before loading saved cart/favorites without data loss", async () => {
    const savedCart = [
      {
        productId: "matcha-caramel",
        milk: "classic",
        temperature: "iced",
        quantity: 2,
      },
    ];
    localStorage.setItem("tirzah:cart:v1", JSON.stringify(savedCart));
    localStorage.setItem(
      "tirzah:favorites:v1",
      JSON.stringify(["matcha-caramel"]),
    );
    const app = (
      <StrictMode>
        <App />
      </StrictMode>
    );
    const html = renderToString(app);
    expect(html).toContain("Caramel Matcha");
    expect(html).toContain("Strawberry Matcha");
    expect(html).toContain("Mon panier, 0 article");
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);
    const onRecoverableError = vi.fn();
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      await act(async () => {
        root = hydrateRoot(container, app, { onRecoverableError });
      });
      await waitFor(() =>
        expect(
          container.querySelector('[aria-label="Mon panier, 2 articles"]'),
        ).toBeInTheDocument(),
      );
      expect(
        container.querySelector(
          '[aria-label="Retirer Caramel Matcha des favoris"]',
        ),
      ).toHaveAttribute("aria-pressed", "true");
      expect(JSON.parse(localStorage.getItem("tirzah:cart:v1")!)).toEqual(
        savedCart,
      );
      expect(JSON.parse(localStorage.getItem("tirzah:favorites:v1")!)).toEqual([
        "matcha-caramel",
      ]);
      expect(onRecoverableError).not.toHaveBeenCalled();
    } finally {
      await act(async () => root?.unmount());
      container.remove();
    }
  });

  it("does not overwrite a new storage key with the old key's state", () => {
    localStorage.setItem("first", "1");
    localStorage.setItem("second", "2");
    const validate = (value: unknown): value is number =>
      typeof value === "number";
    const { result, rerender } = renderHook(
      ({ key }) => useStoredState(key, 0, validate),
      { initialProps: { key: "first" } },
    );
    expect(result.current[0]).toBe(1);
    rerender({ key: "second" });
    expect(result.current[0]).toBe(2);
    expect(localStorage.getItem("first")).toBe("1");
    expect(localStorage.getItem("second")).toBe("2");
    rerender({ key: "missing" });
    expect(result.current[0]).toBe(0);
  });
});
