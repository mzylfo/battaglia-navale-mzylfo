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

const API = {createGame, fireShot}; 
export default API; 