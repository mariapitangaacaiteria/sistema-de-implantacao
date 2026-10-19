# Jornada de Implantação de Franquias

Protótipo funcional (HTML + Tailwind CSS + JavaScript puro) da plataforma que acompanha a implantação de uma nova unidade, do contrato assinado à Festa de Inauguração.

## Como rodar
Abra `index.html` no navegador (precisa de internet para carregar o Tailwind e a fonte via CDN) ou sirva a pasta:

```bash
python3 -m http.server 8080
# http://localhost:8080
```

## Acessos de demonstração
| Perfil | E-mail | Senha |
|---|---|---|
| Franqueado | fortaleza@franquia.com, sobral@franquia.com, juazeiro@franquia.com, aracati@franquia.com, crato@franquia.com | 123456 |
| Franqueadora (consultor) | consultor@franqueadora.com | admin123 |
| Administrador | admin@franqueadora.com | admin123 |
| Primeiro acesso (convite) | caucaia@franquia.com | convite `ABC123` |

## Fluxo implementado
Vendas (checklist) → Kickoff (reunião introdutória e checklist) → 7 frentes em paralelo (Projeto Arquitetônico, Plano de Investimento, Sistema PDV, Contratações, Alvarás e Documentações, Marketing Inaugural, Abertura de Loja) → Treinamento (personagens se encontram) → Abertura → Festa de Inauguração.

- Cada frente tem um personagem que caminha na trilha a cada tarefa concluída.
- Tarefas com validação vão para a franqueadora, que aprova ou devolve com motivo.
- Prazos contam a partir da reunião introdutória (kickoff); tarefas vencidas marcam a unidade como "Atenção".
- Painel central da franqueadora com filtros, validações pendentes, cobrança de pendência e relatório.
- Administração: unidades, usuários (convite de primeiro acesso), checklists por frente, módulos de treinamento.

## Estrutura
```
index.html          shell da aplicação
css/style.css       animações dos personagens e trilhas
js/data.js          frentes, checklists, módulos e dados de demonstração
js/characters.js    bonequinhos SVG
js/core.js          armazenamento (localStorage), sessão e regras de negócio
js/views.js         telas
js/app.js           rotas, ações e formulários
```

## Observações
- Dados e senhas ficam no `localStorage` do navegador: é um protótipo, sem back-end. Para produção, trocar `core.js` por chamadas a uma API com autenticação real.
- Anexos registram apenas nome e tamanho do arquivo.
