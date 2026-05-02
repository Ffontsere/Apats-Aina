// Endpoint únic per llegir i guardar l'estat de l'app.
// L'estat és un sol JSON que viu a Workers KV sota la clau "state".
//
// GET  /api/state  → retorna l'estat sencer
// POST /api/state  → reemplaça l'estat sencer (el client envia el JSON complet)
//
// Auth: capçalera "x-auth" amb el valor de la variable d'entorn AUTH_KEY.

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type, x-auth",
};

function checkAuth(request, env) {
  const provided = request.headers.get("x-auth");
  return provided && provided === env.AUTH_KEY;
}

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!checkAuth(request, env)) {
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  }
  const data = await env.AINA_KV.get("state");
  return new Response(data || "{}", {
    headers: { "content-type": "application/json", ...corsHeaders },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!checkAuth(request, env)) {
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  }
  const body = await request.text();
  // Validació mínima: ha de ser JSON vàlid
  try {
    JSON.parse(body);
  } catch (e) {
    return new Response("Invalid JSON", { status: 400, headers: corsHeaders });
  }
  await env.AINA_KV.put("state", body);
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "content-type": "application/json", ...corsHeaders },
  });
}
