//seed.js permette di popolare il DB con tre utenti iniziali e alcune partite finite per le statistiche (due utenti su tre hanno giocato)
import sqlite from "sqlite3";
import crypto from "crypto"; 
import {DIFFICULTIES} from "./game_logic.js"; 

const db = new sqlite.Database("database.db", (err) => {if(err) throw err;}); 

//email, nome, password: la password in chiaro è qui solo perchè dobbiamo generare l'hash
const users=[
    {email: "matteo@test.it", name: "Matteo", password: "pass1"},
    {email: "asier@test.it", name: "Asier", password: "pass2"},
    {email: "queso@test.it", name: "Queso", password: "pass3"},
];

//partite finite di esempio: "Queso" non ha giocato
const games=[
    {email: "matteo@test.it", difficulty: "easy",   status: "won"},
    {email: "matteo@test.it", difficulty: "easy",   status: "won"},
    {email: "matteo@test.it", difficulty: "easy",   status: "lost"},
    {email: "matteo@test.it", difficulty: "medium", status: "won"},
    {email: "matteo@test.it", difficulty: "medium", status: "lost"},
    {email: "asier@test.it",  difficulty: "easy",   status: "won"},
    {email: "asier@test.it",  difficulty: "easy",   status: "lost"},
    {email: "asier@test.it",  difficulty: "hard",   status: "won"},
];

db.serialize(() => {
    //svuotiamo tutto per ripartire puliti 
    db.run("DELETE FROM shots");
    db.run("DELETE FROM ships");
    db.run("DELETE FROM games");
    db.run("DELETE FROM users");

    //Inserisco gli utenti
    for(let i=0; i<users.length; i++){
        const u = users[i]; 
        const salt = crypto.randomBytes(16).toString("hex"); 
        const hash = crypto.scryptSync(u.password, salt, 16).toString("hex"); 
        
        db.run("INSERT INTO users(email, name, hash, salt) VALUES (?, ?, ?, ?)", [u.email, u.name, hash, salt]); 

        console.log(`Utente: ${u.email} - ${u.password}`); 
        
    }

    //inserisco le partite finite (user_id ricavato dall'email con una subquery)
    for(let i=0; i<games.length; i++){
        const g = games[i];
        const cfg = DIFFICULTIES[g.difficulty];

        db.run(`INSERT INTO games (user_id, tournament_id, difficulty, grid_size, torpedoes_total, torpedoes_left, status, created_at)
                VALUES ((SELECT id FROM users WHERE email = ?), NULL, ?, ?, ?, ?, ?, ?)`,
            [g.email, g.difficulty, cfg.gridSize, cfg.torpedoes, g.status === "won" ? 5 : 0, g.status, new Date().toISOString()]);
    }
    console.log(`Partite inserite: ${games.length}`);
}); 

db.close(); 
