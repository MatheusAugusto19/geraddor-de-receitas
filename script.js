// ===================================
// SELEÇÃO DE ELEMENTOS (Não mexe aqui)
// ===================================
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('results-container');
const messageContainer = document.getElementById('message-container');
const loadingSpinner = document.getElementById('loading-spinner');
const modalContainer = document.getElementById('modal-container');
const closeModalBtn = document.getElementById('close-modal-btn');
const modalContent = document.getElementById('modal-content');

const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1/';


// ===================================
// FUNÇÕES DE LÓGICA (Onde a mágica acontece)
// ===================================

async function searchRecipes(ingredient) {
    showLoading();
    try {
        const response = await fetch(`${API_BASE_URL}filter.php?i=${ingredient}`);
        if (!response.ok) throw new Error('Erro na rede ao buscar receitas.');
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

async function getRecipeDetails(recipeId) {
    // MODIFICAÇÃO IMPORTANTE: Abrimos o modal aqui para uma melhor UX,
    // mas isso EXIGE que o handleError feche o modal em caso de erro.
    openModal(); 
    showLoadingInModal(); // Mostra o spinner dentro do modal

    try {
        const response = await fetch(`${API_BASE_URL}lookup.php?i=${recipeId}`);
        if (!response.ok) throw new Error('Erro na rede ao buscar detalhes.');
        const data = await response.json();

        if (!data.meals) {
            // Se a API não retornar uma receita para um ID válido (raro, mas possível)
            throw new Error('Não foi possível encontrar os detalhes para esta receita.');
        }

        const recipe = data.meals[0];
        const videoHtml = await fetchYouTubeVideo(recipe.strMeal);

        // Somente se tudo der certo, o conteúdo é exibido.
        displayRecipeDetails(recipe, videoHtml);

    } catch (error) {
        // Se qualquer passo do `try` falhar, esta função é chamada.
        handleError(error);
    }
}

async function fetchYouTubeVideo(recipeName) {
    // CORREÇÃO CRÍTICA: Removida a chamada "Youtube(...)" que causava o erro.
    // Esta função agora retorna um texto placeholder de forma segura.
    console.log(`Buscando vídeo (simulado) para: ${recipeName}`);
    return '<p>A busca de vídeos está temporariamente desativada.</p>';
}


// ===================================
// FUNÇÕES DE UI (As que mostram e escondem coisas)
// ===================================

function displayRecipes(recipes) {
    resultsContainer.innerHTML = '';
    recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';
        recipeCard.dataset.id = recipe.idMeal;
        recipeCard.innerHTML = `
            <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
            <h3>${recipe.strMeal}</h3>
        `;
        resultsContainer.appendChild(recipeCard);
    });
}

function displayRecipeDetails(recipe, videoHtml) {
    let ingredientsList = '<ul>';
    for (let i = 1; i <= 20; i++) {
        const ingredient = recipe[`strIngredient${i}`];
        const measure = recipe[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== '') {
            ingredientsList += `<li>${measure} ${ingredient}</li>`;
        }
    }
    ingredientsList += '</ul>';

    // O spinner é removido e o conteúdo real é inserido.
    modalContent.innerHTML = `
        <h2>${recipe.strMeal}</h2>
        <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
        <button id="favorite-btn" data-id="${recipe.idMeal}" data-name="${recipe.strMeal}" data-thumb="${recipe.strMealThumb}">Salvar nos Favoritos</button>
        <h3>Ingredientes</h3>
        ${ingredientsList}
        <h3>Instruções</h3>
        <p>${recipe.strInstructions}</p>
        <h3>Vídeo Tutorial</h3>
        <div id="youtube-container">${videoHtml}</div>
    `;
    updateFavoriteButton(recipe.idMeal);
}

function showLoading() {
    loadingSpinner.classList.remove('hidden');
    messageContainer.innerText = '';
    resultsContainer.innerHTML = '';
}

function hideLoading() {
    loadingSpinner.classList.add('hidden');
}

// NOVA FUNÇÃO para mostrar o spinner DENTRO do modal
function showLoadingInModal() {
    modalContent.innerHTML = ''; // Limpa conteúdo antigo
    loadingSpinner.cloneNode(true).classList.remove('hidden');
    modalContent.appendChild(loadingSpinner);
}

function showError(message) {
    resultsContainer.innerHTML = '';
    messageContainer.innerText = message;
}

// CORREÇÃO CRÍTICA NA LÓGICA
function handleError(error) {
    console.error('Ocorreu um erro no fluxo:', error);
    hideLoading();
    // A linha mais importante para resolver seu problema:
    // Garante que, não importa o que aconteça, o modal será fechado.
    closeModal(); 
    showError('Ops! Algo deu errado. Por favor, tente novamente.');
}

function openModal() {
    modalContainer.classList.remove('hidden');
}

function closeModal() {
    modalContainer.classList.add('hidden');
    modalContent.innerHTML = '';
}

// ===================================
// LÓGICA DE FAVORITOS (Não mexe aqui)
// ===================================

function getFavorites() {
    return JSON.parse(localStorage.getItem('recipeFavorites')) || [];
}

function saveFavorites(favorites) {
    localStorage.setItem('recipeFavorites', JSON.stringify(favorites));
}

function toggleFavorite(recipeData) {
    let favorites = getFavorites();
    const recipeIndex = favorites.findIndex(fav => fav.idMeal === recipeData.id);

    if (recipeIndex > -1) {
        favorites.splice(recipeIndex, 1);
    } else {
        favorites.push({
            idMeal: recipeData.id,
            strMeal: recipeData.name,
            strMealThumb: recipeData.thumb
        });
    }
    saveFavorites(favorites);
    updateFavoriteButton(recipeData.id);
}

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
// EVENT LISTENERS (Não mexe aqui)
// ===================================

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const ingredient = searchInput.value.trim();
    if (ingredient) {
        searchRecipes(ingredient);
    } else {
        showError('Por favor, digite um ingrediente.');
    }
});

resultsContainer.addEventListener('click', (event) => {
    const card = event.target.closest('.recipe-card');
    if (card) {
        const recipeId = card.dataset.id;
        getRecipeDetails(recipeId);
    }
});

closeModalBtn.addEventListener('click', closeModal);
modalContainer.addEventListener('click', (event) => {
    if (event.target === modalContainer) {
        closeModal();
    }
});

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