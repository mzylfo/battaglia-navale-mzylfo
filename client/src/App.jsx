import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import {useState, useEffect } from "react";
import API from "./API.js";
import Board from "./Board.jsx";
import LoginForm from "./LoginForm.jsx";
import TournamentSetup from "./TournamentSetup.jsx";
import StatsPage from "./StatsPage.jsx"; 

function App() {
  const [game, setGame] = useState({});
  const [shots, setShots] = useState([]);
  const [torpedoesLeft, setTorpedoesLeft] = useState(0);
  const [status, setStatus] = useState('playing');
  const [revealedShips, setRevealedShips] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false); 
  const [user, setUser] = useState({});
  const [tournamentCode, setTournamentCode] = useState(""); 
  const [view, setView] = useState("game"); 

  //Controlliamo se un utente è già loggato tramite i cookies
  useEffect(() => {
    API.getUserInfo().then((u) => { //il server mi ha riconosciuto: salvo utente e segno come loggato
      setLoggedIn(true); 
      setUser(u); 
    })
    .catch(() => {
      //nessuna sessiona attiva --> rimaniamo sloggati
    }); 
  }, []); //"[]" --> esguo una sola volta, appena il componente appare

  //resetta lo stato comune all'inizio di ogni partita
  const beginGame = (g) => {
    setGame(g); 
    setShots([]); 
    setTorpedoesLeft(g.torpedoesLeft);
    setStatus('playing');
    setRevealedShips([]); 
    setTournamentCode(g.code || ""); //il codice lo abbiamo solamente nelle partite dei game
  }
  
  const startGame = async (difficulty) => {
    const g = await API.createGame(difficulty);
    beginGame(g); 
  };

  const startTournament = async (difficulty) => {
    const g = await API.createTournament(difficulty);
    beginGame(g); 
  }

  const handleJoin = async(code) => {
    const g = await API.joinTournament(code); //può lanciare errore --> mostrato nel form all'utente
    beginGame(g); 
  }

  const handleShoot = async (row, col) => {
    if(status !== 'playing') return;
    const res = await API.fireShot(game.gameId, row, col);
    setShots([...shots, { row, col, result: res.result }]);
    setTorpedoesLeft(res.torpedoesLeft);
    setStatus(res.status);

    if(res.ships) setRevealedShips(res.ships); 
  };

  const handleLogin = async (credentials) => { //riceve userame e password dal form e chiama l'Api 
    const u = await API.logIn(credentials);   // se le credenziali sono sbagliate, logIn fa throw
    setLoggedIn(true); //se va bene, aggiorniamo lo stato loggedIn e user
    setUser(u);
  };

  const handleLogout = async () => {
    await API.logOut(); //chiamiamo l'api di logout
    setLoggedIn(false); //svuotiamo lo stato
    setUser({});
  };

  return(
    <div className="container my-4">

      {/* Barra in alto: titolo + navigazione + stato utente */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="m-0">Battaglia Navale</h1>
        <div>
          <button className="btn btn-outline-primary me-2" onClick={() => setView('game')}>Gioca</button>
          <button className="btn btn-outline-primary me-3" onClick={() => setView('stats')}>Statistiche</button>
          {loggedIn ? (
            <span>
              <span className="me-2">Ciao, {user.name}!</span>
              <button className="btn btn-outline-secondary" onClick={handleLogout}>Logout</button>
            </span>
          ) : null}
        </div>
      </div>

      {/* Contenuto: statistiche OPPURE gioco */}
      {view === 'stats' ? (
        <StatsPage />
      ) : (
        <div>
          {!loggedIn && (
            <div className="card p-3 mb-4" style={{ maxWidth: 400 }}>
              <h5>Accedi</h5>
              <LoginForm onLogin={handleLogin} />
            </div>
          )}

          {!game.gameId ? (
            loggedIn ? (
              <TournamentSetup onCreate={startTournament} onJoin={handleJoin} />
            ) : (
              <div>
                <p>Scegli la difficoltà:</p>
                <button className="btn btn-primary me-2" onClick={() => startGame('easy')}>Facile</button>
                <button className="btn btn-warning me-2" onClick={() => startGame('medium')}>Intermedio</button>
                <button className="btn btn-danger" onClick={() => startGame('hard')}>Difficile</button>
              </div>
            )
          ) : (
            <div>
              {tournamentCode &&
                <div className="alert alert-info">Torneo: <strong>{tournamentCode}</strong> — condividi il codice!</div>}
              <p>Navi: {game.shipSizes.join(', ')} — Siluri rimasti: {torpedoesLeft}</p>
              {status === 'won' && <div className="alert alert-success">Hai vinto!</div>}
              {status === 'lost' && <div className="alert alert-danger">Hai perso!</div>}
              <Board game={game} shots={shots} revealedShips={revealedShips} onShoot={handleShoot} />
              {status !== 'playing' &&
                <button className="btn btn-secondary mt-3" onClick={() => setGame({})}>Nuova partita</button>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
