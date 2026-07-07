import {useState} from "react";

function TournamentSetup({onCreate, onJoin}) {
  const [code, setCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleJoinSubmit = (event) => {
    event.preventDefault();
    setErrorMsg("");
    onJoin(code).catch((err) => setErrorMsg(err.message)); //mostra l'errore del server
  };

  return (
    <div>
      <h5>Crea un torneo</h5>
      <p>Scegli la difficoltà:</p>
      <button className="btn btn-primary me-2" onClick={() => onCreate("easy")}>Facile</button>
      <button className="btn btn-warning me-2" onClick={() => onCreate("medium")}>Intermedio</button>
      <button className="btn btn-danger" onClick={() => onCreate("hard")}>Difficile</button>

      <hr />

      <h5>Unisciti a un torneo</h5>
      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
      <form onSubmit={handleJoinSubmit} className="d-flex" style={{ maxWidth: 400 }}>
        <input
          type="text"
          className="form-control me-2"
          placeholder="Codice torneo (es. TOUR-1234)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-success">Unisciti</button>
      </form>
    </div>
  );
}

export default TournamentSetup;
