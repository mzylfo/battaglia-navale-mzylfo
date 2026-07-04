// imports
import express from "express";
import morgan from "morgan"; 
import cors from "cors";

import {DIFFICULTIES, setupFleet, cellIsIn, evaluateShot, allShipsSunk} from "./game_logic.js";
import {createGame, createShip, getGame, getShips, getShots, addShot, markShipSunk, updateGame} from "./dao.js";


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

//POST /api/games/:id/shots - lanciamo un siluro 
app.post("/api/games/:id/shots", async(req, res) => {
  const gameId = req.params.id; 
  const {row, col} = req.body; 

  try{
    //1) recupero la partita
    const game = await getGame(gameId); 
    if(game.error) return res.status(404).json(game); 
    if(game.status !== "playing") return res.status(422).json({error: "Game already over"}); 

    //2) valido la cella che sia dentro la griglia
    if(row === undefined || col === undefined || row < 0 || row >= game.grid_size || col < 0 || col >= game.grid_size)
      return res.status(422).json({error: "Invalid cell"}); 

    //3) leggo navi e colpi
    const ships = await getShips(gameId); 
    const shots = await getShots(gameId); 

    //4) controlliamo che non sia una cella già colpita prima
    if(cellIsIn(row, col, shots)){
      return res.status(422).json({error: "Cell already shot"}); 
    }

    //5) calcolo esito 
    const outcome = evaluateShot(row, col, ships, shots);

    //6) salvo il colpo 
    await addShot(gameId, {row, col, result: outcome.result}); 

    //7) se aggondata, segno la nave
    if(outcome.result === "sunk"){
      await markShipSunk(outcome.shipId); 
    }

    //8) aggiorno siluri e stato
    let torpedoesLeft = game.torpedoes_left; 
    if(outcome.result === "water") torpedoesLeft = torpedoesLeft - 1; 

    shots.push({row, col}); //includiamo il colpo attuale x controllo vittoria
    let status = "playing"; 
    if(allShipsSunk(ships, shots)) status = "won"; //Se abbiamo colpito tutte le navi --> vittoria
    else if (torpedoesLeft === 0) status = "lost"; //Se no, e non abbiamo siluri left --> perso 

    await updateGame(gameId, torpedoesLeft, status); 

    //9) rispondo solo se partita finita
    const response = {result: outcome.result, torpedoesLeft, status};
    if(status !== "playing"){
      response.ships = ships.map((s) => ({
        size: s.size, startRow: s.start_row, startCol: s.start_col, orientation: s.orientation
      })); 
    }
    res.json(response); 
  } catch (err) {
    console.error(err); 
    res.status(500).json({error: "Cannot process the shot"}); 
  }
}); 

//avvio server
app.listen(port, () =>{
  console.log(`Server listening at http://localhost:${port}`); 
}); 
