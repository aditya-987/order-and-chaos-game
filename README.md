# Order and Chaos Game - Backend Version

This is a complete backend conversion of the Order and Chaos game, built with Node.js and Express. The game logic has been moved from the frontend to a RESTful API, allowing for multiple concurrent games, persistent game states, and better scalability.

## Features

- **RESTful API**: Complete backend API for game management
- **Multiple Games**: Support for multiple concurrent games with unique IDs
- **Game Persistence**: Games are stored in memory (can be extended to database)
- **Real-time Game Logic**: All game rules and win conditions handled server-side
- **Modern Frontend**: Clean, responsive UI that communicates with the backend
- **Game Management**: Create, load, delete, and reset games

## Game Rules

Order and Chaos is a strategic board game played on a 6x6 grid:

- **Order (Player 1)**: Tries to create 5 symbols in a row (horizontally, vertically, or diagonally)
- **Chaos (Player 2)**: Tries to prevent Order from winning by filling the board
- **Two Rounds**: The game consists of two rounds with different players
- **Winner Determination**: Based on victories, move count, and 4-in-a-row sequences

## Installation

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Server**:
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

3. **Access the Application**:
   - Open your browser and go to `http://localhost:3000`
   - The API documentation is available at the root URL

## API Endpoints

### Game Management

- `POST /api/games` - Create a new game
- `GET /api/games` - List all active games
- `GET /api/games/:gameId` - Get game state
- `DELETE /api/games/:gameId` - Delete a game

### Game Actions

- `POST /api/games/:gameId/move` - Make a move
  - Body: `{ "row": 0, "col": 0, "symbol": "X" }`
- `POST /api/games/:gameId/reset` - Reset game to initial state

### Utility

- `GET /api/health` - Health check endpoint

## API Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "gameId": "uuid-string",
  "game": {
    "id": "uuid-string",
    "board": [[" ", "X", "O", ...], ...],
    "round": 1,
    "moves": [5, 0],
    "currentPlayer": 1,
    "gameOver": false,
    "winner": null,
    "victory": [0, 0],
    "numberOf4": [2, 0],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Example Usage

### Using cURL

1. **Create a new game**:
   ```bash
   curl -X POST http://localhost:3000/api/games
   ```

2. **Make a move**:
   ```bash
   curl -X POST http://localhost:3000/api/games/{gameId}/move \
     -H "Content-Type: application/json" \
     -d '{"row": 0, "col": 0, "symbol": "X"}'
   ```

3. **Get game state**:
   ```bash
   curl http://localhost:3000/api/games/{gameId}
   ```

### Using JavaScript

```javascript
// Create a new game
const createGame = async () => {
  const response = await fetch('/api/games', { method: 'POST' });
  const data = await response.json();
  return data.gameId;
};

// Make a move
const makeMove = async (gameId, row, col, symbol) => {
  const response = await fetch(`/api/games/${gameId}/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ row, col, symbol })
  });
  return await response.json();
};
```

## Frontend Features

The included frontend provides:

- **Game Creation**: Start new games with unique IDs
- **Game Loading**: Load existing games by ID
- **Real-time Updates**: Board updates after each move
- **Symbol Selection**: Choose X or O before making moves
- **Game Management**: Reset and delete games
- **Responsive Design**: Works on desktop and mobile devices

## Architecture

### Backend Structure

```
server.js          # Main Express server
├── Game Class     # Game logic and state management
├── API Routes     # RESTful endpoints
├── Middleware     # CORS, body parsing, error handling
└── Static Files   # Frontend served from /public
```

### Key Components

1. **OrderAndChaosGame Class**: Encapsulates all game logic
2. **Express Routes**: Handle HTTP requests and responses
3. **In-Memory Storage**: Games stored in Map (extensible to database)
4. **Error Handling**: Comprehensive error responses
5. **CORS Support**: Cross-origin requests enabled

## Development

### Adding Database Support

To extend this to use a database instead of in-memory storage:

1. Install a database driver (e.g., `mongoose` for MongoDB)
2. Replace the `games` Map with database operations
3. Update the game class to work with database models

### Adding Authentication

To add user authentication:

1. Install authentication middleware (e.g., `passport`, `jsonwebtoken`)
2. Add user registration/login endpoints
3. Associate games with user accounts
4. Add authorization checks to game endpoints

### Adding Real-time Features

To add WebSocket support for real-time gameplay:

1. Install `socket.io`
2. Add WebSocket event handlers for moves
3. Broadcast game updates to connected clients

## Production Deployment

### Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)

### Recommended Setup

1. **Process Manager**: Use PM2 for production
2. **Reverse Proxy**: Nginx for load balancing
3. **Database**: MongoDB or PostgreSQL for persistence
4. **Monitoring**: Add logging and health checks

## License

This project is open source and available under the ISC License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**Note**: This is a complete backend conversion of the original frontend-only Order and Chaos game. The game logic has been moved to the server, providing better scalability, security, and the ability to support multiple concurrent games.
