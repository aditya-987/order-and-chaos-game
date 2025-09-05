const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// In-memory storage for games (in production, use a database)
const games = new Map();

// Game class to handle game logic
class OrderAndChaosGame {
    constructor() {
        this.id = uuidv4();
        this.board = Array.from({ length: 6 }, () => Array(6).fill(" "));
        this.round = 1;
        this.moves = [0, 0];
        this.victory = [0, 0];
        this.numberOf4 = [0, 0];
        this.currentPlayer = 1; // 1 for Order, 2 for Chaos
        this.gameOver = false;
        this.winner = null;
        this.createdAt = new Date();
    }

    // Make a move
    makeMove(row, col, symbol) {
        if (this.gameOver || this.board[row][col] !== " ") {
            return { success: false, message: "Invalid move" };
        }

        this.board[row][col] = symbol;
        this.moves[this.round - 1]++;

        // Check for win
        const winResult = this.checkWin();
        if (winResult.win) {
            this.count4();
            if (this.round === 1) {
                this.victory[0] = this.currentPlayer;
                this.round = 2;
                this.resetBoard();
                this.currentPlayer = 1;
            } else {
                this.victory[1] = this.currentPlayer;
                this.gameOver = true;
                this.winner = this.determineWinner();
            }
        } else if (winResult.fullBoard) {
            this.count4();
            if (this.round === 1) {
                this.victory[0] = this.currentPlayer === 1 ? 2 : 1;
                this.round = 2;
                this.resetBoard();
                this.currentPlayer = 1;
            } else {
                this.victory[1] = this.currentPlayer === 1 ? 2 : 1;
                this.gameOver = true;
                this.winner = this.determineWinner();
            }
        } else {
            // Switch players
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        }

        return {
            success: true,
            board: this.board,
            round: this.round,
            moves: this.moves,
            currentPlayer: this.currentPlayer,
            gameOver: this.gameOver,
            winner: this.winner
        };
    }

    // Check for win or full board
    checkWin() {
        const dirs = [[0, 1], [1, 0], [1, 1], [-1, 1]]; // Right, Down, Diagonal, Anti-diagonal

        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 6; j++) {
                if (this.board[i][j] === " ") continue;
                
                for (let dir of dirs) {
                    let count = 0;
                    for (let k = 0; k < 5; k++) {
                        let row = i + k * dir[0];
                        let col = j + k * dir[1];
                        if (row >= 0 && row < 6 && col >= 0 && col < 6 && 
                            this.board[i][j] === this.board[row][col]) {
                            count++;
                        }
                    }
                    if (count === 5) {
                        return { win: true, fullBoard: false };
                    }
                }
            }
        }

        // Check for full board
        let isBoardFull = true;
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 6; j++) {
                if (this.board[i][j] === " ") {
                    isBoardFull = false;
                    break;
                }
            }
        }

        return { win: false, fullBoard: isBoardFull };
    }

    // Count 4-in-a-row sequences
    count4() {
        const dirs = [[0, 1], [1, 0], [1, 1], [-1, 1]];

        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 6; j++) {
                const symbol = this.board[i][j];
                if (symbol === " ") continue;
                
                for (let dir of dirs) {
                    let count = 0;
                    for (let k = 0; k < 4; k++) {
                        let row = i + k * dir[0];
                        let col = j + k * dir[1];
                        if (row >= 0 && row < 6 && col >= 0 && col < 6 && 
                            this.board[row][col] === symbol) {
                            count++;
                        } else {
                            break;
                        }
                    }
                    if (count === 4) {
                        this.numberOf4[this.round - 1]++;
                    }
                }
            }
        }
    }

    // Determine final winner
    determineWinner() {
        if (this.victory[0] === this.victory[1]) {
            return `Player ${this.victory[0]}`;
        } else {
            if (this.moves[0] < this.moves[1]) {
                return "Player 1";
            } else if (this.moves[0] > this.moves[1]) {
                return "Player 2";
            } else {
                if (this.numberOf4[0] < this.numberOf4[1]) {
                    return "Player 2";
                } else if (this.numberOf4[1] < this.numberOf4[0]) {
                    return "Player 1";
                } else {
                    return "Draw";
                }
            }
        }
    }

    // Reset board for next round
    resetBoard() {
        this.board = Array.from({ length: 6 }, () => Array(6).fill(" "));
    }

    // Get game state
    getState() {
        return {
            id: this.id,
            board: this.board,
            round: this.round,
            moves: this.moves,
            currentPlayer: this.currentPlayer,
            gameOver: this.gameOver,
            winner: this.winner,
            victory: this.victory,
            numberOf4: this.numberOf4,
            createdAt: this.createdAt
        };
    }

    // Reset entire game
    reset() {
        this.board = Array.from({ length: 6 }, () => Array(6).fill(" "));
        this.round = 1;
        this.moves = [0, 0];
        this.victory = [0, 0];
        this.numberOf4 = [0, 0];
        this.currentPlayer = 1;
        this.gameOver = false;
        this.winner = null;
    }
}

// API Routes

// Create a new game
app.post('/api/games', (req, res) => {
    const game = new OrderAndChaosGame();
    games.set(game.id, game);
    res.json({
        success: true,
        gameId: game.id,
        game: game.getState()
    });
});

// Get game state
app.get('/api/games/:gameId', (req, res) => {
    const game = games.get(req.params.gameId);
    if (!game) {
        return res.status(404).json({ success: false, message: "Game not found" });
    }
    res.json({
        success: true,
        game: game.getState()
    });
});

// Make a move
app.post('/api/games/:gameId/move', (req, res) => {
    const { row, col, symbol } = req.body;
    const game = games.get(req.params.gameId);
    
    if (!game) {
        return res.status(404).json({ success: false, message: "Game not found" });
    }

    // Validate presence correctly (0 is a valid value)
    if (row === undefined || col === undefined || typeof symbol !== 'string' || symbol.trim() === '') {
        return res.status(400).json({ success: false, message: "Missing required fields: row, col, symbol" });
    }

    // Coerce to integers
    const r = Number(row);
    const c = Number(col);

    if (!Number.isInteger(r) || !Number.isInteger(c)) {
        return res.status(400).json({ success: false, message: "row and col must be integers" });
    }

    if (symbol !== 'X' && symbol !== 'O') {
        return res.status(400).json({ success: false, message: "Symbol must be 'X' or 'O'" });
    }

    if (r < 0 || r >= 6 || c < 0 || c >= 6) {
        return res.status(400).json({ success: false, message: "Invalid position" });
    }

    const result = game.makeMove(r, c, symbol);
    res.json(result);
});

// Reset game
app.post('/api/games/:gameId/reset', (req, res) => {
    const game = games.get(req.params.gameId);
    if (!game) {
        return res.status(404).json({ success: false, message: "Game not found" });
    }
    
    game.reset();
    res.json({
        success: true,
        game: game.getState()
    });
});

// List all games
app.get('/api/games', (req, res) => {
    const gameList = Array.from(games.values()).map(game => ({
        id: game.id,
        round: game.round,
        gameOver: game.gameOver,
        winner: game.winner,
        createdAt: game.createdAt
    }));
    
    res.json({
        success: true,
        games: gameList
    });
});

// Delete a game
app.delete('/api/games/:gameId', (req, res) => {
    const game = games.get(req.params.gameId);
    if (!game) {
        return res.status(404).json({ success: false, message: "Game not found" });
    }
    
    games.delete(req.params.gameId);
    res.json({ success: true, message: "Game deleted" });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: "Order and Chaos API is running",
        timestamp: new Date().toISOString(),
        activeGames: games.size
    });
});

// Serve a simple frontend for testing
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Order and Chaos API</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .endpoint { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
                code { background: #e0e0e0; padding: 2px 4px; border-radius: 3px; }
            </style>
        </head>
        <body>
            <h1>Order and Chaos Game API</h1>
            <p>Welcome to the Order and Chaos game backend API!</p>
            
            <h2>Available Endpoints:</h2>
            <div class="endpoint">
                <strong>POST /api/games</strong> - Create a new game
            </div>
            <div class="endpoint">
                <strong>GET /api/games</strong> - List all games
            </div>
            <div class="endpoint">
                <strong>GET /api/games/:gameId</strong> - Get game state
            </div>
            <div class="endpoint">
                <strong>POST /api/games/:gameId/move</strong> - Make a move (body: {row, col, symbol})
            </div>
            <div class="endpoint">
                <strong>POST /api/games/:gameId/reset</strong> - Reset game
            </div>
            <div class="endpoint">
                <strong>DELETE /api/games/:gameId</strong> - Delete game
            </div>
            <div class="endpoint">
                <strong>GET /api/health</strong> - Health check
            </div>
            
            <h2>Example Usage:</h2>
            <p>1. Create a game: <code>POST /api/games</code></p>
            <p>2. Make a move: <code>POST /api/games/{gameId}/move</code> with body <code>{"row": 0, "col": 0, "symbol": "X"}</code></p>
            <p>3. Check game state: <code>GET /api/games/{gameId}</code></p>
        </body>
        </html>
    `);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Endpoint not found" });
});

app.listen(PORT, () => {
    console.log(`Order and Chaos API server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} for API documentation`);
});
