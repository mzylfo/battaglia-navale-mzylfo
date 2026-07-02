//DAO - Data Access Object
//In questo file possiamo trovare funzioni per leggere e scrivere nel database
//È come un traduttore che ha funzioni per interfacciarsi con il db e restituisce oggetti JSON
import sqlite from "sqlite3"; 

//apriamo la connessione al file del database
const db = new sqlite.Database("database.db", (err) => {
    if(err) throw err; 
}); 

//Attiviamo il rispetto dei vincoli FOREIGN KEY siccome in SQLite è spento di default
//In questo modo andiamo a rifiutare una foreign key che in realtà non esiste
//Concetto aggiuntivo! Non è stato visto nel corso ma mi sento di inserirlo per correttezza
db.run("PRAGMA foreign_keys = ON"); 

//GETGAME 
//Prendiamo una partita dato il suo id
export const getGame = (id) => { //esportiamo così le API possono richiamarla
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM games WHERE id = ?"; 

        db.get(sql, [id], (err, row) => { //db.get perchè vogliamo leggere UNA riga 
            if(err) reject(err); //se c'è un errore nel DB allora rifiutiamo la Promise
            else if(row === undefined) 
                resolve({error: "Game not found."});  //se nessuna riga combacia 
            else
                resolve(row); //restituiamo la riga
        });
    }); 
}

//CREATEGAME
//Crea una nuova partita e restituisce l'id appena generato
export const createGame = (game) => { 
    return new Promise ((resolve, reject) => {

        const sql = `INSERT INTO games 
                    (user_id, tournament_id, difficulty, grid_size, torpedoes_total, torpedoes_left, status, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`; 

                    db.run(sql, [game.userId, game.tournamentId, game.difficulty, game.gridSize, game.torpedoesTotal, game.torpedoesLeft, game.status, game.createdAt],
                        function(err) {  //non usiamo arrow function perchè siamo in db.run e possiamo utilizzare la .this dipenda chi chiama la funzione, 
                                         //con l'arrow function andiamo a prendere invece il this di chi lo circonda (in questo caso non abbiamo nessun oggetto e quindi avremo 'undefined' con arrow function)
                            if(err) reject(err); 
                            else resolve(this.lastID); 
                        });
                    }); 
} 

//CREATESHIP
//Inserisce una nave in una partita specificata e restituisce il suo id
export const createShip = (gameId, ship) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO ships (game_id, size, start_row, start_col, orientation)
                 VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [gameId, ship.size, ship.startRow, ship.startCol, ship.orientation],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
  });
}

