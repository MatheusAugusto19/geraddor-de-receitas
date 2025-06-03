// Seleciona todos os elementos que vamos usar
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('results-container');
const messageContainer = document.getElementById('message-container');
const loadingSpinner = document.getElementById('loading-spinner');
const modalContainer = document.getElementById('modal-container');
const closeModalBtn = document.getElementById('close-modal-btn');
const modalContent = document.getElementById('modal-content');

// URL base da API TheMealDB
const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1/';

// ===================================
// FUNÇÕES PRINCIPAIS
// ===================================

/**
 * Função principal para buscar receitas por ingrediente.
 */
async function searchRecipes(ingredient) {
    showLoading();
    try {
        const response = await fetch(`${API_BASE_URL}filter.php?i=${ingredient}`);
        const data = await response.json();
        hideLoading();
        if (data.meals) {
            displayRecipes(data.meals);
            messageContainer.innerText = '';
        } else {
            showError('Nenhuma receita encontrada. Tente outro ingrediente.');
        }
    } catch (error) {
        handleError(error);
    }
}

/**
 * Busca os detalhes completos de uma receita pelo seu ID.
 */
async function getRecipeDetails(recipeId) {
    showLoading();
    try {
        const response = await fetch(`${API_BASE_URL}lookup.php?i=${recipeId}`);
        const data = await response.json();
        const recipe = data.meals[0];
        
        // Com os detalhes da receita, agora buscamos o vídeo no YouTube
        const videoHtml = await fetchYouTubeVideo(recipe.strMeal);

        hideLoading();
        displayRecipeDetails(recipe, videoHtml);
    } catch (error) {
        handleError(error);
    }
}

/**
 * Busca um vídeo no YouTube relacionado ao nome da receita.
 * ESTA FUNÇÃO SERÁ SUBSTITUÍDA PELA CHAMADA DA FERRAMENTA.
 */
async function fetchYouTubeVideo(recipeName) {
    console.log(`Buscando vídeo para: ${recipeName}`);
    try {
        const query = `${recipeName} receita tutorial`;
        const searchResults = await Youtube(query, result_type='VIDEO');
        
        if (searchResults && searchResults.length > 0) {
            const videoId = searchResults[0].url.split('v=')[1];
            return `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        } else {
            return '<p>Nenhum vídeo tutorial encontrado para esta receita.</p>';
        }
    } catch (error) {
        console.error('Erro ao buscar vídeo no YouTube:', error);
        return '<p>Não foi possível carregar o vídeo no momento.</p>';
    }
}


// ===================================
// FUNÇÕES DE EXIBIÇÃO E UI
// ===================================

/**
 * Exibe os cards das receitas na tela.
 */
function displayRecipes(recipes) {
    resultsContainer.innerHTML = '';
    recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';
        // Adiciona um data attribute com o ID da receita para uso posterior
        recipeCard.dataset.id = recipe.idMeal;
        recipeCard.innerHTML = `
            <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
            <h3>${recipe.strMeal}</h3>
        `;
        resultsContainer.appendChild(recipeCard);
    });
}

/**
 * Constrói e exibe o conteúdo detalhado da receita no modal.
 */
function displayRecipeDetails(recipe, videoHtml) {
    // Formata a lista de ingredientes e medidas
    let ingredientsList = '<ul>';
    for (let i = 1; i <= 20; i++) {
        const ingredient = recipe[`strIngredient${i}`];
        const measure = recipe[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== '') {
            ingredientsList += `<li>${measure} ${ingredient}</li>`;
        }
    }
    ingredientsList += '</ul>';

    modalContent.innerHTML = `
        <h2>${recipe.strMeal}</h2>
        <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
        
        <button id="favorite-btn" data-id="${recipe.idMeal}" data-name="${recipe.strMeal}" data-thumb="${recipe.strMealThumb}">
            Salvar nos Favoritos
        </button>

        <h3>Ingredientes</h3>
        ${ingredientsList}
        
        <h3>Instruções</h3>
        <p>${recipe.strInstructions}</p>
        
        <h3>Vídeo Tutorial</h3>
        <div id="youtube-container">${videoHtml}</div>
    `;

    updateFavoriteButton(recipe.idMeal);
    openModal();
}

// Funções de UI (Loading, Erros, Modal)
function showLoading() {
    loadingSpinner.classList.remove('hidden');
    messageContainer.innerText = '';
    resultsContainer.innerHTML = '';
}

function hideLoading() {
    loadingSpinner.classList.add('hidden');
}

function showError(message) {
    resultsContainer.innerHTML = '';
    messageContainer.innerText = message;
}

function handleError(error) {
    console.error('Ocorreu um erro:', error);
    hideLoading();
    showError('Algo deu errado. Por favor, tente novamente.');
}

function openModal() {
    modalContainer.classList.remove('hidden');
}

function closeModal() {
    modalContainer.classList.add('hidden');
    modalContent.innerHTML = ''; // Limpa o conteúdo ao fechar
}

// ===================================
// LÓGICA DE FAVORITOS (localStorage)
// ===================================

/**
 * Pega os favoritos do localStorage.
 */
function getFavorites() {
    return JSON.parse(localStorage.getItem('recipeFavorites')) || [];
}

/**
 * Salva os favoritos no localStorage.
 */
function saveFavorites(favorites) {
    localStorage.setItem('recipeFavorites', JSON.stringify(favorites));
}

/**
 * Adiciona ou remove uma receita dos favoritos.
 */
function toggleFavorite(recipeData) {
    let favorites = getFavorites();
    const recipeIndex = favorites.findIndex(fav => fav.idMeal === recipeData.id);

    if (recipeIndex > -1) {
        favorites.splice(recipeIndex, 1); // Remove se já for favorito
    } else {
        favorites.push({ // Adiciona se não for
            idMeal: recipeData.id,
            strMeal: recipeData.name,
            strMealThumb: recipeData.thumb
        });
    }
    saveFavorites(favorites);
    updateFavoriteButton(recipeData.id);
}

/**
 * Atualiza a aparência do botão de favorito.
 */
function updateFavoriteButton(recipeId) {
    const favorites = getFavorites();
    const favBtn = document.getElementById('favorite-btn');
    if (favBtn) {
        if (favorites.some(fav => fav.idMeal === recipeId)) {
            favBtn.textContent = 'Removido dos Favoritos ✓';
            favBtn.classList.add('favorited');
        } else {
            favBtn.textContent = 'Salvar nos Favoritos';
            favBtn.classList.remove('favorited');
        }
    }
}

// ===================================
// EVENT LISTENERS (OUVINTES DE EVENTOS)
// ===================================

// Listener para a busca no formulário
searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const ingredient = searchInput.value.trim();
    if (ingredient) {
        searchRecipes(ingredient);
    } else {
        showError('Por favor, digite um ingrediente.');
    }
});

// Listener para cliques nos cards de receita (usando delegação de eventos)
resultsContainer.addEventListener('click', (event) => {
    const card = event.target.closest('.recipe-card');
    if (card) {
        const recipeId = card.dataset.id;
        getRecipeDetails(recipeId);
    }
});

// Listener para fechar o modal
closeModalBtn.addEventListener('click', closeModal);
modalContainer.addEventListener('click', (event) => {
    if (event.target === modalContainer) {
        closeModal(); // Fecha se clicar fora do conteúdo do modal
    }
});

// Listener para o botão de favoritos (usando delegação)
modalContent.addEventListener('click', (event) => {
    if (event.target.id === 'favorite-btn') {
        const btn = event.target;
        toggleFavorite({
            id: btn.dataset.id,
            name: btn.dataset.name,
            thumb: btn.dataset.thumb
        });
    }
});