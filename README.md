# 🍳 MasterChef Finder - Gerador de Receitas

Um aplicativo web interativo que permite aos usuários encontrar receitas a partir de um ingrediente, visualizar detalhes completos e assistir a um tutorial em vídeo relevante do YouTube.


*Aqui, coloque um screenshot ou, melhor ainda, um GIF animado da sua aplicação em uso. Grave sua tela usando uma ferramenta como ScreenToGif ou Giphy Capture e arraste o arquivo para dentro desta caixa de texto no GitHub.*

### ✨ [Acesse a aplicação aqui!](https://MatheusAugusto19.github.io/gerador-de-receitas/)

---

## 🚀 Funcionalidades

- [x] **Busca por Ingrediente:** Busca dinâmica de receitas utilizando a API TheMealDB.
- [x] **Modal de Detalhes:** Exibição dos detalhes completos da receita, incluindo ingredientes e instruções, em um modal interativo.
- [x] **Integração com YouTube:** Exibição de um vídeo tutorial relevante para a receita selecionada.
- [x] **Sistema de Favoritos:** Salve e remova suas receitas favoritas, com os dados persistidos no `localStorage` do navegador.
- [x] **Design Responsivo:** Interface adaptável para uma ótima experiência em desktops e dispositivos móveis.
- [x] **Feedback ao Usuário:** Indicadores de carregamento (loading spinners) e mensagens de erro claras.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5**
- **CSS3** (com Flexbox e Grid Layout)
- **JavaScript (ES6+)** (Vanilla JS)
- **APIs:**
  - [TheMealDB API](https://www.themealdb.com/api.php) para os dados das receitas.
  - Ferramenta de busca do YouTube.
- **Armazenamento:** `localStorage` do navegador para o sistema de favoritos.
- **Deploy:** [Netlify](https://www.netlify.com/)

---

## 🧠 Desafios e Aprendizados

Construir este projeto foi uma jornada de aprendizado incrível. Um dos maiores desafios foi gerenciar o fluxo de dados assíncrono de forma limpa. Para exibir os detalhes completos (incluindo o vídeo), precisei encadear múltiplas chamadas `async/await`:

1.  Primeiro, buscar a lista de receitas (`searchRecipes`).
2.  Depois, ao clicar em um card, buscar os detalhes daquela receita específica (`getRecipeDetails`).
3.  Finalmente, com o nome da receita em mãos, buscar o vídeo no YouTube (`fetchYouTubeVideo`).

Isso me ensinou a importância de estruturar o código de forma modular e a tratar os estados da aplicação (carregando, sucesso, erro) para garantir uma boa experiência ao usuário. A implementação do sistema de favoritos com `localStorage` também solidificou meu entendimento sobre como persistir dados no lado do cliente.

---

## 👨‍💻 Autor

Feito por **[Seu Nome]**

- **LinkedIn:** [https://www.linkedin.com/in/seu-usuario/](https://www.linkedin.com/in/seu-usuario/)
- **GitHub:** [https://github.com/seu-usuario](https://github.com/seu-usuario)
