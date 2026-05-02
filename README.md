# Àpats Aina

App per gestionar els sopars de l'Aina basant-se en el menú de l'escola.
HTML estàtic + Cloudflare Pages Functions + Workers KV.

## Què hi ha aquí

- `index.html` — l'app sencera (frontend).
- `functions/api/state.js` — endpoint únic per llegir/guardar l'estat. S'executa com a Pages Function (sobre Workers).
- L'estat (comentaris, inventari, edicions de dinars, llista de la compra) viu a Workers KV.

## Desplegament a Cloudflare (primera vegada)

### 1. Crear un namespace de KV

A [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **KV** → **Create a namespace**.

- Nom: `aina-state`
- Apunta't l'identificador (no cal copiar-lo, només cal saber que existeix).

### 2. Connectar el repo a Cloudflare Pages

A **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.

- Selecciona el repo `Apats-Aina`.
- Build command: *(buit)*
- Build output directory: `/`
- Desplega.

Et donarà una URL del tipus `apats-aina.pages.dev`.

### 3. Configurar les variables i el binding de KV

A la mateixa pàgina del projecte → **Settings** → **Environment variables** (Production):

- Afegeix `AUTH_KEY` amb un valor secret (ex: una contrasenya llarga que decideixis tu). Aquesta clau és la que introduiràs a l'app la primera vegada des de cada mòbil. **Marca-la com a Encrypted.**

A **Settings** → **Functions** → **KV namespace bindings**:

- Variable name: `AINA_KV`
- KV namespace: `aina-state`
- Desplega de nou (a la pestanya **Deployments** → **Retry deployment**) perquè agafi els canvis.

### 4. Afegir l'app al mòbil

Obre l'URL al mòbil → menú del navegador → **Afegeix a la pantalla d'inici**.
La primera vegada et demanarà la `AUTH_KEY`. La segona ja entra directament.

Repeteix-ho a l'altre mòbil amb la mateixa clau.

## Com s'utilitza

- Toca un sopar → veus la recepta, ingredients (✓ verd = ja tens, + taronja = falta), i pots marcar com ha anat (satisfacció, quantitat, comentari lliure).
- Toca un dinar de l'escola → pots editar-lo si l'Aina no s'ho ha menjat o ha estat diferent. Els canvis queden marcats per recalcular sopars.
- Pestanya **Estoc** → veure i ajustar el que tens a casa.
- Pestanya **Compra** → llista automàtica del que falta per als sopars de la setmana.

## Què es fa des de Claude (i no des de l'app)

- Generar nous sopars al començament de cada mes a partir del menú de l'escola.
- Recalcular sopars si edites un dinar.
- Processar tiquets de la compra (foto al xat → Claude actualitza l'inventari al servidor).
- Ajustar receptes segons el que ha agradat o no a l'Aina (segons feedback acumulat).

L'app és el "tauler de control" que els dos mòbils consulten i editen. Claude és qui omple i recalcula a través de la mateixa API.

## Endpoints de l'API

- `GET /api/state` — retorna l'estat sencer (JSON).
- `POST /api/state` — desa l'estat sencer (JSON al body).

Tots dos requereixen capçalera `x-auth: <AUTH_KEY>`.

## Esquema de l'estat

```json
{
  "feedback": {
    "2026-05-04-dinner": { "sat": "encantat", "amount": "tot", "comment": "..." }
  },
  "mealOverrides": {
    "2026-05-04-lunch": "Realment ha menjat només pasta",
    "2026-05-04-dinner": "id-recepta-alternativa"
  },
  "inventory": [
    { "cat": "Fresc", "name": "Ous", "qty": "6 unit" }
  ],
  "shopDone": {
    "Lluç fresc": true
  }
}
```

## Costos

Tot dins el pla gratuït de Cloudflare:
- Pages: 500 builds/mes (en farem 5-10).
- Functions: 100.000 peticions/dia.
- KV: 100.000 lectures/dia, 1.000 escriptures/dia.

Ús real previst: ~50 peticions/dia entre tots dos mòbils. Marge enorme.
