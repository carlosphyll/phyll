import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Plus } from "lucide-react";
import { useApp } from "../App.jsx";

const steps = ["Sua empresa", "Cliente", "Itens", "Condições", "Documento", "Revisão"];
const UFS = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];
const input = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400";
const emptyItem = { codigo: "", descricao: "", unidade: "UN", qtd: "", valor: "", desconto: "" };

export default function NewQuote() {
  const navigate = useNavigate();
  const { quotes, setQuotes, showToast } = useApp();
  const [step, setStep] = useState(0);
  const [company, setCompany] = useState({ razao: "", fantasia: "", cnpj: "", ie: "", endereco: "", cidade: "", uf: "", cep: "", telefone: "", email: "" });
  const [client, setClient] = useState({ tipo: "PF", nome: "", doc: "", email: "", telefone: "", endereco: "", cidade: "", uf: "", cep: "" });
  const [items, setItems] = useState([emptyItem]);
  const [terms, setTerms] = useState({ validade: "", prazo: "", pagamento: "", condicao: "", descontoGeral: "", frete: "", obs: "" });
  const [doc, setDoc] = useState({ modelo: "Moderno", cor: "#4f46e5", moeda: "BRL", idioma: "pt-BR", impostos: false, numeracao: true });

  const field = (obj, setObj, key) => ({
    value: obj[key],
    onChange: (e) => setObj({ ...obj, [key]: e.target.value }),
  });
  const toggle = (key) => (e) => setDoc({ ...doc, [key]: e.target.checked });
  const setItem = (i, key) => (e) => setItems(items.map((x, j) => (j === i ? { ...x, [key]: e.target.value } : x)));
  const total = items.reduce((sum, it) => sum + (Number(it.qtd) || 0) * (Number(it.valor) || 0) * (1 - (Number(it.desconto) || 0) / 100), 0);

  const canNext = [
    company.razao && company.cnpj && company.email,
    client.nome && client.doc && client.email,
    items.every((it) => it.descricao && it.qtd && it.valor),
    terms.validade && terms.pagamento,
    true,
    true,
  ][step];

  const finish = () => {
    const id = `ORC-2026-00${126 + quotes.length}`;
    setQuotes([{ id, client: client.nome, total, status: "DRAFT", date: new Date().toISOString().slice(0, 10) }, ...quotes]);
    showToast("Orçamento gerado com sucesso! 🎉");
    navigate("/app/orcamentos");
  };

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold text-slate-900">Novo Orçamento</h1>

      <div className="mt-8 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                i <= step ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white" : "bg-slate-200 text-slate-400"
              }`}
            >
              {i < step ? <Check size={16} /> : i + 1}
            </div>
            <span className={`text-xs font-semibold ${i === step ? "text-indigo-600" : "text-slate-400"}`}>{s}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-white p-8 shadow-xl shadow-indigo-500/10">
        {step === 0 && (
          <div className="grid grid-cols-2 gap-4">
            <input className={input} placeholder="Razão social *" {...field(company, setCompany, "razao")} />
            <input className={input} placeholder="Nome fantasia" {...field(company, setCompany, "fantasia")} />
            <input className={input} placeholder="CNPJ *" {...field(company, setCompany, "cnpj")} />
            <input className={input} placeholder="Inscrição estadual" {...field(company, setCompany, "ie")} />
            <input className={`${input} col-span-2`} placeholder="Endereço" {...field(company, setCompany, "endereco")} />
            <input className={input} placeholder="Cidade" {...field(company, setCompany, "cidade")} />
            <select className={input} {...field(company, setCompany, "uf")}>
              <option value="">Estado</option>
              {UFS.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
            <input className={input} placeholder="CEP" {...field(company, setCompany, "cep")} />
            <input className={input} placeholder="Telefone" {...field(company, setCompany, "telefone")} />
            <input className={`${input} col-span-2`} type="email" placeholder="E-mail *" {...field(company, setCompany, "email")} />
            <div className="col-span-2 rounded-xl border-2 border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
              Arraste sua logo aqui ou{" "}
              <label className="cursor-pointer font-semibold text-indigo-600">
                procure
                <input type="file" className="hidden" />
              </label>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-2 gap-4">
            <select className={`${input} col-span-2`} {...field(client, setClient, "tipo")}>
              <option value="PF">Pessoa física</option>
              <option value="PJ">Pessoa jurídica</option>
            </select>
            <input className={`${input} col-span-2`} placeholder={client.tipo === "PF" ? "Nome completo *" : "Razão social *"} {...field(client, setClient, "nome")} />
            <input className={input} placeholder={client.tipo === "PF" ? "CPF *" : "CNPJ *"} {...field(client, setClient, "doc")} />
            <input className={input} type="email" placeholder="E-mail *" {...field(client, setClient, "email")} />
            <input className={input} placeholder="Telefone" {...field(client, setClient, "telefone")} />
            <input className={input} placeholder="CEP" {...field(client, setClient, "cep")} />
            <input className={`${input} col-span-2`} placeholder="Endereço" {...field(client, setClient, "endereco")} />
            <input className={input} placeholder="Cidade" {...field(client, setClient, "cidade")} />
            <select className={input} {...field(client, setClient, "uf")}>
              <option value="">Estado</option>
              {UFS.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="grid grid-cols-12 gap-3 text-xs font-semibold uppercase text-slate-400">
              <span className="col-span-2">Código</span>
              <span className="col-span-4">Descrição *</span>
              <span className="col-span-1">Un.</span>
              <span className="col-span-1">Qtd *</span>
              <span className="col-span-2">Valor unit. *</span>
              <span className="col-span-2">Desc. %</span>
            </div>
            {items.map((it, i) => (
              <div key={i} className="mt-3 grid grid-cols-12 gap-3">
                <input className={`${input} col-span-2`} value={it.codigo} onChange={setItem(i, "codigo")} />
                <input className={`${input} col-span-4`} value={it.descricao} onChange={setItem(i, "descricao")} />
                <select className={`${input} col-span-1 px-2`} value={it.unidade} onChange={setItem(i, "unidade")}>
                  <option>UN</option>
                  <option>H</option>
                  <option>M²</option>
                  <option>KG</option>
                </select>
                <input className={`${input} col-span-1`} value={it.qtd} onChange={setItem(i, "qtd")} />
                <input className={`${input} col-span-2`} value={it.valor} onChange={setItem(i, "valor")} />
                <input className={`${input} col-span-2`} value={it.desconto} onChange={setItem(i, "desconto")} />
              </div>
            ))}
            <button onClick={() => setItems([...items, emptyItem])} className="mt-4 flex items-center gap-2 text-sm font-semibold text-indigo-600">
              <Plus size={16} /> Adicionar item
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-2 gap-4">
            <input className={input} placeholder="Validade da proposta (dias) *" {...field(terms, setTerms, "validade")} />
            <input className={input} placeholder="Prazo de entrega" {...field(terms, setTerms, "prazo")} />
            <select className={input} {...field(terms, setTerms, "pagamento")}>
              <option value="">Forma de pagamento *</option>
              <option>PIX</option>
              <option>Boleto</option>
              <option>Cartão de crédito</option>
              <option>Transferência</option>
            </select>
            <select className={input} {...field(terms, setTerms, "condicao")}>
              <option value="">Condição de pagamento</option>
              <option>À vista</option>
              <option>30 dias</option>
              <option>30/60 dias</option>
              <option>30/60/90 dias</option>
            </select>
            <input className={input} placeholder="Desconto geral (%)" {...field(terms, setTerms, "descontoGeral")} />
            <input className={input} placeholder="Frete (R$)" {...field(terms, setTerms, "frete")} />
            <textarea className={`${input} col-span-2`} rows={4} placeholder="Observações" {...field(terms, setTerms, "obs")} />
          </div>
        )}

        {step === 4 && (
          <div className="grid grid-cols-2 gap-4">
            <select className={input} {...field(doc, setDoc, "modelo")}>
              <option>Moderno</option>
              <option>Clássico</option>
              <option>Minimalista</option>
            </select>
            <input type="color" className="h-12 w-full rounded-xl border border-slate-200" {...field(doc, setDoc, "cor")} />
            <select className={input} {...field(doc, setDoc, "moeda")}>
              <option>BRL</option>
              <option>USD</option>
              <option>EUR</option>
            </select>
            <select className={input} {...field(doc, setDoc, "idioma")}>
              <option>pt-BR</option>
              <option>en-US</option>
              <option>es-ES</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-500">
              <input type="checkbox" checked={doc.impostos} onChange={toggle("impostos")} /> Exibir impostos
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-500">
              <input type="checkbox" checked={doc.numeracao} onChange={toggle("numeracao")} /> Numeração automática
            </label>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-2 text-sm text-slate-500">
            <p>
              <strong className="text-slate-900">Empresa:</strong> {company.razao} ({company.cnpj})
            </p>
            <p>
              <strong className="text-slate-900">Cliente:</strong> {client.nome} ({client.doc})
            </p>
            <p>
              <strong className="text-slate-900">Itens:</strong> {items.length}
            </p>
            <p>
              <strong className="text-slate-900">Total:</strong> {total.toFixed(2)} {doc.moeda}
            </p>
            <p>
              <strong className="text-slate-900">Validade:</strong> {terms.validade} dias
            </p>
          </div>
        )}

        <div className="mt-10 flex justify-between">
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)} className="rounded-xl border border-slate-200 px-6 py-3 font-semibold text-slate-700">
              Voltar
            </button>
          ) : (
            <span />
          )}
          <button
            disabled={!canNext}
            onClick={step < 5 ? () => setStep(step + 1) : finish}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3 font-bold text-white shadow-lg shadow-indigo-500/30 disabled:opacity-40"
          >
            {step < 5 ? "Continuar" : "Gerar orçamento"}
          </button>
        </div>
      </div>
    </div>
  );
}
