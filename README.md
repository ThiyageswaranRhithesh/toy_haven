# Toy Haven

A six-page HTML, CSS and JavaScript demo store for COMP40053.

## Update your GitHub repository

1. Extract the ZIP.
2. Copy its contents into your existing toy_haven repository folder and replace matching files. Keep your existing .git folder and your wireframes/test documents.
3. Include every new file and folder, especially products-data.js, carousel.js, sw.js and icons/.
4. Commit and push to main. The existing GitHub Pages workflow is included.
5. Wait for the Pages deployment to finish, then refresh https://thiyageswaranrhithesh.github.io/toy_haven/.

Keep index.html in the repository root; do not upload the ZIP itself as the website.

## Features

- Shared JavaScript catalogue, category filtering and name search.
- Product-details dialog, daily featured product and rotating hero slideshow.
- Cart with quantity controls, accurate cent-based totals and persistent storage.
- Wishlist with Interested, Owned and Not Interested statuses.
- Custom validation and browser storage for newsletter and feedback submissions.
- Simulated checkout with order history, summary, animated confirmation and cart clearing.
- Accessible FAQ buttons, animated mobile menu, reveal animations and reduced-motion support.
- PWA manifest, PNG icons and a service worker that caches website assets for offline visits.

## Run locally

Use VS Code Live Server, or run `python -m http.server 8000` in this folder and open http://localhost:8000. Serve over localhost or HTTPS to use the service worker. Opening index.html directly does not provide PWA support.

## Code guide

- products-data.js: catalogue array; edit products here.
- script.js: reusable rendering, validation, browser storage and page interactions.
- carousel.js: promotional carousel timing and navigation.
- style.css: shared styles, responsive rules and animations.
- sw.js: offline cache. Change the CACHE version when deploying future asset changes.

The original hero promotions remain in index.html, so update those too if you change the catalogue. Amounts retain the original website's dollar currency.

Data is saved only in the current browser. This is a demonstration: it does not charge cards, send emails, transmit support requests or arrange deliveries. Do not enter real card details. Clearing site data removes saved carts, feedback, subscriptions and orders.

## Verification for this update

Passed automated DOM-based interaction checks for all six page initializations, catalogue search, product dialog, cart quantities/totals, wishlist persistence, checkout validation/order storage/cart clearing, newsletter validation/storage, feedback storage, FAQ and navigation. Script syntax and local asset references were also checked.

A full browser could not be installed in the review environment. Visual responsiveness, PWA installation/offline operation, W3C validators, WAVE and Lighthouse must be rechecked on the deployed update. Existing test results describe the previous version until rerun.
