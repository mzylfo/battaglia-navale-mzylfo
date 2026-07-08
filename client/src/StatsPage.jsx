import {useState, useEffect} from "react";
import API from "./API.js";

//etichette in italiano per le difficoltà
const DIFF_LABELS = {easy: "Facile", medium: "Intermedio", hard: "Difficile"};

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
      <div className="row justify-content-center">
        <div className="col-md-9 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header text-white" style={{ backgroundColor: "#0d3b66" }}>
              <h4 className="mb-0">Statistiche</h4>
            </div>
            <div className="card-body">
              {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

              {stats.length === 0 && !errorMsg ? (
                <p className="text-muted mb-0">Nessuna partita registrata.</p>
              ) : (
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Giocatore</th>
                      <th>Difficoltà</th>
                      <th className="text-center">Giocate</th>
                      <th className="text-center">Vinte</th>
                      <th className="text-center">Perse</th>
                      <th className="text-center">% Vittorie</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((r) => (
                      <tr key={r.name + r.difficulty}>
                        <td className="fw-semibold">{r.name}</td>
                        <td>{DIFF_LABELS[r.difficulty]}</td>
                        <td className="text-center">{r.total}</td>
                        <td className="text-center text-success">{r.won}</td>
                        <td className="text-center text-danger">{r.lost}</td>
                        <td className="text-center">
                          <span className={"badge " + (r.winRate >= 50 ? "bg-success" : "bg-secondary")}>
                            {r.winRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    );
}

export default StatsPage;
