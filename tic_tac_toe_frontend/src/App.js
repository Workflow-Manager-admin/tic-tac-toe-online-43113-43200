import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * Main App for Tic Tac Toe game.
 * Features:
 *  - Play against computer or another player
 *  - Modern, minimal light-themed UI
 *  - Responsive, center-aligned layout
 *  - Score tracking
 *  - Reset & new game control
 */

// Utility functions for the game logic

// PUBLIC_INTERFACE
function calculateWinner(squares) {
  /** Returns 'X', 'O', or null depending on win state */
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; ++i) {
    const [a, b, c] = lines[i];
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[b] === squares[c]
    ) {
      return squares[a];
    }
  }
  return null;
}

// PUBLIC_INTERFACE
function getEmptySquares(squares) {
  return squares
    .map((s, i) => (s ? null : i))
    .filter((i) => i !== null);
}

// PUBLIC_INTERFACE
function computerMove(squares, computerSymbol) {
  /** Simple AI: pick random empty square */
  const empties = getEmptySquares(squares);
  if (empties.length === 0) return null;
  return empties[Math.floor(Math.random() * empties.length)];
}

// Square component
function Square({ value, onClick, highlight }) {
  return (
    <button
      className={`ttt-square${highlight ? " highlight" : ""}`}
      onClick={onClick}
      aria-label={value ? `Cell, ${value}` : "Empty cell"}
      tabIndex={0}
    >
      {value}
    </button>
  );
}

// Game Board
function Board({ squares, onCellClick, winnerLine }) {
  function isHighlighted(index) {
    return winnerLine && winnerLine.includes(index);
  }
  return (
    <div className="ttt-board">
      {[0, 1, 2].map((row) => (
        <div className="ttt-board-row" key={row}>
          {[0, 1, 2].map((col) => {
            const idx = row * 3 + col;
            return (
              <Square
                key={idx}
                value={squares[idx]}
                onClick={() => onCellClick(idx)}
                highlight={isHighlighted(idx)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

// Scoreboard
function ScorePanel({ mode, scores }) {
  return (
    <div className="score-panel">
      <div className="score-mode">Mode: <strong>{mode === 'cpu' ? "Vs Computer" : "2 Player"}</strong></div>
      <div className="score-values">
        <span className="score-x">X: {scores.X}</span>
        <span className="score-o">O: {scores.O}</span>
        <span className="score-d">Draws: {scores.draws}</span>
      </div>
    </div>
  );
}

// Game controls (mode, reset)
function Controls({ mode, onModeChange, onReset, canChangeMode, canReset }) {
  return (
    <div className="ttt-controls">
      <button
        className="ttt-btn"
        onClick={() => onModeChange(mode === "cpu" ? "pvp" : "cpu")}
        disabled={!canChangeMode}
        aria-label={`Switch to ${mode === "cpu" ? "2 Player" : "Vs Computer"} mode`}
      >
        {mode === "cpu" ? "2 Player Mode" : "Vs Computer"}
      </button>
      <button
        className="ttt-btn ttt-btn-reset"
        onClick={onReset}
        disabled={!canReset}
      >
        Reset Scores
      </button>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  // Theme state for future enhancements (kept for minimal sample, not active now)
  // const [theme, setTheme] = useState("light");

  // Game state
  const [mode, setMode] = useState("cpu"); // 'cpu' or 'pvp'
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [winnerLine, setWinnerLine] = useState(null);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });

  // Handles cell click
  function handleCellClick(idx) {
    if (gameOver || squares[idx]) return;

    const newSquares = squares.slice();
    newSquares[idx] = xIsNext ? "X" : "O";
    setSquares(newSquares);

    // Check winner after this move
    const { win, line } = getWinnerStatus(newSquares);
    if (win) {
      setGameOver(true);
      setWinner(win);
      setWinnerLine(line);
      setScores((s) => ({
        ...s,
        [win]: s[win] + 1,
      }));
      return;
    } else if (isFull(newSquares)) {
      setGameOver(true);
      setWinner(null);
      setWinnerLine(null);
      setScores((s) => ({
        ...s,
        draws: s.draws + 1,
      }));
      return;
    }

    setXIsNext(!xIsNext);
  }

  // CPU turn: effect runs after player makes move, if mode is cpu and not game over, and it's O's turn
  useEffect(() => {
    if (
      mode === "cpu" &&
      !gameOver &&
      !xIsNext // O (computer) turn
    ) {
      const timer = setTimeout(() => {
        const idx = computerMove(squares, "O");
        if (idx != null) {
          handleCellClick(idx);
        }
      }, 600); // Simulate thinking
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line
  }, [mode, squares, xIsNext, gameOver]);

  // Winner logic returns winner symbol and winning line, or null
  function getWinnerStatus(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let line of lines) {
      const [a, b, c] = line;
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[b] === squares[c]
      ) {
        return { win: squares[a], line };
      }
    }
    return { win: null, line: null };
  }

  function isFull(squares) {
    return squares.every((s) => s);
  }

  // Start a new game
  function startNewGame() {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setGameOver(false);
    setWinner(null);
    setWinnerLine(null);
  }

  // Reset all scores and board
  function resetScores() {
    setScores({ X: 0, O: 0, draws: 0 });
    startNewGame();
  }

  // Handle mode switch: only permitted between games, resets game
  function handleModeChange(newMode) {
    if (mode !== newMode) {
      setMode(newMode);
      resetScores();
    }
  }

  // Winner message
  function winnerText() {
    if (winner === "X") return "X wins! 🎉";
    if (winner === "O") return (mode === "cpu" ? "Computer wins! 🤖" : "O wins! 🎉");
    if (winner === null && gameOver) return "It's a draw! 🤝";
    return "";
  }

  // Player info
  function playerStatus() {
    if (gameOver) return winnerText();
    if (mode === "cpu" && !xIsNext) return "Computer's turn 🤖";
    return `Player ${xIsNext ? "X" : "O"}'s turn`;
  }

  return (
    <div className="app-bg">
      <main className="game-container">
        <header className="ttt-header">
          <h1 className="ttt-title" style={{ color: "var(--primary)" }}>Tic Tac Toe</h1>
          <p className="ttt-subtitle">{playerStatus()}</p>
        </header>
        <ScorePanel mode={mode} scores={scores} />
        <section>
          <Board
            squares={squares}
            onCellClick={
              gameOver || (mode === "cpu" && !xIsNext)
                ? () => {}
                : handleCellClick
            }
            winnerLine={winnerLine}
          />
        </section>
        <div className="ttt-action-row">
          <button
            className="ttt-btn ttt-btn-primary"
            onClick={startNewGame}
            aria-label="Start new game"
            disabled={!gameOver && getEmptySquares(squares).length === 9}
            style={{ marginRight: 10 }}
          >
            {gameOver ? "Play Again" : "New Game"}
          </button>
          <Controls
            mode={mode}
            onModeChange={handleModeChange}
            onReset={resetScores}
            canChangeMode={gameOver || getEmptySquares(squares).length === 9}
            canReset={scores.X > 0 || scores.O > 0 || scores.draws > 0}
          />
        </div>
        <footer className="ttt-footer">
          <span>
            &copy; {new Date().getFullYear()} Tic Tac Toe Online · Built with&nbsp;
            <a href="https://reactjs.org" target="_blank" rel="noopener noreferrer" className="footer-link">React</a>
          </span>
        </footer>
      </main>
    </div>
  );
}

export default App;
