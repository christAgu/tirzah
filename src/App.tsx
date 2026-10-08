import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  Coffee,
  Heart,
  Leaf,
  MapPin,
  Menu,
  Minus,
  Plus,
  ShoppingBag,
  Snowflake,
  Sparkles,
  Sun,
  Trash2,
  X,
} from "lucide-react";
import Modal from "./Modal";
import {
  addToCart,
  cartTotal,
  isCart,
  isFavorites,
  itemKey,
  itemPrice,
  milks,
  money,
  products,
  recommend,
  type CartItem,
  type Milk,
  type Product,
  type Temperature,
} from "./catalog";
import { useStoredState } from "./useStoredState";

type Dialog =
  | { type: "product"; product: Product }
  | { type: "cart" | "quiz" | "info" | "privacy" }
  | null;
type Filter = "all" | "matcha" | "coffee" | "favorites";

function Wordmark() {
  return (
    <img
      className="wordmark"
      src="/images/tirzah-wordmark.png"
      alt=""
      width="540"
      height="225"
    />
  );
}

function Flower({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`flower ${className}`}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M50 32C29 0 13 19 32 40C0 29 0 56 32 55C6 75 27 94 42 66C43 100 71 100 61 68C89 90 105 66 74 54C107 44 94 18 68 36C79 4 50-2 50 32Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="51" cy="51" r="9" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function Stamp() {
  return (
    <div className="brand-stamp" aria-label="Matcha, love et Paris">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <defs>
          <path
            id="stamp-circle"
            d="M60,60 m-43,0 a43,43 0 1,1 86,0 a43,43 0 1,1 -86,0"
          />
        </defs>
        <text>
          <textPath href="#stamp-circle" textLength="269">
            MATCHA · LOVE · PARIS · MATCHA · LOVE · PARIS ·{" "}
          </textPath>
        </text>
      </svg>
      <Flower />
    </div>
  );
}

function ProductCustomizer({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: (item: CartItem) => void;
}) {
  const [milk, setMilk] = useState<Milk>("classic");
  const [temperature, setTemperature] = useState<Temperature>(
    product.temperatures[0],
  );
  const [quantity, setQuantity] = useState(1);
  const item = { productId: product.id, milk, temperature, quantity };

  return (
    <div className="product-customizer">
      <div className={`customizer-image ${product.color}`}>
        <img src={product.image} alt={product.name} />
        <span className="product-tag">{product.tag}</span>
      </div>
      <div className="customizer-content">
        <p className="product-description">{product.description}</p>
        <fieldset>
          <legend>Ton mood</legend>
          <div className="option-row">
            {product.temperatures.map((t) => (
              <label
                className={`option ${temperature === t ? "selected" : ""}`}
                key={t}
              >
                <input
                  type="radio"
                  name="temperature"
                  value={t}
                  checked={temperature === t}
                  onChange={() => setTemperature(t)}
                />
                {t === "iced" ? <Snowflake size={17} /> : <Sun size={17} />}{" "}
                {t === "iced" ? "Glacé" : "Chaud"}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>Ton lait préféré</legend>
          <div className="milk-options">
            {milks.map((m) => (
              <label
                className={`option ${milk === m.id ? "selected" : ""}`}
                key={m.id}
              >
                <input
                  type="radio"
                  name="milk"
                  value={m.id}
                  checked={milk === m.id}
                  onChange={() => setMilk(m.id)}
                />
                <span>{m.label}</span>
                <small>{m.extra ? `+ ${money(m.extra)}` : "Inclus"}</small>
                {milk === m.id && <Check size={15} />}
              </label>
            ))}
          </div>
        </fieldset>
        <p className="allergen-note">{product.allergens}</p>
        <div className="customizer-bottom">
          <Quantity
            value={quantity}
            minus={() => setQuantity((q) => q - 1)}
            plus={() => setQuantity((q) => q + 1)}
            name={product.name}
          />
          <button className="button primary" onClick={() => onAdd(item)}>
            Ajouter · {money(itemPrice(item) * quantity)}
            <Plus size={18} />
          </button>
        </div>
        <p className="demo-note">Prix indicatifs · panier de démonstration</p>
      </div>
    </div>
  );
}

function Quantity({
  value,
  minus,
  plus,
  name,
}: {
  value: number;
  minus: () => void;
  plus: () => void;
  name: string;
}) {
  return (
    <div className="quantity">
      <button
        aria-label={`Diminuer la quantité de ${name}`}
        disabled={value <= 1}
        onClick={minus}
      >
        <Minus size={15} />
      </button>
      <span aria-label={`Quantité : ${value}`}>{value}</span>
      <button
        aria-label={`Augmenter la quantité de ${name}`}
        disabled={value >= 20}
        onClick={plus}
      >
        <Plus size={15} />
      </button>
    </div>
  );
}

function Cart({
  items,
  onChange,
  onRemove,
  close,
}: {
  items: CartItem[];
  onChange: (key: string, delta: number) => void;
  onRemove: (key: string) => void;
  close: () => void;
}) {
  const [review, setReview] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const summary =
    items
      .map(
        (item) =>
          `${item.quantity} × ${products.find((p) => p.id === item.productId)?.name} — ${milks.find((m) => m.id === item.milk)?.label}, ${item.temperature === "iced" ? "glacé" : "chaud"} — ${money(itemPrice(item) * item.quantity)}`,
      )
      .join("\n") +
    `\nTotal indicatif : ${money(cartTotal(items))}\nTirzah Café — panier de démonstration, aucune commande envoyée.`;

  if (!items.length)
    return (
      <div className="empty-cart">
        <div className="empty-icon">
          <ShoppingBag size={34} />
        </div>
        <h3>
          Ton prochain crush
          <br />
          t’attend.
        </h3>
        <p>
          Un matcha, un latte, un peu de douceur.
          <br />
          On commence par quoi ?
        </p>
        <button className="button primary" onClick={close}>
          Explorer la carte
          <ArrowRight size={18} />
        </button>
      </div>
    );

  if (review)
    return (
      <div className="cart-review">
        <span className="review-icon">
          <Check size={28} />
        </span>
        <p className="eyebrow">TON PETIT RITUEL</p>
        <h3>Ça, c’est ton mood.</h3>
        <p>
          Ton récapitulatif est prêt. Aucune commande n’a été envoyée et aucun
          paiement n’est demandé.
        </p>
        <textarea
          readOnly
          value={summary}
          aria-label="Récapitulatif du panier"
          rows={Math.min(12, items.length * 2 + 4)}
        />
        <button
          className="button primary"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(summary);
              setCopyMessage("Récapitulatif copié.");
            } catch {
              setCopyMessage(
                "Copie indisponible. Tu peux sélectionner le texte ci-dessus.",
              );
            }
          }}
        >
          Copier mon récapitulatif
          <ArrowUpRight size={18} />
        </button>
        <p role="status" className="copy-status">
          {copyMessage}
        </p>
        <button className="text-button" onClick={() => setReview(false)}>
          <ChevronLeft size={16} />
          Modifier mon panier
        </button>
      </div>
    );

  return (
    <>
      <p className="cart-intro">Un peu de douceur, à ta façon.</p>
      <div className="cart-items">
        {items.map((item) => {
          const product = products.find((p) => p.id === item.productId)!;
          const key = itemKey(item);
          return (
            <article className="cart-item" key={key}>
              <img src={product.image} alt="" />
              <div className="cart-item-info">
                <h3>{product.name}</h3>
                <p>
                  {milks.find((m) => m.id === item.milk)?.label} ·{" "}
                  {item.temperature === "iced" ? "Glacé" : "Chaud"}
                </p>
                <Quantity
                  value={item.quantity}
                  minus={() => onChange(key, -1)}
                  plus={() => onChange(key, 1)}
                  name={`${product.name}, ${milks.find((m) => m.id === item.milk)?.label}, ${item.temperature === "iced" ? "glacé" : "chaud"}`}
                />
              </div>
              <div className="cart-item-end">
                <strong>{money(itemPrice(item) * item.quantity)}</strong>
                <button
                  className="icon-button"
                  aria-label={`Retirer ${product.name}, ${milks.find((m) => m.id === item.milk)?.label}, ${item.temperature === "iced" ? "glacé" : "chaud"}`}
                  onClick={() => onRemove(key)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          );
        })}
      </div>
      <div className="cart-bottom">
        <div className="cart-total">
          <span>Total indicatif</span>
          <strong>{money(cartTotal(items))}</strong>
        </div>
        <button className="button primary" onClick={() => setReview(true)}>
          Préparer mon récapitulatif
          <ArrowRight size={18} />
        </button>
        <p className="demo-note">
          Ce panier est une démo. Ni paiement ni commande réelle.
        </p>
      </div>
    </>
  );
}

function Quiz({ choose }: { choose: (product: Product) => void }) {
  const [step, setStep] = useState(0);
  const [taste, setTaste] = useState("");
  const [mood, setMood] = useState("");
  const result = recommend(taste, mood);
  const answers =
    step === 0
      ? [
          {
            id: "sweet",
            name: "Team gourmand",
            desc: "Du caramel, de la douceur, encore.",
          },
          {
            id: "fruity",
            name: "Team fruité",
            desc: "Une petite touche de fraise, please.",
          },
          {
            id: "pure",
            name: "Team essentiel",
            desc: "Simple, doux, sans détour.",
          },
        ]
      : [
          {
            id: "matcha",
            name: "Green mood",
            desc: "Aujourd’hui, c’est matcha.",
          },
          {
            id: "coffee",
            name: "Coffee mood",
            desc: "Mon cœur penche pour le café.",
          },
        ];
  return (
    <div className="quiz-content">
      {step < 2 ? (
        <>
          <div className="quiz-progress">
            <span>QUESTION 0{step + 1} / 02</span>
            <div>
              <i className="filled" />
              <i className={step > 0 ? "filled" : ""} />
            </div>
          </div>
          <Flower />
          <h3>
            {step === 0
              ? "Ton cœur balance pour…"
              : "Et aujourd’hui, ton mood ?"}
          </h3>
          <p>Pas de mauvaise réponse. Juste ton prochain crush.</p>
          <div className="quiz-answers">
            {answers.map((a) => (
              <button
                className={`quiz-answer ${(step === 0 ? taste : mood) === a.id ? "selected" : ""}`}
                key={a.id}
                onClick={() => (step === 0 ? setTaste(a.id) : setMood(a.id))}
                aria-pressed={(step === 0 ? taste : mood) === a.id}
              >
                <span>
                  <strong>{a.name}</strong>
                  <small>{a.desc}</small>
                </span>
                {(step === 0 ? taste : mood) === a.id ? (
                  <Check size={20} />
                ) : (
                  <ArrowUpRight size={20} />
                )}
              </button>
            ))}
          </div>
          <div className="quiz-controls">
            {step > 0 && (
              <button className="text-button" onClick={() => setStep(0)}>
                <ChevronLeft size={16} />
                Retour
              </button>
            )}
            <button
              className="button primary"
              disabled={!(step === 0 ? taste : mood)}
              onClick={() => setStep((s) => s + 1)}
            >
              {step === 0 ? "Continuer" : "Découvrir mon matcha"}
              <ArrowRight size={18} />
            </button>
          </div>
        </>
      ) : (
        <div className="quiz-result">
          <p className="eyebrow">IT’S A MATCH !</p>
          <img src={result.image} alt={result.name} />
          <h3>{result.name}</h3>
          <p>{result.subtitle}</p>
          <button className="button primary" onClick={() => choose(result)}>
            Le personnaliser
            <ArrowRight size={18} />
          </button>
          <button
            className="text-button"
            onClick={() => {
              setStep(0);
              setTaste("");
              setMood("");
            }}
          >
            Refaire le quiz
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [filter, setFilter] = useState<Filter>("all");
  const [favorites, setFavorites] = useStoredState(
    "tirzah:favorites:v1",
    [] as string[],
    isFavorites,
  );
  const [cart, setCart] = useStoredState(
    "tirzah:cart:v1",
    [] as CartItem[],
    isCart,
  );
  const [dialog, setDialog] = useState<Dialog>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toast, setToast] = useState<{ text: string; key: number } | null>(
    null,
  );
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const visibleProducts = products.filter(
    (p) =>
      filter === "all" ||
      (filter === "favorites"
        ? favorites.includes(p.id)
        : p.category === filter),
  );
  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "Les signatures" },
    { id: "matcha", label: "Matcha lovers" },
    { id: "coffee", label: "Coffee lovers" },
    { id: "favorites", label: "Mes favoris" },
  ];

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const open = (next: Dialog) => {
    setMobileMenu(false);
    setDialog(next);
  };
  const scrollToMenu = () => {
    setMobileMenu(false);
    document.getElementById("la-carte")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };

  return (
    <>
      <div className="app-shell" inert={dialog !== null}>
        <a className="skip-link" href="#main">
          Aller au contenu
        </a>
        <div className="announcement">
          <span>Un peu de matcha. Beaucoup de love.</span>
          <span className="announcement-right">
            PARIS, FRANCE <span className="tiny-star">✳</span>
          </span>
        </div>
        <header className="site-header">
          <a
            className="logo"
            href="#"
            aria-label="Tirzah Café, accueil"
            onClick={() => setMobileMenu(false)}
          >
            <Wordmark />
          </a>
          <nav className="desktop-nav" aria-label="Navigation principale">
            <a href="#la-carte">La carte</a>
            <a href="#notre-mood">Notre mood</a>
            <button onClick={() => open({ type: "info" })}>
              Le café
              <ArrowUpRight size={13} />
            </button>
          </nav>
          <div className="header-actions">
            <button
              className="cart-button"
              onClick={() => open({ type: "cart" })}
              aria-label={`Mon panier, ${count} article${count > 1 ? "s" : ""}`}
            >
              <ShoppingBag size={17} />
              <span>Mon panier</span>
              <span className="cart-count">{count}</span>
            </button>
            <button
              className="mobile-menu-button icon-button"
              onClick={() => setMobileMenu((m) => !m)}
              aria-expanded={mobileMenu}
              aria-controls="mobile-navigation"
              aria-label={mobileMenu ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {mobileMenu ? <X /> : <Menu />}
            </button>
          </div>
          {mobileMenu && (
            <nav
              className="mobile-nav"
              id="mobile-navigation"
              aria-label="Navigation mobile"
            >
              <a href="#la-carte" onClick={() => setMobileMenu(false)}>
                La carte
                <ArrowRight size={18} />
              </a>
              <a href="#notre-mood" onClick={() => setMobileMenu(false)}>
                Notre mood
                <ArrowRight size={18} />
              </a>
              <button onClick={() => open({ type: "info" })}>
                Le café
                <ArrowUpRight size={18} />
              </button>
            </nav>
          )}
        </header>
        <main id="main">
          <section
            className="hero section-container"
            aria-labelledby="hero-title"
          >
            <div className="hero-copy">
              <p className="eyebrow">
                <span className="green-dot" /> MATCHA, LOVE & PARIS.
              </p>
              <h1 id="hero-title">
                Ton nouveau
                <br />
                <em>happy place.</em>
                <svg
                  className="hero-spark"
                  viewBox="0 0 52 58"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M7 26 2 12M20 17 23 2M31 27 47 15"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </h1>
              <p className="hero-description">
                Du matcha à Paris, de la douceur et des moments
                <br className="desktop-break" /> qui font du bien. Bienvenue
                chez tirzah.
              </p>
              <div className="hero-buttons">
                <a className="button primary" href="#la-carte">
                  Découvrir la carte
                  <ArrowUpRight size={20} />
                </a>
                <button
                  className="text-button"
                  onClick={() => open({ type: "quiz" })}
                >
                  Trouver mon matcha
                  <ArrowRight size={17} />
                </button>
              </div>
              <div className="hero-footnote">
                <div className="mini-symbol">
                  <Leaf size={20} />
                </div>
                <p>
                  Plus qu’une boisson.
                  <br />
                  <strong>Ton petit rituel préféré.</strong>
                </p>
              </div>
              <a className="scroll-hint" href="#la-carte">
                <ArrowDown size={15} /> PRENDS UNE PAUSE, SCROLLE UN PEU
              </a>
            </div>
            <div className="hero-visual">
              <img
                className="hero-photo"
                src="/images/hero-matcha.webp"
                srcSet="/images/hero-matcha-480.webp 480w, /images/hero-matcha.webp 900w"
                sizes="(max-width: 650px) calc(100vw - 40px), (max-width: 1150px) 45vw, 580px"
                width="900"
                height="1350"
                decoding="async"
                alt="Matcha glacé au caramel et latte gourmand, dans des gobelets Tirzah, baignés de lumière"
                fetchPriority="high"
              />
              <Stamp />
              <div className="photo-note">
                <span className="handwriting">a little sip of happiness</span>
                <Heart size={15} />
              </div>
              <div className="hero-image-caption">
                <span>LE RITUEL TIRZAH</span>
                <span>01 — MATCHA MOOD</span>
              </div>
            </div>
          </section>
          <div
            className="mood-strip"
            aria-label="Good matcha. Good mood. Good company."
          >
            <div>
              {[0, 1, 2].map((n) => (
                <span key={n} aria-hidden={n > 0}>
                  GOOD MATCHA.
                  <Flower />
                  GOOD MOOD.
                  <Flower />
                  GOOD COMPANY.
                  <Flower />
                </span>
              ))}
            </div>
          </div>
          <section
            className="menu-section section-container"
            id="la-carte"
            aria-labelledby="menu-title"
          >
            <div className="section-heading">
              <div>
                <p className="eyebrow">LA CARTE, VERSION CRUSH</p>
                <h2 id="menu-title">
                  À chacun <em>son mood.</em>
                </h2>
              </div>
              <p>
                Ton classique de demain se trouve ici.
                <br />
                Fais-toi plaisir, on s’occupe du reste.
              </p>
            </div>
            <div className="menu-toolbar">
              <div className="filters" aria-label="Filtrer la carte">
                {filters.map((f) => (
                  <button
                    key={f.id}
                    className={filter === f.id ? "active" : ""}
                    aria-pressed={filter === f.id}
                    onClick={() => setFilter(f.id)}
                  >
                    {f.id === "favorites" && <Heart size={14} />} {f.label}
                  </button>
                ))}
              </div>
              <span className="menu-note">
                CARTE DÉCOUVERTE · PRIX INDICATIFS
              </span>
            </div>
            <div className="products-grid">
              {visibleProducts.map((product) => (
                <article className="product-card" key={product.id}>
                  <div className={`product-image ${product.color}`}>
                    <button
                      className="product-image-link"
                      aria-label={`Personnaliser ${product.name}`}
                      onClick={() => open({ type: "product", product })}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        width="768"
                        height="512"
                        decoding="async"
                        loading="lazy"
                      />
                    </button>
                    <span className="product-tag">{product.tag}</span>
                    <button
                      className={`favorite-button ${favorites.includes(product.id) ? "is-favorite" : ""}`}
                      aria-label={`${favorites.includes(product.id) ? "Retirer" : "Ajouter"} ${product.name} ${favorites.includes(product.id) ? "des" : "aux"} favoris`}
                      aria-pressed={favorites.includes(product.id)}
                      onClick={() =>
                        setFavorites((prev) =>
                          prev.includes(product.id)
                            ? prev.filter((id) => id !== product.id)
                            : [...prev, product.id],
                        )
                      }
                    >
                      <Heart
                        size={18}
                        fill={
                          favorites.includes(product.id)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>
                  </div>
                  <div className="product-info">
                    <div className="product-title-row">
                      <h3>
                        <button
                          onClick={() => open({ type: "product", product })}
                        >
                          {product.name}
                        </button>
                      </h3>
                      <span>{money(product.price)}</span>
                    </div>
                    <p>{product.subtitle}</p>
                    <button
                      className="add-product"
                      aria-label={`Ajouter ${product.name} au panier`}
                      onClick={() => open({ type: "product", product })}
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {visibleProducts.length === 0 && (
              <div className="favorites-empty">
                <Heart size={29} />
                <h3>Garde tes petits crushs ici.</h3>
                <p>
                  Un clic sur le cœur d’une boisson et elle rejoint tes favoris.
                </p>
                <button
                  className="text-button"
                  onClick={() => setFilter("all")}
                >
                  Découvrir les signatures
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
            <div className="menu-bottom">
              <span>
                <Leaf size={16} /> Ton lait, ton mood. Options avoine & coco.
              </span>
              <button
                className="text-button"
                onClick={() => open({ type: "quiz" })}
              >
                Tu hésites ? On te guide
                <ArrowUpRight size={17} />
              </button>
            </div>
          </section>
          <section
            className="story-section"
            id="notre-mood"
            aria-labelledby="story-title"
          >
            <div className="story-inner section-container">
              <div className="story-collage">
                <div className="polaroid polaroid-one">
                  <img
                    src="/images/original-matcha.webp"
                    alt="Le matcha original Tirzah, photographié sur une table"
                    width="768"
                    height="1024"
                    decoding="async"
                    loading="lazy"
                  />
                  <span>le début d’un rituel.</span>
                </div>
                <div className="polaroid polaroid-two">
                  <img
                    src="/images/original-caramel.webp"
                    alt="Le latte caramel original Tirzah avec sa chantilly"
                    width="768"
                    height="1024"
                    decoding="async"
                    loading="lazy"
                  />
                  <span>made with love ♡</span>
                </div>
                <Flower className="collage-flower" />
                <span className="collage-label">
                  LES VRAIES BOISSONS.
                  <br />
                  LA VRAIE INSPIRATION.
                </span>
              </div>
              <div className="story-copy">
                <p className="eyebrow">PAS JUSTE UN CAFÉ. UN ÉTAT D’ESPRIT.</p>
                <h2 id="story-title">
                  Un petit rituel.
                  <br />
                  Un grand <em>feeling.</em>
                </h2>
                <p>
                  Il y a les cafés qu’on traverse.
                  <br />
                  Et ceux qu’on a envie de retrouver.
                </p>
                <p>
                  Tirzah, c’est une invitation à ralentir. À te retrouver, à
                  retrouver tes gens. Un matcha à la main, Paris autour et un
                  peu de douceur au milieu.
                </p>
                <div className="story-values">
                  <span>
                    <Heart size={18} /> Du love, toujours
                  </span>
                  <span>
                    <Coffee size={18} /> À ta façon
                  </span>
                </div>
                <button
                  className="text-button"
                  onClick={() => open({ type: "info" })}
                >
                  On se retrouve chez tirzah ?<ArrowUpRight size={19} />
                </button>
              </div>
            </div>
          </section>
          <section
            className="quiz-section section-container"
            aria-labelledby="quiz-title"
          >
            <div className="quiz-banner">
              <div className="quiz-banner-copy">
                <p className="eyebrow">TON MATCHA SOULMATE EXISTE.</p>
                <h2 id="quiz-title">
                  Alors, c’est quoi
                  <br />
                  <em>ton matcha mood ?</em>
                </h2>
                <p>Deux petites questions. Une grande histoire de crush.</p>
                <button
                  className="button primary"
                  onClick={() => open({ type: "quiz" })}
                >
                  Let’s matcha
                  <ArrowUpRight size={19} />
                </button>
                <span className="quiz-time">30 secondes · 100 % toi</span>
              </div>
              <div className="quiz-banner-art" aria-hidden="true">
                <Flower />
                <div className="quiz-art-circle">
                  <span>
                    it’s a<br />
                    <em>matcha.</em>
                  </span>
                  <Heart size={28} />
                </div>
                <span className="art-note">made for your mood ↗</span>
                <Sparkles className="art-sparkles" size={35} />
              </div>
            </div>
          </section>
          <section className="visit-section section-container">
            <p className="eyebrow">
              <MapPin size={14} /> UN RITUEL PARISIEN
            </p>
            <h2>
              La vie est plus douce
              <br />
              <em>quand on se retrouve.</em>
            </h2>
            <button
              className="button outline"
              onClick={() => open({ type: "info" })}
            >
              Les infos du café
              <ArrowUpRight size={18} />
            </button>
            <Flower />
          </section>
        </main>
        <footer className="footer">
          <div className="footer-top section-container">
            <a
              className="logo"
              href="#"
              aria-label="Tirzah Café, retour en haut"
            >
              <Wordmark />
            </a>
            <span>
              Ta dose de matcha.
              <br />
              Ta dose de douceur.
            </span>
            <nav aria-label="Navigation de pied de page">
              <a href="#la-carte">La carte</a>
              <a href="#notre-mood">Notre mood</a>
              <button onClick={() => open({ type: "info" })}>
                Le café
                <ArrowUpRight size={14} />
              </button>
            </nav>
            <p>
              PARIS, AVEC LOVE.
              <Heart size={15} />
            </p>
          </div>
          <p className="footer-wordmark">
            let's <em>matcha</em>
            <span aria-hidden="true">✳</span>
          </p>
          <div className="footer-bottom section-container">
            <span>© {new Date().getFullYear()} Tirzah Café</span>
            <span>MATCHA, LOVE & GOOD COMPANY.</span>
            <span className="footer-credit">
              Créé par{" "}
              <a
                href="https://www.acxa.io/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Acxa Technology
              </a>
            </span>
            <button onClick={() => open({ type: "privacy" })}>
              À propos de cette démo
            </button>
          </div>
        </footer>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          <span>{toast.text}</span>
          <button
            onClick={() => {
              setToast(null);
              open({ type: "cart" });
            }}
          >
            Voir le panier
            <ArrowRight size={15} />
          </button>
          <button
            className="toast-close"
            aria-label="Fermer la notification"
            onClick={() => setToast(null)}
          >
            <X size={15} />
          </button>
        </div>
      )}
      {dialog?.type === "product" && (
        <Modal
          key={`product-${dialog.product.id}`}
          title={dialog.product.name}
          close={() => setDialog(null)}
          className="product-modal"
        >
          <ProductCustomizer
            key={dialog.product.id}
            product={dialog.product}
            onAdd={(item) => {
              setCart((prev) => addToCart(prev, item));
              setDialog(null);
              setToast({
                text: "Un peu de douceur dans ton panier.",
                key: Date.now(),
              });
            }}
          />
        </Modal>
      )}
      {dialog?.type === "cart" && (
        <Modal
          title={`Ton panier (${count})`}
          close={() => setDialog(null)}
          drawer
        >
          <Cart
            items={cart}
            onChange={(key, delta) =>
              setCart((prev) =>
                prev.map((item) =>
                  itemKey(item) === key
                    ? {
                        ...item,
                        quantity: Math.max(
                          1,
                          Math.min(20, item.quantity + delta),
                        ),
                      }
                    : item,
                ),
              )
            }
            onRemove={(key) =>
              setCart((prev) => prev.filter((item) => itemKey(item) !== key))
            }
            close={() => {
              setDialog(null);
              scrollToMenu();
            }}
          />
        </Modal>
      )}
      {dialog?.type === "quiz" && (
        <Modal
          key="quiz"
          title="Ton matcha mood"
          close={() => setDialog(null)}
          className="quiz-modal"
        >
          <Quiz choose={(product) => setDialog({ type: "product", product })} />
        </Modal>
      )}
      {dialog?.type === "info" && (
        <Modal
          title="On se retrouve à Paris."
          close={() => setDialog(null)}
          className="info-modal"
        >
          <div className="info-content">
            <Flower />
            <p className="eyebrow">TIRZAH CAFÉ · PARIS</p>
            <h3>
              Un café.
              <br />
              Mille petits moments.
            </h3>
            <p>
              Le lieu, les horaires et les liens officiels seront ajoutés dès
              leur confirmation par Tirzah.
            </p>
            <div className="info-status">
              <MapPin size={20} />
              <div>
                <strong>Adresse & horaires</strong>
                <span>À confirmer — pas encore publiés.</span>
              </div>
            </div>
            <button
              className="button primary"
              onClick={() => {
                setDialog(null);
                scrollToMenu();
              }}
            >
              En attendant, trouve ton crush
              <ArrowRight size={18} />
            </button>
          </div>
        </Modal>
      )}
      {dialog?.type === "privacy" && (
        <Modal
          title="Une première dose de Tirzah."
          close={() => setDialog(null)}
          className="info-modal"
        >
          <div className="info-content legal-content">
            <p>
              Cette app est une proposition de marque pour Tirzah Café. La
              carte, les recettes et les prix sont indicatifs, à valider par le
              café.
            </p>
            <p>
              Les visuels de campagne ont été créés à partir des photos
              originales fournies par Tirzah. Les photos de la section « Notre
              mood » sont les originales.
            </p>
            <p>
              Le panier ne transmet aucune commande et ne demande aucun
              paiement. Aucune adresse ou donnée de contact n’est collectée. Tes
              favoris et ton panier sont enregistrés uniquement dans ce
              navigateur.
            </p>
            <p>
              Les polices sont chargées depuis Google Fonts. Les données locales
              peuvent être effacées ci-dessous.
            </p>
            <button
              className="button outline"
              onClick={() => {
                setFavorites([]);
                setCart([]);
                setDialog(null);
                setToast({
                  text: "Tes favoris et ton panier ont été effacés.",
                  key: Date.now(),
                });
              }}
            >
              Effacer mes données locales
              <Trash2 size={16} />
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
