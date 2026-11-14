# Queen Amapola

Static adult creator website for Queen Amapola. It uses plain HTML, CSS, JavaScript, and locally optimized photos. There is no backend, account system, or checkout.

## Run locally

From the project folder, start a static file server:

```powershell
py -m http.server 4176
```

Open http://localhost:4176. Visitors confirm they are 18+ for the current browser session before the page appears.

## Project structure

- `index.html` — age gate, page sections, links, and gallery
- `styles.css` — responsive visual system
- `script.js` — age confirmation and image slideshows
- `assets/photos/amapola/` — Queen Amapola's supplied photos, used across the page

The site links to Queen Amapola's X, YouPay, YouPay bio, Throne, and Telegram pages. The source YouTube section has been removed.
