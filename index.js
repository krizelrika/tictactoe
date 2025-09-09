// Gameboard Module - manages the game board state
const Gameboard = (() => {
    let board = Array(9).fill('');

    const getBoard = () => [...board];

    const placeMarker = (index, marker) => {
        if (board[index] === '') {
            board[index] = marker;
            return true;
        }
        return false;
    };

    const checkWin = () => {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];

        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return null;
    };

    const checkTie = () => {
        return board.every(cell => cell !== '') && !checkWin();
    };

    const reset = () => {
        board = Array(9).fill('');
    };

    return {
        getBoard,
        placeMarker,
        checkWin,
        checkTie,
        reset
    };
})();

// Player Factory - creates player objects
const Player = (name, marker) => {
    return { name, marker };
};

// Game Controller Module - manages game flow and logic
const GameController = (() => {
    let players = [];
    let currentPlayerIndex = 0;
    let gameActive = false;

    const initGame = (player1Name, player2Name) => {
        players = [
            Player(player1Name, 'X'),
            Player(player2Name, 'O')
        ];
        currentPlayerIndex = 0;
        gameActive = true;
        Gameboard.reset();
    };

    const getCurrentPlayer = () => players[currentPlayerIndex];

    const switchPlayer = () => {
        currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
    };

    const makeMove = (index) => {
        if (!gameActive) return false;

        const currentPlayer = getCurrentPlayer();
        const moveSuccessful = Gameboard.placeMarker(index, currentPlayer.marker);

        if (moveSuccessful) {
            const winner = Gameboard.checkWin();
            const tie = Gameboard.checkTie();

            if (winner) {
                gameActive = false;
                return { type: 'win', player: currentPlayer };
            } else if (tie) {
                gameActive = false;
                return { type: 'tie' };
            } else {
                switchPlayer();
                return { type: 'continue' };
            }
        }
        return false;
    };

    const isGameActive = () => gameActive;

    const resetGame = () => {
        currentPlayerIndex = 0;
        gameActive = true;
        Gameboard.reset();
    };

    return {
        initGame,
        getCurrentPlayer,
        makeMove,
        isGameActive,
        resetGame
    };
})();

// Display Controller Module - handles DOM manipulation and UI
const DisplayController = (() => {
    const setupForm = document.getElementById('setupForm');
    const gameArea = document.getElementById('gameArea');
    const startBtn = document.getElementById('startBtn');
    const restartBtn = document.getElementById('restartBtn');
    const gameInfo = document.getElementById('gameInfo');
    const message = document.getElementById('message');
    const gameboard = document.getElementById('gameboard');
    const cells = document.querySelectorAll('.cell');

    const showGameArea = () => {
        setupForm.classList.add('hidden');
        gameArea.classList.remove('hidden');
    };

    const showSetupForm = () => {
        setupForm.classList.remove('hidden');
        gameArea.classList.add('hidden');
        restartBtn.classList.add('hidden');
        message.textContent = '';
        message.className = 'message';
    };

    const updateGameInfo = (playerName) => {
        gameInfo.textContent = `${playerName}'s turn`;
    };

    const updateBoard = () => {
        const board = Gameboard.getBoard();
        cells.forEach((cell, index) => {
            cell.textContent = board[index];
            cell.className = 'cell';
            if (board[index]) {
                cell.classList.add(board[index].toLowerCase());
            }
            
            if (GameController.isGameActive() && board[index] === '') {
                cell.classList.remove('disabled');
            } else {
                cell.classList.add('disabled');
            }
        });
    };

    const showResult = (result) => {
        if (result.type === 'win') {
            message.textContent = `🎉 ${result.player.name} wins!`;
            message.className = 'message win';
            gameInfo.textContent = 'Game Over';
        } else if (result.type === 'tie') {
            message.textContent = "🤝 It's a tie!";
            message.className = 'message tie';
            gameInfo.textContent = 'Game Over';
        }
        restartBtn.classList.remove('hidden');
    };

    const bindEvents = () => {
        startBtn.addEventListener('click', () => {
            const player1Name = document.getElementById('player1Name').value.trim() || 'Player 1';
            const player2Name = document.getElementById('player2Name').value.trim() || 'Player 2';
            
            GameController.initGame(player1Name, player2Name);
            showGameArea();
            updateGameInfo(GameController.getCurrentPlayer().name);
            updateBoard();
        });

        restartBtn.addEventListener('click', () => {
            GameController.resetGame();
            updateGameInfo(GameController.getCurrentPlayer().name);
            updateBoard();
            message.textContent = '';
            message.className = 'message';
            restartBtn.classList.add('hidden');
        });

        gameboard.addEventListener('click', (e) => {
            if (e.target.classList.contains('cell') && !e.target.classList.contains('disabled')) {
                const index = parseInt(e.target.dataset.index);
                const result = GameController.makeMove(index);
                
                if (result) {
                    updateBoard();
                    
                    if (result.type === 'continue') {
                        updateGameInfo(GameController.getCurrentPlayer().name);
                    } else {
                        showResult(result);
                    }
                }
            }
        });

        // Allow Enter key to start game
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !setupForm.classList.contains('hidden')) {
                startBtn.click();
            }
        });
    };

    const init = () => {
        bindEvents();
        showSetupForm();
    };

    return { init };
})();

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    DisplayController.init();
});