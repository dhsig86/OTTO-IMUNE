// Endpoint descontinuado — os cards de contexto foram removidos do UI.
// Mantido para não gerar 404 em clientes legados.
export async function GET() {
  return Response.json({ items: [], deprecated: true });
}
