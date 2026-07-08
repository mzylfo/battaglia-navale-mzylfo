import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { useState, useEffect } from "react";
import { Routes, Route, NavLink, Navigate, useNavigate } from "react-router";
import API from "./API.js";
import Board from "./Board.jsx";
import LoginForm from "./LoginForm.jsx";
import TournamentSetup from "./TournamentSetup.jsx";
import StatsPage from "./StatsPage.jsx";
import Legend from "./Legend.jsx";

function App() {
  const [game, setGame] = useState({});
  const [shots, setShots] = useState([]);
  const [torpedoesLeft, setTorpedoesLeft] = useState(0);
  const [status, setStatus] = useState('playing');
  const [revealedShips, setRevealedShips] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState({});
  const [tournamentCode, setTournamentCode] = useState("");

  const navigate = useNavigate(); //per cambiare route dal codice (es. dopo il login)

  //Controlliamo se un utente è già loggato tramite i cookies
  useEffect(() => {
    API.getUserInfo().then((u) => { //il server mi ha riconosciuto: salvo utente e segno come loggato
      setLoggedIn(true);
      setUser(u);
    })
    .catch(() => {
      //nessuna sessione attiva --> rimaniamo sloggati
    });
  }, []); //"[]" --> eseguo una sola volta, appena il componente appare

  //resetta lo stato comune all'inizio di ogni partita
  const beginGame = (g) => {
    setGame(g);
    setShots([]);
    setTorpedoesLeft(g.torpedoesLeft);
    setStatus('playing');
    setRevealedShips([]);
    setTournamentCode(g.code || ""); //il codice lo abbiamo solamente nei tornei
  }

  const startGame = async (difficulty) => {
    const g = await API.createGame(difficulty);
    beginGame(g);
  };

  const startTournament = async (difficulty) => {
    const g = await API.createTournament(difficulty);
    beginGame(g);
  }

  const handleJoin = async (code) => {
    const g = await API.joinTournament(code); //può lanciare errore --> mostrato nel form all'utente
    beginGame(g);
  }

  const handleShoot = async (row, col) => {
    if(status !== 'playing') return;
    const res = await API.fireShot(game.gameId, row, col);

    let newShots = [...shots, { row, col, result: res.result }];
    //se ho affondato una nave, coloro come 'sunk' TUTTE le sue celle
    if(res.sunkCells){
      newShots = newShots.map((s) =>
        res.sunkCells.some((c) => c.row === s.row && c.col === s.col)
          ? { ...s, result: "sunk" }
          : s
      );
    }
    setShots(newShots);

    setTorpedoesLeft(res.torpedoesLeft);
    setStatus(res.status);
    if(res.ships) setRevealedShips(res.ships);
  };

  const handleLogin = async (credentials) => { //riceve username e password dal form e chiama l'API
    const u = await API.logIn(credentials);   //se le credenziali sono sbagliate, logIn fa throw
    setLoggedIn(true); //se va bene, aggiorniamo lo stato loggedIn e user
    setUser(u);
    navigate("/"); //dopo il login vado alla route del gioco (modalità Torneo)
  };

  const handleLogout = async () => {
    await API.logOut(); //chiamiamo l'api di logout
    setLoggedIn(false); //svuotiamo lo stato
    setUser({});
    navigate("/");
  };

  return(
    <div className="container my-4">

      {/* Navbar */}
      <nav className="navbar navbar-dark rounded-3 mb-4 px-4 py-3 shadow-sm" style={{ backgroundColor: "#0d3b66" }}>
        <span className="navbar-brand mb-0 h3 fw-bold">Battaglia Navale</span>
        <div className="d-flex align-items-center">
          <NavLink to="/" className={({ isActive }) => "btn btn-outline-light me-2" + (isActive ? " active" : "")}>Gioca</NavLink>
          <NavLink to="/stats" className={({ isActive }) => "btn btn-outline-light me-4" + (isActive ? " active" : "")}>Statistiche</NavLink>
          {loggedIn ? (
            <span className="d-flex align-items-center">
              <span className="text-light me-3">Ciao, <strong>{user.name}</strong></span>
              <button className="btn btn-light" onClick={handleLogout}>Logout</button>
            </span>
          ) : (
            <NavLink to="/login" className={({ isActive }) => "btn btn-outline-light" + (isActive ? " active" : "")}>Accedi</NavLink>
          )}
        </div>
      </nav>

      {/* Route dell'applicazione */}
      <Routes>

        {/* "/" --> il gioco (Casual da anonimo, Torneo da loggato) */}
        <Route path="/" element={
          !game.gameId ? (
            <div className="row justify-content-center">
              <div className="col-md-7">
                {loggedIn ? (
                  <div className="card p-4 shadow-sm">
                    <h4 className="text-center mb-3">Modalità Torneo</h4>
                    <TournamentSetup onCreate={startTournament} onJoin={handleJoin} />
                  </div>
                ) : (
                  <div className="card p-4 shadow-sm text-center">
                    <h4>Partita Casual</h4>
                    <p className="text-muted">Scegli la difficoltà:</p>
                    <div className="mb-3">
                      <button className="btn btn-primary me-2" onClick={() => startGame('easy')}>Facile</button>
                      <button className="btn btn-warning me-2" onClick={() => startGame('medium')}>Intermedio</button>
                      <button className="btn btn-danger" onClick={() => startGame('hard')}>Difficile</button>
                    </div>
                    <hr />
                    <p className="mb-0">
                      Vuoi sfidare altri sulla stessa griglia?{" "}
                      <NavLink to="/login">Accedi</NavLink> per la modalità <strong>Torneo</strong>.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center">
              {tournamentCode &&
                <div className="alert alert-info">Torneo: <strong>{tournamentCode}</strong> — condividi il codice!</div>}
              <p>Navi da affondare: <strong>{game.shipSizes.length}</strong> (dimensioni: {game.shipSizes.join(', ')}) — Siluri rimasti: <strong>{torpedoesLeft}</strong></p>
              {status === 'won' && <div className="alert alert-success">Hai vinto!</div>}
              {status === 'lost' && <div className="alert alert-danger">Hai perso!</div>}
              <div className="d-flex justify-content-center">
                <Board game={game} shots={shots} revealedShips={revealedShips} onShoot={handleShoot} />
              </div>
              <Legend />
              {status !== 'playing' &&
                <button className="btn btn-secondary mt-3" onClick={() => setGame({})}>Nuova partita</button>}
            </div>
          )
        } />

        {/* "/stats" --> statistiche pubbliche */}
        <Route path="/stats" element={<StatsPage />} />

        {/* "/login" --> se già loggato rimando al gioco, altrimenti il form */}
        <Route path="/login" element={
          loggedIn ? <Navigate to="/" replace /> : (
            <div className="row justify-content-center">
              <div className="col-md-5">
                <div className="card p-4 shadow-sm">
                  <h4 className="text-center mb-3">Accedi</h4>
                  <LoginForm onLogin={handleLogin} />
                </div>
              </div>
            </div>
          )
        } />

        {/* qualsiasi altra route --> torno al gioco */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </div>
  );
}

export default App;
