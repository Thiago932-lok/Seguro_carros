# Seguradora — Sistema de Proteção Veicular (Carros)

Aplicação web de proteção veicular para carros: cadastro de associados, veículos, cotação mensal (FIPE), contratação de apólice, pagamentos e sinistros.

## Requisitos

- Node.js 22.5+ (usa SQLite nativo do Node — sem Visual Studio)
- npm

## Como rodar

```bash
# Na pasta Seguradora
npm run install:all
npm run dev
```

Acesse: **http://localhost:3000**

## Fluxo do sistema

1. **Cadastro** (`/pages/cadastro.html`) — dados pessoais
2. **Meu carro** — cadastra veículo (FIPE automática ou manual)
3. **Cotação** — calcula mensalidade com base na FIPE
4. **Contratar** — gera apólice e 12 parcelas
5. **Pagamentos** — simula pagamento da mensalidade
6. **Sinistro** — aciona proteção

## Precificação

O valor mensal usa `backend/utils/calcInsurance.js`:

- Taxa sobre valor FIPE por faixa (0,25% a 0,40% ao mês)
- Ajustes: ano do carro, uso (particular/comercial/app), garagem, UF

## API

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/register` | Cadastro |
| POST | `/api/auth/login` | Login |
| GET | `/api/cars` | Listar carros |
| POST | `/api/cars` | Cadastrar carro |
| POST | `/api/quotes/simulate` | Cotação |
| POST | `/api/insurances/contract` | Contratar |
| GET | `/api/payments` | Parcelas |

## Estrutura

- `backend/` — API Express + SQLite
- `frontend/` — HTML/CSS/JS
- `database/` — migrations SQL

## FIPE

Consulta a API pública [Parallelum FIPE](https://parallelum.com.br/fipe/api/v1). Se estiver offline, o sistema estima o valor com base em dados seed.
