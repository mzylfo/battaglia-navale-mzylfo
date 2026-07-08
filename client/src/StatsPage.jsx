import {useState, useEffect} from "react";
import API from "./API.js";

function StatsPage(){
    const [stats, setStats] = useState([]); 
    const [errorMsg, setErrorMsg] = useState(""); 

    //Carichiamo le statistiche all'apertura della pagina
    useEffect(() => {
        API.getStats()
            .then((s) => setStats(s))
            .catch(() => setErrorMsg("Impossibile caricare le statistiche")); 
    }, []); 

    return (
    <div>
      <h2>Statistiche</h2>
      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      {stats.length === 0 && !errorMsg ? (
        <p>Nessuna partita registrata.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Giocatore</th>
              <th>Difficoltà</th>
              <th>Giocate</th>
              <th>Vinte</th>
              <th>Perse</th>
              <th>Percentuale Vittorie</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((r) => (
              <tr key={r.name + r.difficulty}>
                <td>{r.name}</td>
                <td>{r.difficulty}</td>
                <td>{r.total}</td>
                <td>{r.won}</td>
                <td>{r.lost}</td>
                <td>{r.winRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default StatsPage;
