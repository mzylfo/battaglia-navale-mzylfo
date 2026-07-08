const SERVER_URL = "http://localhost:3001"; 

//Crea una nuova partita e torna {gameId, gridSize, shipSizes, torpedoesTotal, torpedoesLeft}
async function createGame(difficulty){
    const response = await fetch(SERVER_URL + "/api/games", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify({difficulty}),
    }); 
    if(!response.ok) throw new Error("Errore nella creazione della partita"); 
    
    return await response.json(); 
}

//Lanciamo un siluro e torna {result, torpedoesLeft, status, ships}
async function fireShot(gameId, row, col){
    const response = await fetch(`${SERVER_URL}/api/games/${gameId}/shots`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify({row, col}),
    });
    if(!response.ok) throw new Error("Errore nel lancio del siluro"); 
    
    return await response.json(); 
}

//CREA TORNEO: crea un torneo solo per i loggati
async function createTournament(difficulty){
    const response = await fetch(SERVER_URL + "/api/tournaments", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify({difficulty}),
    });
    if(!response.ok) throw new Error("Errore nella creazione del torneo");
    return await response.json();
}

//UNISCITI A TORNEO: invia un codice al server e ritorna la partita (se esiste)
async function joinTournament(code){
    const response = await fetch(SERVER_URL + "/api/tournaments/join", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify({code}),
    });
    const data = await response.json();
    if(!response.ok) throw new Error(data.error || "Errore nell'unione al torneo");
    return data;
}

//STATISTICHE: tornano un array di righe 
async function getStats(){ 
    const response = await fetch(SERVER_URL + "/api/stats"); 

    if(!response.ok)
        throw new Error("Errore nel caricamento delle statistiche"); 
    return await response.json(); 
}

//LOGIN: mandiamo username e password --> torniamo l'utente se ok
async function logIn(credentials){
    const response = await fetch(SERVER_URL+"/api/sessions", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify(credentials),
    });

    if(response.ok) return await response.json(); 
    else throw new Error("Credenziali errate"); 
}

//GETUSERINFO: c'è già una sessione attiva? 
async function getUserInfo(){
    const response=await fetch(SERVER_URL+"/api/sessions/current", {
        credentials: "include",
    }); 
    
    const user = await response.json(); 
    
    if(response.ok) return user; 
    else throw user; 
}

//LOGOUT
async function logOut(){
    await fetch(SERVER_URL+"/api/sessions/current", {
        method: "DELETE",
        credentials: "include",
    }); 
}

const API = {createGame, fireShot, createTournament, joinTournament, getStats, logIn, getUserInfo, logOut}; 
export default API; 