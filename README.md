# Tirzah Café

A mobile-first, French-language brand experience for a Parisian matcha café. React, TypeScript and Vite; no account, API key or backend required.

## Development

Requires Node.js 22.12+ and npm.

```sh
npm ci
npm run dev
```

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

## Included

- Filterable discovery menu, locally saved favorites
- Drink customization (milk, available temperature, quantity)
- Persistent local cart, editable quantities, item removal, copyable summary
- Two-question recommendation quiz
- Responsive navigation, accessible modal focus management, reduced-motion support
- Original café photos plus AI-created editorial campaign images inspired by them

## Before a real launch

This is a working **frontend concept**, not a real ordering service. Recipes and prices are proposals; the interface marks prices as indicative. Address, hours, contact details and official social links are intentionally unpublished until confirmed by the café. Milk alternatives do not guarantee a dairy-free drink: toppings and allergens need café verification.

No orders are transmitted and no payments are collected. Cart and favorites are stored in the current browser only; users can clear them from “À propos de cette démo”. Fonts load from Google Fonts. Generated imagery is disclosed in that dialog, and originals appear in “Notre mood”.

For production: validate product information and allergens, provide business/legal details, implement an ordering backend and payment provider if desired, and replace any unapproved campaign visuals. Deploy the built `dist` directory to any static host; this single-page app uses anchors, not route-based navigation.
