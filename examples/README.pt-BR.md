# Exemplos

[Read in English](README.md)

Quatro apps pequenos, cada um feito duas vezes.

- `before/` é o app do jeito que um gerador de código costuma escrever.
- `after/` é o mesmo app depois da revisão do Phyll, com as mesmas cores e componentes e muito menos para preencher.
- `review/` é a revisão do Phyll sobre a versão antes: a varredura, as capturas, as medições da sonda, o `report.json` e o `report.md` pronto.
- `screenshots/` guarda comparações lado a lado do mesmo momento nas duas versões.

| Pasta | App | Idioma | A primeira tarefa | Revisão |
| --- | --- | --- | --- | --- |
| `dm-automation` | Replyloop, DMs para comentários no Instagram | inglês | Mandar uma DM para quem comenta uma palavra-chave | [report.md](dm-automation/review/report.md) |
| `booking` | Navalha Barbearia | português | Marcar um corte | [report.md](booking/review/report.md) |
| `quote` | Orça Já, orçamentos para pequenos negócios | português | Fazer um orçamento e mandar para o cliente | [report.md](quote/review/report.md) |
| `menu` | Brasa Burger, uma hamburgueria | português | Pedir um hambúrguer para entrega | [report.md](menu/review/report.md) |

| Exemplo | Campos, antes e depois | Cliques, antes e depois | Índice de cara de IA, antes e depois | Estilo mantido |
| --- | --- | --- | --- | --- |
| Replyloop | 9 e 2 | 9 e 3 | 75 e 7 | 10 de 10 traços |
| Navalha Barbearia | 20 e 4 | 18 e 4 | 54 e 6 | 9 de 9 traços |
| Orça Já | 41 e 4 | 10 e 2 | 66 e 6 | 9 de 10 traços |
| Brasa Burger | 33 e 4 | 15 e 5 | 53 e 6 | 8 de 8 traços |

Campos e cliques são o que alguém de primeira viagem precisou fazer na primeira tarefa. Nenhum app da versão antes levou essa pessoa até o resultado: a automação não conseguia entrar no ar, o agendamento confirmava o horário de outra pessoa, o orçamento não tinha como ser enviado e o pedido terminava na página inicial, sem número.

## Como rodar

Os quatro dividem um pacote só, nesta pasta. Instale uma vez e suba as duas versões de um exemplo, cada uma no seu terminal:

```bash
cd examples
npm install
npm run dev:booking-before
```

Num segundo terminal, na mesma pasta:

```bash
npm run dev:booking-after
```

Rode o `npm install` dentro desta pasta. Na raiz do repositório, `npm --prefix examples install` acrescenta o próprio repositório como dependência dos exemplos.

| Exemplo | Antes | Depois |
| --- | --- | --- |
| `dm-automation` | `dev:dm-before`, porta 5173 | `dev:dm-after`, porta 5174 |
| `booking` | `dev:booking-before`, porta 5175 | `dev:booking-after`, porta 5176 |
| `quote` | `dev:quote-before`, porta 5177 | `dev:quote-after`, porta 5178 |
| `menu` | `dev:menu-before`, porta 5179 | `dev:menu-after`, porta 5180 |

Os apps não têm servidor. As versões depois guardam os dados no navegador, e nada chega ao Instagram, ao WhatsApp ou a um meio de pagamento.

## Revisar você mesmo

Com o Claude Code e o plugin do Phyll instalados, suba um app da versão antes e rode:

```
/phyll:review http://localhost:5175 Clientes de uma barbearia que marcam horário pelo celular
```

Ou faça só a varredura do código, sem abrir o app:

```bash
node skills/phyll/scripts/scan.mjs examples/booking/before --format text
```

## Gerar as comparações de novo

Suba as duas versões de um exemplo e rode, na raiz do repositório:

```bash
node scripts/example-screenshots.mjs booking
```

Os momentos de cada exemplo, e os cliques que chegam até eles, estão em `scripts/example-screenshots.mjs`. O script precisa do Playwright: rode `npm install` e `npx playwright install chromium` na raiz.

## O que os testes conferem

O `tests/example.test.mjs` faz a varredura de todos os exemplos a cada execução.

- Juntos, os apps da versão antes mostram todos os sinais que a varredura detecta.
- Cada app da versão depois fica em 25 ou menos no índice de cara de IA e não mantém nenhum dos sinais que uma correção precisa tirar.
- Cada app da versão depois mantém o design: pelo menos 80% dos traços de estilo da versão antes continuam lá, e o índice de estilo muda no máximo 20 pontos.
- Cada revisão é um relatório válido, e todas as capturas e medições que ela cita existem.
