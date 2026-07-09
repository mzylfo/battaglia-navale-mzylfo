const SERVER_URL = "http://localhost:3001";

//Crea una nuova partita e torna {gameId, gridSize, shipSizes, torpedoesTotal, torpedoesLeft}
const createGame = async (difficulty) => {
    const response = await fetch(SERVER_URL + "/api/games", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify({difficulty}),
    });
    if(!response.ok) throw new Error("Errore nella creazione della partita");

    return await response.json();
};

//Lanciamo un siluro e torna {result, torpedoesLeft, status, ships}
const fireShot = async (gameId, row, col) => {
    const response = await fetch(`${SERVER_URL}/api/games/${gameId}/shots`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify({row, col}),
    });
    if(!response.ok) throw new Error("Errore nel lancio del siluro");

    return await response.json();
};

//CREA TORNEO: crea un torneo solo per i loggati
const createTournament = async (difficulty) => {
    const response = await fetch(SERVER_URL + "/api/tournaments", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify({difficulty}),
    });
    if(!response.ok) throw new Error("Errore nella creazione del torneo");
    return await response.json();
};

//UNISCITI A TORNEO: invia un codice al server e ritorna la partita (se esiste)
const joinTournament = async (code) => {
    const response = await fetch(SERVER_URL + "/api/tournaments/join", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify({code}),
    });
    const data = await response.json();
    if(!response.ok) throw new Error(data.error || "Errore nell'unione al torneo");
    return data;
};

//STATISTICHE: tornano un array di righe
const getStats = async () => {
    const response = await fetch(SERVER_URL + "/api/stats");

    if(!response.ok)
        throw new Error("Errore nel caricamento delle statistiche");
    return await response.json();
};

//LOGIN: mandiamo username e password --> torniamo l'utente se ok
const logIn = async (credentials) => {
    const response = await fetch(SERVER_URL+"/api/sessions", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify(credentials),
    });

    if(response.ok) return await response.json();
    else throw new Error("Credenziali errate");
};

//GETUSERINFO: c'è già una sessione attiva?
const getUserInfo = async () => {
    const response = await fetch(SERVER_URL+"/api/sessions/current", {
        credentials: "include",
    });

    const user = await response.json();

    if(response.ok) return user;
    else throw user;
};

//LOGOUT
const logOut = async () => {
    await fetch(SERVER_URL+"/api/sessions/current", {
        method: "DELETE",
        credentials: "include",
    });
};

const API = {createGame, fireShot, createTournament, joinTournament, getStats, logIn, getUserInfo, logOut};
export default API;
