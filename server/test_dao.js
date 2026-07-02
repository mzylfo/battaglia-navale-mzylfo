import {createGame, getGame} from "./dao.js"; 

async function test() {
    // 1) creo una partita finta 
    const newId = await createGame({
        userId: null, 
        tournamentId: null, 
        difficulty: "easy",
        gridSize: 8, 
        torpedoesTotal: 25, 
        torpedoesLeft: 25, 
        status: "playing", 
        createdAt: "2026-06-25T10:00:00"
    }); 
    console.log("partita creata con id: ", newId); 

    //2) rileggo dal database per controllare che ci sia
    const game = await getGame(newId); 
    console.log("Riletta dal DB: ", game); 
}

test(); 