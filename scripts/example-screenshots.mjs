#!/usr/bin/env node
// Captures the same moments in the before and after version of each example app, at the same size,
// and composes a side-by-side comparison for each moment.
//
//   npm --prefix examples run dev:dm-before   (and the other dev:* scripts for the apps you want)
//   node scripts/example-screenshots.mjs [example ...]
//
// Output: examples/<example>/screenshots/<moment>-before.png, <moment>-after.png and compare-<moment>.png
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const VIEWPORTS = {
  desktop: { viewport: { width: 1440, height: 900 } },
  phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};

// The quote after app, with the same two items the before app gets.
const QUOTE_AFTER_FILLED = [
  ["goto", "/novo"],
  ["fill", "Seu nome ou empresa", "Ana Pinturas"],
  ["fill", "Cliente", "Carlos Mendes"],
  ["fill", "Descrição do item 1", "Pintura da sala"],
  ["fill", "Valor do item 1", "850"],
  ["click", "button", "Adicionar item"],
  ["fill", "Descrição do item 2", "Massa corrida e lixamento"],
  ["fill", "Valor do item 2", "320"],
];

// Each moment lists the steps to reach it in each version: [action, ...args].
// Actions: goto(path), click(role, name), clickNth(selector, index), clickText(text), clickInDialog(name), fill(label, value),
// fillPlaceholder(placeholder, value), fillNth(selector, index, value), select(label, option), selectNth(index, value),
// check(label), wait(ms).
export const EXAMPLES = {
  "dm-automation": {
    ports: { before: 5173, after: 5174 },
    moments: [
      { name: "first-screen", before: [["goto", "/"]], after: [["goto", "/"]] },
      { name: "empty-list", before: [["goto", "/flows"]], after: [["goto", "/flows"]] },
      {
        name: "create",
        before: [["goto", "/flows"], ["click", "button", "Create Flow"]],
        after: [
          ["goto", "/flows"],
          ["click", "button", "Create automation"],
          ["fill", "When someone comments", "LINK"],
          ["fill", "Send them this DM", "Here is the link you asked for: https://your-site.com/link"],
        ],
      },
      {
        name: "created",
        before: [
          ["goto", "/flows"],
          ["click", "button", "Create Flow"],
          ["fillPlaceholder", "Enter flow name", "Link in bio"],
          ["selectNth", 0, "COMMENT_KEYWORD"],
          ["fillPlaceholder", "keyword1, keyword2", "LINK"],
          ["selectNth", 1, "page_1784140"],
          ["fillNth", "textarea", 1, "Here is the link you asked for: https://your-site.com/link"],
          ["fillNth", "input[type=number]", 0, "0"],
          ["click", "button", "Submit"],
          ["wait", 400],
        ],
        after: [
          ["goto", "/flows"],
          ["click", "button", "Create automation"],
          ["fill", "When someone comments", "LINK"],
          ["fill", "Send them this DM", "Here is the link you asked for: https://your-site.com/link"],
          ["clickInDialog", "Create automation"],
          ["clickInDialog", "Send a test to myself"],
          ["wait", 300],
        ],
      },
      { name: "connect-instagram", before: [["goto", "/settings"]], after: [["goto", "/settings"]] },
      { name: "phone", viewport: "phone", fullPage: true, before: [["goto", "/flows"]], after: [["goto", "/flows"]] },
    ],
  },

  booking: {
    ports: { before: 5175, after: 5176 },
    labels: ["Antes", "Depois"],
    moments: [
      { name: "primeira-tela", before: [["goto", "/"]], after: [["goto", "/"]] },
      {
        name: "primeiro-clique",
        fullPage: true,
        before: [["goto", "/"], ["click", "link", "Agende agora"]],
        after: [["goto", "/"], ["click", "link", "Agendar horário"]],
      },
      {
        name: "campo-faltando",
        before: [["goto", "/cadastro"], ["fillNth", "form input", 0, "Carlos Silva"], ["fillNth", "form input", 5, "(11) 98888-7777"]],
        after: [["goto", "/agendar"], ["fill", "Nome", "Carlos"], ["click", "button", "Confirmar agendamento"]],
      },
      {
        name: "agendado",
        before: [
          ["goto", "/cadastro"],
          ["fillNth", "form input", 0, "Carlos Silva"],
          ["fillNth", "form input", 1, "carlos@exemplo.com"],
          ["fillNth", "form input", 2, "carlos@exemplo.com"],
          ["fillNth", "form input", 3, "senha-segura-1"],
          ["fillNth", "form input", 4, "senha-segura-1"],
          ["fillNth", "form input", 5, "(11) 98888-7777"],
          ["fillNth", "form input", 6, "123.456.789-00"],
          ["fillNth", "form input", 7, "1990-05-10"],
          ["selectNth", 0, "Masculino"],
          ["selectNth", 1, "Instagram"],
          ["check", "Aceito os termos"],
          ["click", "button", "Cadastrar"],
          ["click", "button", "Unidade Centro"],
          ["click", "button", "Próximo"],
          ["click", "button", "Corte Masculino"],
          ["click", "button", "Próximo"],
          ["click", "button", "Rafael"],
          ["click", "button", "Próximo"],
          ["click", "button", "24"],
          ["click", "button", "10:00"],
          ["click", "button", "Próximo"],
          ["selectNth", 0, "Pix"],
          ["check", "Li e aceito a política"],
          ["click", "button", "Confirmar agendamento"],
          ["wait", 300],
        ],
        after: [
          ["goto", "/agendar"],
          ["click", "button", "Corte Masculino"],
          ["clickNth", "fieldset:nth-of-type(2) button", 1],
          ["clickNth", "fieldset:nth-of-type(2) button", 4],
          ["fill", "Nome", "Carlos"],
          ["fill", "WhatsApp", "(11) 98888-7777"],
          ["click", "button", "Confirmar agendamento"],
          ["wait", 300],
        ],
      },
      { name: "celular", viewport: "phone", fullPage: true, before: [["goto", "/cadastro"]], after: [["goto", "/agendar"]] },
    ],
  },

  quote: {
    ports: { before: 5177, after: 5178 },
    labels: ["Antes", "Depois"],
    moments: [
      { name: "primeira-tela", before: [["goto", "/"]], after: [["goto", "/"]] },
      {
        name: "primeiro-clique",
        fullPage: true,
        before: [["goto", "/"], ["click", "link", "Comece grátis"]],
        after: [["goto", "/"], ["click", "link", "Fazer um orçamento"]],
      },
      {
        name: "novo-orcamento",
        fullPage: true,
        before: [["goto", "/entrar"], ["click", "button", "Entrar"], ["click", "link", "Novo orçamento"]],
        after: QUOTE_AFTER_FILLED,
      },
      {
        name: "enviado",
        before: [
          ["goto", "/entrar"],
          ["click", "button", "Entrar"],
          ["click", "link", "Novo orçamento"],
          ["fillPlaceholder", "Razão social *", "Ana Pinturas ME"],
          ["fillPlaceholder", "CNPJ *", "12.345.678/0001-90"],
          ["fillPlaceholder", "E-mail *", "ana@pinturas.com"],
          ["click", "button", "Continuar"],
          ["fillPlaceholder", "Nome completo *", "Carlos Mendes"],
          ["fillPlaceholder", "CPF *", "123.456.789-00"],
          ["fillPlaceholder", "E-mail *", "carlos@email.com"],
          ["click", "button", "Continuar"],
          ["fillNth", "input", 1, "Pintura da sala"],
          ["fillNth", "input", 2, "1"],
          ["fillNth", "input", 3, "850"],
          ["click", "button", "Adicionar item"],
          ["fillNth", "input", 6, "Massa corrida e lixamento"],
          ["fillNth", "input", 7, "1"],
          ["fillNth", "input", 8, "320"],
          ["click", "button", "Continuar"],
          ["fillPlaceholder", "Validade da proposta (dias) *", "7"],
          ["selectNth", 0, "PIX"],
          ["click", "button", "Continuar"],
          ["click", "button", "Continuar"],
          ["click", "button", "Gerar orçamento"],
          ["wait", 300],
        ],
        after: [...QUOTE_AFTER_FILLED, ["click", "button", "Enviar pelo WhatsApp"], ["wait", 300]],
      },
      {
        name: "lista",
        before: [["goto", "/entrar"], ["click", "button", "Entrar"], ["click", "link", "Orçamentos"]],
        after: [...QUOTE_AFTER_FILLED, ["click", "button", "Enviar pelo WhatsApp"], ["goto", "/orcamentos"]],
      },
      {
        name: "celular",
        viewport: "phone",
        fullPage: true,
        before: [["goto", "/entrar"], ["click", "button", "Entrar"], ["goto", "/app/orcamentos/novo"]],
        after: [["goto", "/novo"]],
      },
    ],
  },

  menu: {
    ports: { before: 5179, after: 5180 },
    labels: ["Antes", "Depois"],
    moments: [
      { name: "primeira-tela", before: [["goto", "/"]], after: [["goto", "/"]] },
      {
        name: "primeiro-clique",
        before: [["goto", "/"], ["click", "link", "Peça agora"]],
        after: [["goto", "/"], ["click", "link", "Ver cardápio e pedir"]],
      },
      {
        name: "adicionar-burger",
        before: [["goto", "/entrar"], ["click", "button", "Entrar"], ["clickNth", "main button:has-text('Adicionar')", 0]],
        after: [["goto", "/cardapio"], ["clickNth", "main button:has-text('Adicionar')", 0], ["wait", 200]],
      },
      {
        name: "adicionar-bebida",
        before: [
          ["goto", "/entrar"],
          ["click", "button", "Entrar"],
          ["click", "button", "Bebidas"],
          ["clickNth", "main button:has-text('Adicionar')", 0],
        ],
        after: [["goto", "/cardapio"], ["clickNth", "main button:has-text('Adicionar')", 6], ["wait", 200]],
      },
      {
        name: "finalizar",
        fullPage: true,
        before: [
          ["goto", "/entrar"],
          ["click", "button", "Entrar"],
          ["clickNth", "main button:has-text('Adicionar')", 0],
          ["clickText", "Ao ponto"],
          ["selectNth", 0, "Brioche"],
          ["click", "button", "Adicionar ao carrinho"],
          ["clickNth", "header button", 0],
          ["click", "button", "Finalizar compra"],
        ],
        after: [["goto", "/cardapio"], ["clickNth", "main button:has-text('Adicionar')", 0], ["click", "link", "Fazer pedido"]],
      },
      {
        name: "pedido-feito",
        before: [
          ["goto", "/entrar"],
          ["click", "button", "Entrar"],
          ["clickNth", "main button:has-text('Adicionar')", 0],
          ["clickText", "Ao ponto"],
          ["selectNth", 0, "Brioche"],
          ["click", "button", "Adicionar ao carrinho"],
          ["clickNth", "header button", 0],
          ["click", "button", "Finalizar compra"],
          ["fillPlaceholder", "Nome completo *", "Carlos Mendes"],
          ["fillPlaceholder", "Telefone *", "(11) 98888-7777"],
          ["check", "Entrega"],
          ["fillPlaceholder", "CEP *", "01234-000"],
          ["fillPlaceholder", "Rua *", "Rua das Flores"],
          ["fillPlaceholder", "Número *", "120"],
          ["fillPlaceholder", "Bairro *", "Centro"],
          ["fillPlaceholder", "Cidade *", "São Paulo"],
          ["selectNth", 0, "SP"],
          ["selectNth", 1, "PIX"],
          ["check", "Li e aceito os termos"],
          ["click", "button", "Finalizar pedido"],
          ["wait", 300],
        ],
        after: [
          ["goto", "/cardapio"],
          ["clickNth", "main button:has-text('Adicionar')", 0],
          ["click", "link", "Fazer pedido"],
          ["fill", "Endereço", "Rua das Flores, 120, Centro"],
          ["fill", "Nome", "Carlos"],
          ["fill", "WhatsApp", "(11) 98888-7777"],
          ["clickText", "Pix"],
          ["click", "button", "Enviar pedido"],
          ["wait", 300],
        ],
      },
      {
        name: "celular",
        viewport: "phone",
        before: [["goto", "/entrar"], ["click", "button", "Entrar"]],
        after: [["goto", "/cardapio"], ["clickNth", "main button:has-text('Adicionar')", 0], ["wait", 200]],
      },
    ],
  },
};

async function run(page, steps) {
  for (const [action, ...args] of steps) {
    if (action === "goto") await page.goto(new URL(args[0], page.baseUrl).href, { waitUntil: "networkidle" });
    else if (action === "click") await page.getByRole(args[0], { name: args[1], exact: false }).first().click();
    else if (action === "clickNth") await page.locator(args[0]).nth(args[1]).click();
    else if (action === "clickText") await page.getByText(args[0], { exact: true }).first().click();
    else if (action === "clickInDialog") await page.getByRole("dialog").getByRole("button", { name: args[0] }).click();
    else if (action === "fill") await page.getByLabel(args[0], { exact: false }).first().fill(args[1]);
    else if (action === "fillPlaceholder") await page.getByPlaceholder(args[0]).first().fill(args[1]);
    else if (action === "fillNth") await page.locator(args[0]).nth(args[1]).fill(args[2]);
    else if (action === "select") await page.getByLabel(args[0], { exact: false }).first().selectOption({ label: args[1] });
    else if (action === "selectNth") await page.locator("select").nth(args[0]).selectOption(args[1]);
    else if (action === "check") await page.getByLabel(args[0], { exact: false }).first().check();
    else if (action === "wait") await page.waitForTimeout(args[0]);
    else throw new Error(`unknown step ${action}`);
  }
}

async function compose(browser, shots, outPath, viewport) {
  const page = await browser.newPage({ viewport: { width: viewport === "phone" ? 900 : 1500, height: 400 } });
  const img = (p) => `data:image/png;base64,${readFileSync(p).toString("base64")}`;
  const html = `<!doctype html><html><body style="margin:0;background:#e5e7eb;font-family:system-ui,sans-serif">
    <div style="display:flex;gap:16px;padding:16px;align-items:flex-start">
      ${shots
        .map(
          ([label, p]) => `<figure style="margin:0;flex:1;min-width:0">
            <figcaption style="font-weight:700;font-size:15px;color:#111827;margin:0 0 8px">${label}</figcaption>
            <img src="${img(p)}" style="width:100%;display:block;border:1px solid #d1d5db;border-radius:8px;background:#fff">
          </figure>`,
        )
        .join("")}
    </div></body></html>`;
  await page.setContent(html, { waitUntil: "load" });
  await page.screenshot({ path: outPath, fullPage: true });
  await page.close();
}

async function capture(browser, name, example) {
  const out = join(ROOT, "examples", name, "screenshots");
  const labels = example.labels ?? ["Before", "After"];
  mkdirSync(out, { recursive: true });
  for (const moment of example.moments) {
    const files = {};
    for (const side of ["before", "after"]) {
      const context = await browser.newContext(VIEWPORTS[moment.viewport ?? "desktop"]);
      const page = await context.newPage();
      page.baseUrl = `http://localhost:${example.ports[side]}`;
      page.on("dialog", (d) => d.accept());
      await run(page, moment[side]);
      await page.waitForTimeout(300);
      files[side] = join(out, `${moment.name}-${side}.png`);
      await page.screenshot({ path: files[side], fullPage: moment.fullPage ?? false });
      await context.close();
    }
    const shots = [[labels[0], files.before], [labels[1], files.after]];
    await compose(browser, shots, join(out, `compare-${moment.name}.png`), moment.viewport);
    process.stdout.write(`  ${name}: ${moment.name}\n`);
  }
}

async function main() {
  const wanted = process.argv.slice(2);
  const names = wanted.length ? wanted : Object.keys(EXAMPLES);
  const browser = await chromium.launch();
  try {
    for (const name of names) {
      if (!EXAMPLES[name]) throw new Error(`unknown example ${name}; known: ${Object.keys(EXAMPLES).join(", ")}`);
      await capture(browser, name, EXAMPLES[name]);
    }
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) main();
