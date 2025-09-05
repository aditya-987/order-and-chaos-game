let currentGameId = null;
let selectedSymbol = null;
let currentGameState = null;

const API_BASE = window.location.origin + '/api';

// Utility functions
function showMessage(text, type = 'info') {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = 'message';
    }, 3000);
}

function setLoading(loading) {
    const body = document.body;
    if (loading) {
        body.classList.add('loading');
    } else {
        body.classList.remove('loading');
    }
}

// API functions
async function apiCall(endpoint, options = {}) {
    try {
        setLoading(true);
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }
        
        return data;
    } catch (error) {
        showMessage(error.message, 'error');
        throw error;
    } finally {
        setLoading(false);
    }
}

// Game functions
async function createNewGame() {
    try {
        const response = await apiCall('/games', { method: 'POST' });
        currentGameId = response.gameId;
        currentGameState = response.game;
        showMessage('New game created!', 'success');
        displayGame();
    } catch (error) {
        console.error('Failed to create game:', error);
    }
}

async function loadGame() {
    const gameId = prompt('Enter game ID:');
    if (!gameId) return;
    
    try {
        const response = await apiCall(`/games/${gameId}`);
        currentGameId = gameId;
        currentGameState = response.game;
        showMessage('Game loaded!', 'success');
        displayGame();
    } catch (error) {
        console.error('Failed to load game:', error);
    }
}

async function deleteGame() {
    if (!currentGameId) {
        showMessage('No active game to delete', 'error');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this game?')) return;
    
    try {
        await apiCall(`/games/${currentGameId}`, { method: 'DELETE' });
        showMessage('Game deleted!', 'success');
        hideGame();
    } catch (error) {
        console.error('Failed to delete game:', error);
    }
}

async function resetGame() {
    if (!currentGameId) return;
    
    try {
        const response = await apiCall(`/games/${currentGameId}/reset`, { method: 'POST' });
        currentGameState = response.game;
        showMessage('Game reset!', 'success');
        displayGame();
    } catch (error) {
        console.error('Failed to reset game:', error);
    }
}

async function makeMove(row, col) {
    if (!currentGameId || !selectedSymbol) {
        showMessage('Please select a symbol first', 'error');
        return;
    }
    
    try {
        const response = await apiCall(`/games/${currentGameId}/move`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                row: row, 
                col: col, 
                symbol: selectedSymbol 
            })
        });
        
        // The response is the updated game state
        currentGameState = response;
        displayGame();
        
        if (response.gameOver) {
            showMessage(`Game Over! ${response.winner} wins!`, 'success');
        }
    } catch (error) {
        console.error('Failed to make move:', error);
        showMessage(error.message || 'Failed to make move', 'error');
    }
}

// UI functions
function displayGame() {
    if (!currentGameState) return;
    
    // Show game ID
    document.getElementById('gameId').textContent = `Game ID: ${currentGameId}`;
    document.getElementById('gameId').style.display = 'block';
    
    // Show game info
    document.getElementById('round').textContent = currentGameState.round;
    document.getElementById('moves').textContent = currentGameState.moves[currentGameState.round - 1];
    document.getElementById('currentPlayer').textContent = currentGameState.currentPlayer;
    document.getElementById('gameInfo').style.display = 'flex';
    
    // Show game board
    renderBoard();
    document.getElementById('gameBoard').style.display = 'grid';
    
    // Show symbol buttons if game is not over
    if (!currentGameState.gameOver) {
        document.getElementById('symbolButtons').style.display = 'flex';
    } else {
        document.getElementById('symbolButtons').style.display = 'none';
    }
    
    // Show reset button
    document.getElementById('resetButton').style.display = 'flex';
}

function hideGame() {
    currentGameId = null;
    currentGameState = null;
    selectedSymbol = null;
    
    document.getElementById('gameId').style.display = 'none';
    document.getElementById('gameInfo').style.display = 'none';
    document.getElementById('gameBoard').style.display = 'none';
    document.getElementById('symbolButtons').style.display = 'none';
    document.getElementById('resetButton').style.display = 'none';
}

function renderBoard() {
    const board = document.getElementById('gameBoard');
    board.innerHTML = '';
    
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 6; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.textContent = currentGameState.board[i][j];
            
            if (currentGameState.board[i][j] !== ' ') {
                cell.classList.add('filled');
            } else if (!currentGameState.gameOver) {
                cell.onclick = () => makeMove(i, j);
            }
            
            board.appendChild(cell);
        }
    }
}

function selectSymbol(symbol) {
    selectedSymbol = symbol;
    
    // Update button styles
    document.getElementById('btnX').classList.toggle('selected', symbol === 'X');
    document.getElementById('btnO').classList.toggle('selected', symbol === 'O');
    
    showMessage(`Selected symbol: ${symbol}`, 'info');
}

document.addEventListener('DOMContentLoaded', () => {
    showMessage('Welcome to Order and Chaos! Create a new game to start playing.', 'info');
});
