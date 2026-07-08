// imports
import express from "express";
import morgan from "morgan"; 
import cors from "cors";
import passport from "passport"; 
import LocalStrategy from "passport-local"; 
import session from "express-session"; 

import {DIFFICULTIES, setupFleet, cellIsIn, evaluateShot, allShipsSunk} from "./game_logic.js";
import {createGame, createShip, getGame, getShips, getShots, addShot, markShipSunk, updateGame, getUser,
        createTournament, getTournamentByCode, getGameByTournament, getGameForUserInTournament, getStats} from "./dao.js";


//init express
const app = new express();
const port = 3001;

//Passport --> verifica username + password
passport.use(new LocalStrategy(async function verify(username, password, cb){
  const user = await getUser(username, password); 
  if(!user)
    return cb(null, false, "Incorrect username or password!"); 
  return cb(null, user); 
})); 

passport.serializeUser((user, cb) => cb(null, user)); //cosa salviamo nella sessione? 
passport.deserializeUser((user, cb) => cb(null, user)); //da ciò che è stato salvato, ricostruisco l'utente

//middleware --> blocchiamo chi non è autenticato 
const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) return next(); 
  return res.status(401).json({error: "Not authorized"});
};

//middlware
app.use(express.json()); //leggeree il body JSON delle richieste
app.use(morgan("dev")); //log delle richieste in console

//CORS: permette al client (port: 5173) di chiamare il server (port: 3001)
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true, //necessario per i cookie di sessione login
}; 
app.use(cors(corsOptions)); 

app.use(session({
  secret: "segreto-battaglia-navale",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate("session"));

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

//POST /api/tournaments --> creiamo un nuovo torneo e la partita del creatore
app.post("/api/tournaments", isLoggedIn, async(req, res) => {
  const {difficulty} = req.body; 

  //validiamo che la difficoltà sia una di quelle previste
  if(!DIFFICULTIES[difficulty]){
    return res.status(422).json({error: "Invalid difficulty"}); 
  }
  const config = DIFFICULTIES[difficulty];

  try{
    //1) genero un codice casuale per il torneo 
    const code = "TOUR-" + Math.floor(1000 + Math.random()*9000); 

    //2) creo il torneo nel database
    const tournamentId = await createTournament(code, new Date().toISOString()); 

    //3) genero e piazzo la flotta 
    const ships = setupFleet(config.gridSize, config.numShips); 

    //4) creo la partita del creatore, legata al torneo appena definito 
    const gameId = await createGame({
      userId: req.user.id, //indichiamo l'id dell'utente loggato
      tournamentId: tournamentId, //leghiamo la partita con il torneo 
      difficulty: difficulty, 
      gridSize: config.gridSize,
      torpedoesTotal: config.torpedoes,
      torpedoesLeft: config.torpedoes, 
      status: "playing",
      createdAt: new Date().toISOString(),
    }); 

    //5) salviamo le navi della partita
    for(let i=0; i<ships.length; i++){
      await createShip(gameId, ships[i]); 
    }

    //6) rispondo senza posizioni delle navi 
    const shipSizes = ships.map((s) => s.size); 

    res.status(201).json({
      code: code, 
      gameId: gameId, 
      gridSize: config.gridSize,
      shipSizes: shipSizes,
      torpedoesTotal: config.torpedoes,
      torpedoesLeft: config.torpedoes, 
    }); 
  } catch(err){
    console.error(err); 
    res.status(500).json({error: "Error on creating tournament"}); 
  }
});

//POST /api/torunaments/join --> unisciti ad un torneo esistente tramite codice
app.post("/api/tournaments/join", isLoggedIn, async(req, res) => {
  const {code} = req.body; 

  try{
    //1) trovo il torneo dal codice
    const tournament = await getTournamentByCode(code); 
    
    if(tournament.error)
      return res.status(404).json(tournament); //il codice è inesistente

    //2) controlliamo se l'utente ha già giocato questo torneo 
    const existing = await getGameForUserInTournament(req.user.id, tournament.id);  

    if(existing)
      return res.status(409).json({error: "Hai già giocato questo torneo"}); //409 = conflict 

    //3) prendiamo una partita di riferimento del torneo per copiarne le navi 
    const refGame = await getGameByTournament(tournament.id); 

    if(refGame.error) 
      return res.status(404).json(refGame); 

    //4) legiamo le navi della partita
    const refShips = await getShips(refGame.id); 

    //5) creiamo una nuova partita per questo utente
    const gameId = await createGame({
      userId: req.user.id,
      tournamentId: tournament.id, 
      difficulty: refGame.difficulty, 
      gridSize: refGame.grid_size, 
      torpedoesTotal: refGame.torpedoes_total, 
      torpedoesLeft: refGame.torpedoes_total, 
      status: "playing",
      createdAt: new Date().toISOString(),
    }); 

    //6) Copio le navi della partita di riferimento nella nuova partita
    for(let i=0; i<refShips.length; i++){
      await createShip(gameId, {
        size: refShips[i].size, 
        startRow: refShips[i].start_row, 
        startCol: refShips[i].start_col,
        orientation: refShips[i].orientation,
      });
    }

    //7) rispondiamo senza le posizioni
    const shipSizes = refShips.map((s) => s.size); 
    res.status(201).json({
      code: code, 
      gameId: gameId,
      gridSize: refGame.grid_size,
      shipSizes: shipSizes,
      torpedoesTotal: refGame.torpedoes_total,
      torpedoesLeft: refGame.torpedoes_total,
    });
  } catch(err){
    console.error(err);
    res.status(500).json({error: "Cannot join the tournament!"});
  }
});

//GET /api/stats --> statistiche PUBBLICHE (anche anonimi)
app.get("/api/stats", async(req, res) => {
  try{
    const stats = await getStats();
    res.json(stats);
  }
  catch(err){
    console.error(err);
    res.status(500).json({error: "Cannot load stats"});
  }
});


//POST /api/sessions --> login
app.post("/api/sessions", passport.authenticate("local"), (req, res) => {
  res.status(201).json(req.user); 
}); 

//GET /api/sessions/current --> ritorniamo l'utente che è già loggato
app.get("/api/sessions/current", (req, res) => {
  if(req.isAuthenticated()) res.json(req.user); 
  else res.status(401).json({error: "Not authenticated"}); 
}); 

//DELETE /api/sessions/current --> logout
app.delete("/api/sessions/current", (req, res) => {
  req.logout(() => res.end()); 
});


//avvio server
app.listen(port, () =>{
  console.log(`Server listening at http://localhost:${port}`); 
}); 
