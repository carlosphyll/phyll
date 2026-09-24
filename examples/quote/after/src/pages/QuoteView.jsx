import { useEffect } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useApp } from "../App.jsx";
import QuoteDocument, { whatsappUrl } from "../QuoteDocument.jsx";

const secondary = "rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700";

export default function QuoteView() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { quotes, updateQuote } = useApp();
  const quote = quotes.find((q) => q.id === id);
  const printNow = params.get("imprimir") === "1";

  useEffect(() => {
    if (quote && printNow) window.print();
  }, [quote, printNow]);

  if (!quote) return <Navigate to="/orcamentos" replace />;
  const justSent = params.get("enviado") === "whatsapp";

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/orcamentos" className="inline-flex items-center gap-1 py-1 text-sm text-slate-600 hover:text-slate-900 print:hidden">
        <ChevronLeft size={16} /> Todos os orçamentos
      </Link>

      {justSent && (
        <div role="status" className="mt-4 rounded-2xl bg-indigo-50 p-5 text-indigo-900 print:hidden">
          <p className="font-bold">O WhatsApp abriu com o orçamento pronto ✨</p>
          <p className="mt-1 text-sm">
            Escolha {quote.client} nos contatos e toque em enviar. Quando o cliente responder, marque aqui se ele aprovou.
          </p>
        </div>
      )}

      <div className="mt-6">
        <QuoteDocument quote={quote} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 print:hidden">
        {quote.approved ? (
          <p className="rounded-xl bg-emerald-50 px-5 py-3 font-semibold text-emerald-700">
            Aprovado em {new Date(quote.approvedAt).toLocaleDateString("pt-BR")}
          </p>
        ) : (
          <button
            onClick={() => updateQuote(quote.id, { approved: true, approvedAt: new Date().toISOString() })}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 font-bold text-white shadow-lg shadow-indigo-500/30"
          >
            O cliente aprovou
          </button>
        )}
        <a
          href={whatsappUrl(quote)}
          target="_blank"
          rel="noreferrer"
          onClick={() => updateQuote(quote.id, { sentVia: "whatsapp" })}
          className={secondary}
        >
          Reenviar pelo WhatsApp
        </a>
        <button onClick={() => window.print()} className={secondary}>
          Baixar PDF
        </button>
        <Link to={`/novo?de=${quote.id}`} className={secondary}>
          Duplicar
        </Link>
      </div>
    </div>
  );
}
