// imports
import express from "express";
import morgan from "morgan"; 
import cors from "cors";

import {DIFFICULTIES, setupFleet} from "./game_logic.js"; 
import {createGame, createShip} from "./dao.js"; 

// init express
const app = new express();
const port = 3001;

// middlware
app.use(express.json()); //leggeree il body JSON delle richieste
app.use(morgan("dev")); //log delle richieste in console

//CORS: permette al client (port: 5173) di chiamare il server (port: 3001)
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true, //necessario per i cookie di sessione login
}; 
app.use(cors(corsOptions)); 

//ROUTES 

//POST /api/game --> creiamo una nuova partita (Casual per ora)
app.post("/api/games", async (req, res) => {
  const {difficulty} = req.body; 

  //validiamo che la difficoltà sia una di quelle previste
  if(!DIFFICULTIES[difficulty]){
    return res.status(422).json({error: "Invalid difficulty"}); 
  }

  const config = DIFFICULTIES[difficulty];

  try{
    //1) generiamo e piazziamo la flotta
    const ships = setupFleet(config.gridSize, config.numShips); 

    //2) creiamo la partita nel database
    const gameId = await createGame({
      userId: null, //per ora utente anonimo
      tournamentId: null, 
      difficulty: difficulty, 
      gridSize: config.gridSize, 
      torpedoesTotal: config.torpedoes, 
      torpedoesLeft: config.torpedoes, 
      status: "playing",
      createdAt: new Date().toISOString(),
    }); 

    //3) salva ogni nave della partita
    for(let i=0; i<ships.length; i++){
      await createShip(gameId, ships[i]); 
    }

    //4) rispondiamo al Client senza le posizioni delle navi 
    const shipSizes = ships.map((s) => s.size); 
    res.status(201).json({
      gameId: gameId, 
      gridSize: config.gridSize, 
      shipSizes: shipSizes,
      torpedoesTotal: config.torpedoes, 
      torpedoesLeft: config.torpedoes,
    }); 
  } catch(err){
    console.error(err); 
    res.status(500).json({error: "Cannot create the game"}); 
  }
}); 

//avvio server
app.listen(port, () =>{
  console.log(`Server listening at http://localhost:${port}`); 
}); 
