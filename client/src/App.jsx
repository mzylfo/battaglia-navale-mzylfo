import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import {useState, useEffect} from "react";
import {Routes, Route, NavLink, Navigate, useNavigate} from "react-router";
import API from "./API.js";
import HomePage from "./HomePage.jsx";
import GamePage from "./GamePage.jsx";
import LoginPage from "./LoginPage.jsx";
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
  const [errorMsg, setErrorMsg] = useState(""); //messaggio d'errore mostrato all'utente

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
    try {
      const g = await API.createGame(difficulty);
      beginGame(g);
    } catch {
      setErrorMsg("Errore nella creazione della partita.");
    }
  };

  const startTournament = async (difficulty) => {
    try {
      const g = await API.createTournament(difficulty);
      beginGame(g);
    } catch {
      setErrorMsg("Errore nella creazione del torneo.");
    }
  }

  const handleJoin = async (code) => {
    const g = await API.joinTournament(code); //può lanciare errore --> mostrato nel form all'utente
    beginGame(g);
  }

  const handleShoot = async (row, col) => {
    if(status !== 'playing') return;
    try {
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
    } catch {
      setErrorMsg("Errore durante il lancio del siluro.");
    }
  };

  const handleLogin = async (credentials) => { //riceve username e password dal form e chiama l'API
    const u = await API.logIn(credentials);   //se le credenziali sono sbagliate, logIn fa throw
    setLoggedIn(true); //se va bene, aggiorniamo lo stato loggedIn e user
    setUser(u);
    setGame({});           //abbandono l'eventuale partita Casual in corso
    setTournamentCode("");
    navigate("/"); //dopo il login vado alla route del gioco (modalità Torneo)
  };

  const handleLogout = async () => {
    try {
      await API.logOut(); //chiamiamo l'api di logout
      setLoggedIn(false); //svuotiamo lo stato
      setUser({});
      setGame({});           //abbandono l'eventuale partita in corso
      setTournamentCode("");
      navigate("/");
    } catch {
      setErrorMsg("Errore durante il logout.");
    }
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

      {/* Avviso d'errore (comunicazione col server) */}
      {errorMsg &&
        <div className="alert alert-danger alert-dismissible">
          {errorMsg}
          <button type="button" className="btn-close" onClick={() => setErrorMsg("")}></button>
        </div>}

      {/* Route dell'applicazione */}
      <Routes>

        {/* "/" --> home (scelta modalità) oppure la partita in corso */}
        <Route path="/" element={
          !game.gameId ? (
            <HomePage
              loggedIn={loggedIn}
              onStartGame={startGame}
              onCreateTournament={startTournament}
              onJoin={handleJoin}
            />
          ) : (
            <GamePage
              game={game}
              shots={shots}
              revealedShips={revealedShips}
              torpedoesLeft={torpedoesLeft}
              status={status}
              tournamentCode={tournamentCode}
              onShoot={handleShoot}
              onNewGame={() => setGame({})}
            />
          )
        } />

        {/* "/stats" --> statistiche pubbliche */}
        <Route path="/stats" element={<StatsPage />} />

        {/* "/login" --> se già loggato rimando al gioco, altrimenti il form */}
        <Route path="/login" element={
          loggedIn ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} />
        } />

        {/* qualsiasi altra route --> torno al gioco */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </div>
  );
}

export default App;