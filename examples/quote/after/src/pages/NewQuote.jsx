import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, X } from "lucide-react";
import { useApp } from "../App.jsx";
import QuoteDocument, { toNumber, whatsappUrl } from "../QuoteDocument.jsx";

const input =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-indigo-500";
const label = "text-sm font-medium text-slate-700";
const emptyItem = { desc: "", qty: "1", price: "" };

export default function NewQuote() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { quotes, saveQuote, sender, setSender } = useApp();
  const copyOf = quotes.find((q) => q.id === params.get("de"));
  const [form, setForm] = useState(() => ({
    client: "",
    items: copyOf ? copyOf.items.map((item) => ({ ...item })) : [{ ...emptyItem }],
    validDays: copyOf?.validDays ?? "7",
    payment: copyOf?.payment ?? "",
    notes: copyOf?.notes ?? "",
  }));
  const [errors, setErrors] = useState({});
  const number = String(quotes.length + 1).padStart(3, "0");
  const quote = { id: number, number, sender, createdAt: new Date().toISOString(), ...form };

  const clear = (key) => setErrors((e) => ({ ...e, [key]: undefined }));
  const set = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    clear(key);
  };
  const setItem = (i, key) => (e) => {
    setForm({ ...form, items: form.items.map((item, j) => (j === i ? { ...item, [key]: e.target.value } : item)) });
    clear("items");
  };

  const check = () => {
    const next = {};
    if (!sender.trim()) next.sender = "Escreva seu nome ou o da empresa. Ele aparece no orçamento.";
    if (!form.client.trim()) next.client = "Escreva para quem é o orçamento.";
    if (!form.items.some((item) => item.desc.trim() && toNumber(item.price) > 0)) next.items = "Coloque pelo menos um item com descrição e valor.";
    setErrors(next);
    // Bring the first problem into view, so the person sees what is missing.
    requestAnimationFrame(() => document.querySelector("[role=alert]")?.scrollIntoView({ block: "center" }));
    return Object.keys(next).length === 0;
  };

  const save = (sentVia) => {
    const saved = { ...quote, sentVia, items: form.items.filter((item) => item.desc.trim()) };
    saveQuote(saved);
    return saved;
  };

  const sendWhatsApp = () => {
    if (!check()) return;
    const saved = save("whatsapp");
    window.open(whatsappUrl(saved), "_blank", "noopener");
    navigate(`/orcamentos/${saved.id}?enviado=whatsapp`);
  };

  const downloadPdf = () => {
    if (!check()) return;
    const saved = save("pdf");
    navigate(`/orcamentos/${saved.id}?imprimir=1`);
  };

  const error = (key) =>
    errors[key] && (
      <p role="alert" className="mt-2 text-sm font-medium text-red-600">
        {errors[key]}
      </p>
    );

  return (
    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Novo orçamento</h1>
        <p className="mt-2 text-slate-600">Escreva os itens. O total e o documento se montam enquanto você escreve.</p>

        <div className="mt-6 space-y-6 rounded-2xl bg-white p-6 shadow-xl shadow-indigo-500/10 md:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="sender" className={label}>
                Seu nome ou empresa
              </label>
              <input
                id="sender"
                className={`${input} mt-1`}
                value={sender}
                onChange={(e) => {
                  setSender(e.target.value);
                  clear("sender");
                }}
                placeholder="Ex.: Ana Pinturas"
                autoComplete="organization"
              />
              {error("sender")}
            </div>
            <div>
              <label htmlFor="client" className={label}>
                Cliente
              </label>
              <input id="client" className={`${input} mt-1`} value={form.client} onChange={set("client")} placeholder="Nome de quem vai receber" />
              {error("client")}
            </div>
          </div>

          <fieldset>
            <legend className={label}>Itens</legend>
            <div className="mt-2 hidden grid-cols-[1fr_4.5rem_7.5rem_2.5rem] gap-2 text-xs font-semibold uppercase text-slate-500 sm:grid">
              <span>Descrição</span>
              <span>Qtd</span>
              <span>Valor (R$)</span>
              <span />
            </div>
            {form.items.map((item, i) => (
              <div key={i} className="mt-2 grid grid-cols-[4.5rem_1fr_2.5rem] gap-2 sm:grid-cols-[1fr_4.5rem_7.5rem_2.5rem]">
                <input
                  aria-label={`Descrição do item ${i + 1}`}
                  className={`${input} col-span-3 sm:col-span-1`}
                  value={item.desc}
                  onChange={setItem(i, "desc")}
                  placeholder="Ex.: Pintura da sala"
                />
                <span className="text-xs font-semibold uppercase text-slate-500 sm:hidden">Qtd</span>
                <span className="col-span-2 text-xs font-semibold uppercase text-slate-500 sm:hidden">Valor (R$)</span>
                <input aria-label={`Quantidade do item ${i + 1}`} inputMode="numeric" className={input} value={item.qty} onChange={setItem(i, "qty")} />
                <input
                  aria-label={`Valor do item ${i + 1}, em reais`}
                  inputMode="decimal"
                  className={input}
                  value={item.price}
                  onChange={setItem(i, "price")}
                  placeholder="0,00"
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, items: form.items.filter((_, j) => j !== i) })}
                  disabled={form.items.length === 1}
                  aria-label={`Remover o item ${i + 1}`}
                  className="flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 disabled:invisible"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            {error("items")}
            <button
              type="button"
              onClick={() => setForm({ ...form, items: [...form.items, { ...emptyItem }] })}
              className="mt-3 flex items-center gap-2 py-1 text-sm font-semibold text-indigo-600"
            >
              <Plus size={16} /> Adicionar item
            </button>
          </fieldset>

          <details>
            <summary className="cursor-pointer py-1 text-sm font-semibold text-indigo-600">Validade, pagamento e observações</summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="valid" className={label}>
                  Válido por
                </label>
                <select id="valid" className={`${input} mt-1`} value={form.validDays} onChange={set("validDays")}>
                  <option value="7">7 dias</option>
                  <option value="15">15 dias</option>
                  <option value="30">30 dias</option>
                </select>
              </div>
              <div>
                <label htmlFor="payment" className={label}>
                  Pagamento
                </label>
                <input id="payment" className={`${input} mt-1`} value={form.payment} onChange={set("payment")} placeholder="Ex.: PIX, metade no início" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="notes" className={label}>
                  Observações
                </label>
                <textarea id="notes" rows={3} className={`${input} mt-1`} value={form.notes} onChange={set("notes")} />
              </div>
            </div>
          </details>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-600 lg:mt-20">Assim o cliente vai ver</p>
        <div className="mt-3">
          <QuoteDocument quote={quote} />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={sendWhatsApp}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3 font-bold text-white shadow-lg shadow-indigo-500/30"
          >
            Enviar pelo WhatsApp
          </button>
          <button onClick={downloadPdf} className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700">
            Baixar PDF
          </button>
        </div>
        <p className="mt-3 text-sm text-slate-600">O WhatsApp abre com a mensagem pronta. Você escolhe o contato e envia.</p>
      </div>
    </div>
  );
}
