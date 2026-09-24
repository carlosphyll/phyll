// The quote as the client sees it, plus the small helpers every page shares.

export const brl = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Accepts "1.500,50", "150,5" and "150.5".
export function toNumber(value) {
  const s = String(value ?? "").trim();
  const n = Number(s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s);
  return Number.isFinite(n) ? n : 0;
}

export const lineTotal = (item) => toNumber(item.qty) * toNumber(item.price);
export const totalOf = (quote) => quote.items.reduce((sum, item) => sum + lineTotal(item), 0);

export function validUntil(quote) {
  const d = new Date(quote.createdAt);
  d.setDate(d.getDate() + Number(quote.validDays));
  return d.toLocaleDateString("pt-BR");
}

export function statusOf(quote) {
  if (quote.approved) return { label: "Aprovado", className: "bg-emerald-50 text-emerald-700" };
  if (quote.sentVia === "whatsapp") return { label: "Enviado", className: "bg-indigo-50 text-indigo-700" };
  return { label: "PDF baixado", className: "bg-slate-100 text-slate-700" };
}

export function whatsappUrl(quote) {
  const items = quote.items
    .filter((item) => item.desc.trim())
    .map((item) => `- ${item.desc}${toNumber(item.qty) > 1 ? ` (${item.qty}x)` : ""}: ${brl(lineTotal(item))}`);
  const text = [
    `Olá, ${quote.client}! Segue o orçamento de ${quote.sender}:`,
    "",
    ...items,
    "",
    `Total: ${brl(totalOf(quote))}`,
    `Válido até ${validUntil(quote)}.`,
    ...(quote.payment ? [`Pagamento: ${quote.payment}.`] : []),
  ].join("\n");
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export default function QuoteDocument({ quote }) {
  const items = quote.items.filter((item) => item.desc.trim() || item.price);

  return (
    <article className="rounded-2xl bg-white p-6 shadow-xl shadow-indigo-500/10 md:p-8">
      <p className="text-sm font-semibold text-indigo-600">Orçamento nº {quote.number}</p>
      <h2 className="mt-1 text-2xl font-bold text-slate-900">{quote.client || "Nome do cliente"}</h2>
      <p className="mt-1 text-sm text-slate-600">
        De {quote.sender || "seu nome ou empresa"} · {new Date(quote.createdAt).toLocaleDateString("pt-BR")}
      </p>

      <table className="mt-6 w-full text-left text-sm">
        <thead className="text-xs uppercase text-slate-500">
          <tr>
            <th className="py-2 font-semibold">Item</th>
            <th className="py-2 text-right font-semibold">Qtd</th>
            <th className="py-2 text-right font-semibold">Valor</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr className="border-t border-slate-100">
              <td colSpan={3} className="py-3 text-slate-600">
                Os itens aparecem aqui enquanto você escreve.
              </td>
            </tr>
          )}
          {items.map((item, i) => (
            <tr key={i} className="border-t border-slate-100">
              <td className="py-3 text-slate-900">{item.desc}</td>
              <td className="py-3 text-right text-slate-600">{item.qty}</td>
              <td className="py-3 text-right text-slate-900">{brl(lineTotal(item))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex items-baseline justify-between border-t border-slate-200 pt-4">
        <span className="font-semibold text-slate-900">Total</span>
        <span className="text-2xl font-extrabold text-slate-900">{brl(totalOf(quote))}</span>
      </div>
      <p className="mt-4 text-sm text-slate-600">
        Válido até {validUntil(quote)}.{quote.payment ? ` Pagamento: ${quote.payment}.` : ""}
      </p>
      {quote.notes && <p className="mt-2 text-sm text-slate-600">{quote.notes}</p>}
    </article>
  );
}
