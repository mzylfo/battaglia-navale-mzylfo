import {NavLink} from "react-router";
import TournamentSetup from "./TournamentSetup.jsx";

//Schermata iniziale: da anonimo mostra la scelta Casual, da loggato la modalità Torneo
function HomePage({ loggedIn, onStartGame, onCreateTournament, onJoin }) {
  return (
    <div className="row justify-content-center">
      <div className="col-md-7">
        {loggedIn ? (
          <div className="card p-4 shadow-sm">
            <h4 className="text-center mb-3">Modalità Torneo</h4>
            <TournamentSetup onCreate={onCreateTournament} onJoin={onJoin} />
          </div>
        ) : (
          <div className="card p-4 shadow-sm text-center">
            <h4>Partita Casual</h4>
            <p className="text-muted">Scegli la difficoltà:</p>
            <div className="mb-3">
              <button className="btn btn-primary me-2" onClick={() => onStartGame('easy')}>Facile</button>
              <button className="btn btn-warning me-2" onClick={() => onStartGame('medium')}>Intermedio</button>
              <button className="btn btn-danger" onClick={() => onStartGame('hard')}>Difficile</button>
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
  );
}

export default HomePage;
