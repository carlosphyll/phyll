export const categories = ["Burgers", "Acompanhamentos", "Bebidas", "Sobremesas"];

// Only burgers have options. Sides, drinks and desserts go straight to the bag.
export const menu = [
  { id: "classico", category: "Burgers", name: "Brasa Clássico", desc: "Blend de 160 g, queijo prato, alface, tomate e molho da casa.", price: 32, emoji: "🍔", options: true },
  { id: "bacon", category: "Burgers", name: "Bacon Brasa", desc: "Blend de 160 g, cheddar, bacon crocante e cebola caramelizada.", price: 38, emoji: "🥓", options: true },
  { id: "duplo", category: "Burgers", name: "Duplo Smash", desc: "Dois smash de 90 g, queijo americano duplo e picles.", price: 36, emoji: "🍔", options: true },
  { id: "veggie", category: "Burgers", name: "Veggie Grelhado", desc: "Hambúrguer de grão-de-bico, rúcula, tomate e maionese verde.", price: 30, emoji: "🥗", options: true },
  { id: "fritas", category: "Acompanhamentos", name: "Batata frita", desc: "Porção de 300 g com sal e alecrim.", price: 16, emoji: "🍟" },
  { id: "onion", category: "Acompanhamentos", name: "Onion rings", desc: "Anéis de cebola empanados, porção de 250 g.", price: 18, emoji: "🧅" },
  { id: "refri", category: "Bebidas", name: "Refrigerante lata", desc: "Coca-Cola, Guaraná ou Sprite, 350 ml.", price: 7, emoji: "🥤" },
  { id: "suco", category: "Bebidas", name: "Suco natural", desc: "Laranja ou limão, 500 ml.", price: 10, emoji: "🧃" },
  { id: "brownie", category: "Sobremesas", name: "Brownie", desc: "Brownie de chocolate com calda quente.", price: 14, emoji: "🍫" },
];

export const extras = [
  { id: "bacon", name: "Bacon", price: 4 },
  { id: "cheddar", name: "Cheddar", price: 3 },
  { id: "ovo", name: "Ovo", price: 2 },
  { id: "cebola", name: "Cebola caramelizada", price: 3 },
];

export const removable = ["Sem cebola", "Sem tomate", "Sem picles", "Sem molho"];
export const PONTOS = ["Mal passado", "Ao ponto", "Bem passado"];
export const PAES = ["Brioche", "Australiano", "Integral"];

// What most people order, so a burger can go to the bag in one tap.
export const defaultOptions = () => ({ ponto: "Ao ponto", pao: "Brioche", extras: [], remove: [], obs: "" });

export const DELIVERY_FEE = 8;
export const STORE = {
  address: "Rua das Palmeiras, 45, Vila Nova",
  hours: "Aberto todos os dias, das 18h às 23h30",
  whatsapp: "5511999990000",
};

export function optionSummary(options) {
  if (!options) return "";
  const added = options.extras.map((id) => `com ${extras.find((x) => x.id === id).name.toLowerCase()}`);
  return [options.ponto, options.pao, ...added, ...options.remove, options.obs && `"${options.obs}"`].filter(Boolean).join(" · ");
}

export const unitPrice = (product, options) =>
  product.price + (options?.extras ?? []).reduce((sum, id) => sum + extras.find((x) => x.id === id).price, 0);
