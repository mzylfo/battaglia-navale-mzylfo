import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { useState } from 'react';
import API from './API.js';
import Board from './Board.jsx';

function App() {
  const [game, setGame] = useState(null);
  const [shots, setShots] = useState([]);
  const [torpedoesLeft, setTorpedoesLeft] = useState(0);
  const [status, setStatus] = useState('playing');
  const [revealedShips, setRevealedShips] = useState(null); 

  const startGame = async (difficulty) => {
    const g = await API.createGame(difficulty);
    setGame(g);
    setShots([]);
    setTorpedoesLeft(g.torpedoesLeft);
    setStatus('playing');
    setRevealedShips(null); 
  };

  const handleShoot = async (row, col) => {
    if(status !== 'playing') return;
    const res = await API.fireShot(game.gameId, row, col);
    setShots([...shots, { row, col, result: res.result }]);
    setTorpedoesLeft(res.torpedoesLeft);
    setStatus(res.status);

    if(res.ships) setRevealedShips(res.ships); 
  };

  return(
    <div className="container my-4">
      <h1>Battaglia Navale ⚓</h1>

      {game === null ? (
        <div>
          <p>Scegli la difficoltà:</p>
          <button className="btn btn-primary me-2" onClick={() => startGame('easy')}>Facile</button>
          <button className="btn btn-warning me-2" onClick={() => startGame('medium')}>Intermedio</button>
          <button className="btn btn-danger" onClick={() => startGame('hard')}>Difficile</button>
        </div>
      ) : (
        <div>
          <p>Navi: {game.shipSizes.join(', ')} — Siluri rimasti: {torpedoesLeft}</p>
          {status === 'won' && <div className="alert alert-success">Hai vinto!</div>}
          {status === 'lost' && <div className="alert alert-danger">Hai perso!</div>}
          <Board game={game} shots={shots} revealedShips={revealedShips} onShoot={handleShoot} />
          {status !== 'playing' &&
            <button className="btn btn-secondary mt-3" onClick={() => setGame(null)}>Nuova partita</button>}
        </div>
      )}
    </div>
  );
}

export default App;
