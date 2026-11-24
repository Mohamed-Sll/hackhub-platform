# HackHub — Stack tecnológica

## Aplicação

- **Frontend:** Next.js 16 (App Router), React 19 e TypeScript
- **Interface:** Tailwind CSS 3, Radix UI, Lucide React e Recharts
- **Estado e pedidos:** TanStack Query, Zustand e Axios
- **Formulários:** React Hook Form e Zod

## API e dados

- **Backend:** Python 3.12, FastAPI, Uvicorn e Pydantic 2
- **ORM:** SQLAlchemy 2 assíncrono
- **Base de dados local:** SQLite com aiosqlite; migrações com Alembic
- **Autenticação e limites:** JWT em cookies HTTP-only e SlowAPI

Cada instalação local usa a base SQLite indicada em `backend/.env`. Na
configuração de exemplo, o ficheiro é `backend/hackhub.db`. A demonstração do
frontend na Vercel não fornece nem aloja essa base de dados.

## Serviços opcionais

- Redis para cache e contadores
- SMTP para envio de emails
- Telegram Bot API para notificações
- OpenAI API para assistência e feedback com IA

## Execução e qualidade

- Docker Compose e Nginx
- GitHub Actions para integração contínua
- Testes: pytest e pytest-asyncio
- Qualidade: ESLint, TypeScript, Flake8, Black e isort
- Auditoria de dependências: `pip-audit` e `npm audit`

## Requisitos locais

- Python 3.12 ou superior
- Node.js 20 ou superior
- Redis é opcional
