import Board from "./Board.jsx";
import Legend from "./Legend.jsx";

//Schermata di una partita in corso o terminata
function GamePage({game, shots, revealedShips, torpedoesLeft, status, tournamentCode, onShoot, onNewGame}) {
  return (
    <div className="text-center">
      {tournamentCode &&
        <div className="alert alert-info">Torneo: <strong>{tournamentCode}</strong> — condividi il codice!</div>}
      <p>Navi da affondare: <strong>{game.shipSizes.length}</strong> (dimensioni: {game.shipSizes.join(', ')}) — Siluri rimasti: <strong>{torpedoesLeft}</strong></p>
      {status === 'won' && <div className="alert alert-success">Hai vinto!</div>}
      {status === 'lost' && <div className="alert alert-danger">Hai perso!</div>}
      <div className="d-flex justify-content-center">
        <Board game={game} shots={shots} revealedShips={revealedShips} onShoot={onShoot} />
      </div>
      <Legend />
      {status !== 'playing' &&
        <button className="btn btn-secondary mt-3" onClick={onNewGame}>Nuova partita</button>}
    </div>
  );
}

export default GamePage;
