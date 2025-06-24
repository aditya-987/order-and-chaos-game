const playing_grid = document.getElementById('playing_grid');

const BOARD_SIZE = 6;

// Initialize game state variables
let round = 1;
let moves = [0,0];
let victory = [0,0];
let chosen = " ";
let numberOf4 = [0,0];
let board;

initializeGrid();
header();

// Create empty 6x6 board with clickable cells
function initializeGrid() {
    board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(" "));
    playing_grid.innerHTML = "";
    for(let i = 0; i<BOARD_SIZE; i++) {
        let row = document.createElement('div');
        row.className = "grid grid-cols-6 items-center justify-between";
        for(let j = 0; j<BOARD_SIZE; j++) {
            let cell = document.createElement('div');
            cell.className = "border border-gray-500 m-1 flex justify-center text-white items-center w-10 h-10 p-1 hover:bg-gray-500";
            cell.innerText = " ";
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', e => cellClicked(e));
            row.appendChild(cell);
        }
        playing_grid.appendChild(row);
    }
}

// Update header display for round/move/player info or show final result when gameOver = true
function header(gameOver=false) {
    const header = document.getElementById('header');
    console.log(gameOver);
    if(gameOver) {
        let result = checkVictory();
        header.innerHTML = `<h1 id="round" class="font-bold text-white text-2xl"> ${result} </h1>
                            <button onclick="reset()" class="border border-gray-500 flex rounded-full items-center justify-center font-bold text-white mt-3 py-3 w-full h-full hover:bg-gray-500">Play Agian 🔁</button>`;
    }
    else {
        header.innerHTML = `<div class="flex flex-row w-full items-center justify-center mb-3">
                                <h1 class="font text-white text-xl mr-6"> Current Round: ${round} </h1>
                                <h1 id="moves" class="font text-white text-xl ml-6"> Moves: ${moves[round-1]} </h1>
                            </div>
                                <h1 id="order" class="font-bold text-white text-lg"> Order: Player ${round} </h1>
                                <h1 id="chaos" class="text-white text-lg"> Chaos: Player ${round === 1 ? 2 : 1} </h1>`;
    }
}

// Highlight 'X' as selected symbol
function chosenX() {
    chosen = "X";
    const x = document.getElementById('X');
    const o = document.getElementById('O');
    x.style.backgroundColor = "gray";
    o.style.backgroundColor = "transparent";
}

// Highlight 'O' as selected symbol
function chosenO() {
    chosen = "O";
    const x = document.getElementById('X');
    const o = document.getElementById('O');
    o.style.backgroundColor = "gray";
    x.style.backgroundColor = "transparent";
}

// Handle click on a board cell
function cellClicked(e) {
    const clickedCell = e.target;

    // Ignore if symbol not chosen or cell already filled
    if(chosen === " " || clickedCell.innerText === "X" || clickedCell.innerText === "O") {
        return;
    }

    // Mark cell and update board state
    clickedCell.innerText = chosen;
    board[clickedCell.dataset.row][clickedCell.dataset.col] = chosen;

    // Toggle bold styling between Order and Chaos to show whose turn it is
    const order = document.getElementById('order');
    const chaos = document.getElementById('chaos');
    order.classList.toggle("font-bold");
    chaos.classList.toggle("font-bold");

    console.log(clickedCell.dataset.row);
    console.log(clickedCell.dataset.col);

    // Updates moves
    moves[round-1]++;
    document.getElementById('moves').innerText = `Moves: ${moves[round - 1]}`;

    // Check if move results in win or board full
    checkWin();
}

// Check for win (5 in a row) or full board
function checkWin() {
    let dirs = [[0,1],[1,0],[1,1],[-1,1]]; // Right, Down, Diagonal, Anti-diagonal

    for(let i=0; i<BOARD_SIZE; i++) {
        for(let j=0; j<BOARD_SIZE; j++) {
            if(board[i][j] === " ") {
                continue
            }
            for(let dir of dirs) {
                let count = 0;
                for(let k=0; k<5; k++) {
                    let row = i+k*dir[0];
                    let col = j+k*dir[1];
                    if(row>=0 && row<BOARD_SIZE && col>=0 && col<BOARD_SIZE && board[i][j] === board[row][col]) {
                        count++;
                    }
                    if(count === 5) {
                        count4();
                        if(round === 1) {
                            victory[0] = 1;
                            round = 2;
                            header();
                            initializeGrid();
                        }
                        else {
                            victory[1] = 2;
                            header(true);
                        }
                        return;
                    }
                }
            }
        }
    }

    // If no win, check for full board
    let isBoardFull = true;
    for(let i=0; i<BOARD_SIZE; i++) {
        for(let j=0; j<BOARD_SIZE; j++) {
            if(board[i][j] === " ") {
                isBoardFull = false;
            }
        }
    }
    // If full board, switch round or end game
    if(isBoardFull) {
        count4();
        if(round === 1) {
            victory[0] = 2;
            round = 2;
            initializeGrid();
        }
        else {
            victory[1] = 1;
            header(true);
        }
    }
}

// Count 4-in-a-row sequences for current round
function count4() {
    let dirs = [[0,1],[1,0],[1,1],[-1,1]];

    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const symbol = board[i][j];
            if (symbol === " ") {
                continue;
            }
            for (let dir of dirs) {
                let count = 0;
                for (let k = 0; k < 4; k++) {
                    let row = i + k * dir[0];
                    let col = j + k * dir[1];
                    if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE && board[row][col] === symbol) {
                        count++;
                    } else {
                        break;
                    }
                }

                if (count === 4) {
                    numberOf4[round - 1]++;
                }
            }
        }
    }
}

// Determine final winner
function checkVictory() {
    console.log(victory);
    console.log(moves);
    console.log(numberOf4);
    if(victory[0] === victory[1] ) {
        return `Player ${victory[0]} Wins!!`;
    }
    else {
        if(moves[0] < moves[1]) {
            return `Player 1 Wins!!`;
        }
        else if(moves[0] > moves[1]) {
            return `Player 2 Wins!!`;
        }
        else {
            if(numberOf4[0] < numberOf4[1]) {
                return `Player 2 Wins!!`;
            }
            else if(numberOf4[1] < numberOf4[0]) {
                return `Player 1 Wins!!`;
            }
            else {
                return `Draw !!!`;
            }
        }
    }
}

// Reset the game by reloading the page
function reset() {
    window.location.reload();
}