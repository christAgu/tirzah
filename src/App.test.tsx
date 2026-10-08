import {
  render,
  screen,
  within,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: false })),
  );
  Element.prototype.scrollIntoView = vi.fn();
});

describe("Tirzah app", () => {
  it("displays the new footer slogan while keeping the café navigation", () => {
    render(<App />);
    const footer = screen.getByRole("contentinfo");
    expect(footer.querySelector(".footer-wordmark")).toHaveTextContent(
      "let's matcha",
    );
    expect(
      footer.querySelector(".footer-wordmark img"),
    ).not.toBeInTheDocument();
    expect(
      within(footer).getByRole("link", { name: "La carte" }),
    ).toHaveAttribute("href", "#la-carte");
  });

  it("filters the menu and persists favorites", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    await user.click(screen.getByRole("button", { name: "Coffee lovers" }));
    expect(
      screen.getByRole("button", { name: "Personnaliser Caramel Cloud" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Personnaliser Caramel Matcha" }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Mes favoris" }));
    expect(
      screen.getByText("Garde tes petits crushs ici."),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Les signatures" }));
    await user.click(
      screen.getByRole("button", {
        name: "Ajouter Caramel Matcha aux favoris",
      }),
    );
    await user.click(screen.getByRole("button", { name: "Mes favoris" }));
    expect(
      screen.getByRole("button", { name: "Personnaliser Caramel Matcha" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Personnaliser Caramel Cloud" }),
    ).not.toBeInTheDocument();
    unmount();
    render(<App />);
    expect(
      screen.getByRole("button", {
        name: "Retirer Caramel Matcha des favoris",
      }),
    ).toHaveAttribute("aria-pressed", "true");
    await user.click(
      screen.getByRole("button", {
        name: "Retirer Caramel Matcha des favoris",
      }),
    );
    expect(
      screen.getByRole("button", {
        name: "Ajouter Caramel Matcha aux favoris",
      }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("customizes, persists, updates and removes cart items", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    await user.click(
      screen.getByRole("button", { name: "Ajouter Caramel Matcha au panier" }),
    );
    const product = screen.getByRole("dialog");
    expect(
      within(product).queryByRole("radio", { name: "Chaud" }),
    ).not.toBeInTheDocument();
    await user.click(within(product).getByRole("radio", { name: /Avoine/ }));
    await user.click(
      within(product).getByRole("button", {
        name: "Augmenter la quantité de Caramel Matcha",
      }),
    );
    await user.click(
      within(product).getByRole("button", { name: /Ajouter · 14,00/ }),
    );
    expect(
      screen.getByRole("button", { name: "Mon panier, 2 articles" }),
    ).toBeInTheDocument();
    unmount();
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: "Mon panier, 2 articles" }),
    );
    const cart = screen.getByRole("dialog");
    expect(within(cart).getByText("Avoine · Glacé")).toBeInTheDocument();
    await user.click(
      within(cart).getByRole("button", { name: /Augmenter la quantité/ }),
    );
    expect(
      within(cart).getByRole("heading", { name: "Ton panier (3)" }),
    ).toBeInTheDocument();
    expect(within(cart).getAllByText(/21,00/)).toHaveLength(2);
    await user.click(
      within(cart).getByRole("button", { name: /Diminuer la quantité/ }),
    );
    await user.click(
      within(cart).getByRole("button", { name: /Retirer Caramel Matcha/ }),
    );
    expect(within(cart).getByText(/Ton prochain crush/)).toBeInTheDocument();
  });

  it("offers a demo recap without transmitting an order and handles clipboard errors", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole("button", {
        name: "Ajouter Matcha Essential au panier",
      }),
    );
    await user.click(screen.getByRole("radio", { name: "Glacé" }));
    await user.click(screen.getByRole("button", { name: /Ajouter · 5,50/ }));
    await user.click(
      screen.getByRole("button", { name: "Mon panier, 1 article" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Préparer mon récapitulatif" }),
    );
    expect(
      screen.getByText(/Aucune commande n’a été envoyée/),
    ).toBeInTheDocument();
    expect(
      (
        screen.getByRole("textbox", {
          name: "Récapitulatif du panier",
        }) as HTMLTextAreaElement
      ).value,
    ).toContain("glacé");
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    await user.click(
      screen.getByRole("button", { name: /Copier mon récapitulatif/ }),
    );
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining("aucune commande envoyée"),
    );
    expect(screen.getByText("Récapitulatif copié.")).toBeInTheDocument();
    writeText.mockRejectedValueOnce(new Error("denied"));
    await user.click(
      screen.getByRole("button", { name: /Copier mon récapitulatif/ }),
    );
    expect(screen.getByText(/Copie indisponible/)).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: /Modifier mon panier/ }),
    );
    expect(
      screen.getByRole("button", { name: "Préparer mon récapitulatif" }),
    ).toBeInTheDocument();
  });

  it("recommends the selected quiz mood and opens personalization", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: "Trouver mon matcha" }),
    );
    expect(screen.getByRole("button", { name: "Continuer" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: /Team fruité/ }));
    await user.click(screen.getByRole("button", { name: "Continuer" }));
    expect(
      screen.getByRole("button", { name: "Découvrir mon matcha" }),
    ).toBeDisabled();
    await user.click(screen.getByRole("button", { name: /Green mood/ }));
    await user.click(
      screen.getByRole("button", { name: "Découvrir mon matcha" }),
    );
    expect(
      within(screen.getByRole("dialog")).getByRole("heading", {
        name: "Strawberry Matcha",
      }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Le personnaliser" }));
    expect(
      screen.getByRole("dialog", { name: "Strawberry Matcha" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fermer" })).toHaveFocus();
  });

  it("traps dialog focus, restores it on Escape and locks background scrolling", async () => {
    const user = userEvent.setup();
    render(<App />);
    const trigger = screen.getByRole("button", {
      name: "Mon panier, 0 article",
    });
    await user.click(trigger);
    const close = screen.getByRole("button", { name: "Fermer" });
    expect(close).toHaveFocus();
    expect(document.body.style.overflow).toBe("hidden");
    await user.tab({ shift: true });
    expect(
      screen.getByRole("button", { name: "Explorer la carte" }),
    ).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe("");
  });

  it("recovers from corrupt browser storage", () => {
    localStorage.setItem("tirzah:cart:v1", "{broken");
    localStorage.setItem("tirzah:favorites:v1", JSON.stringify(["unknown"]));
    render(<App />);
    expect(
      screen.getByRole("button", { name: "Mon panier, 0 article" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Ajouter Caramel Matcha aux favoris",
      }),
    ).toBeInTheDocument();
  });

  it("opens mobile navigation, closes it for café info, and does not invent location details", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Ouvrir le menu" }));
    const mobile = screen.getByRole("navigation", {
      name: "Navigation mobile",
    });
    expect(
      screen.getByRole("button", { name: "Fermer le menu" }),
    ).toHaveAttribute("aria-expanded", "true");
    await user.click(within(mobile).getByRole("button", { name: "Le café" }));
    expect(
      screen.queryByRole("navigation", { name: "Navigation mobile" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("À confirmer — pas encore publiés."),
    ).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole("dialog").parentElement!);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("clears only the local app data on request", async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      "tirzah:cart:v1",
      JSON.stringify([
        {
          productId: "caramel-latte",
          milk: "classic",
          temperature: "iced",
          quantity: 1,
        },
      ]),
    );
    localStorage.setItem(
      "tirzah:favorites:v1",
      JSON.stringify(["caramel-latte"]),
    );
    localStorage.setItem("other-app", "untouched");
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: "À propos de cette démo" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Effacer mes données locales" }),
    );
    expect(
      screen.getByRole("button", { name: "Mon panier, 0 article" }),
    ).toBeInTheDocument();
    expect(localStorage.getItem("tirzah:cart:v1")).toBe("[]");
    expect(localStorage.getItem("tirzah:favorites:v1")).toBe("[]");
    expect(localStorage.getItem("other-app")).toBe("untouched");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });
});
