//seed.js permette di popolare il DB con tre utenti iniziali
import sqlite from "sqlite3";
import crypto from "crypto"; 

const db = new sqlite.Database("database.db", (err) => {if(err) throw err;}); 

//email, nome, password: la password in chiaro è qui solo perchè dobbiamo generare l'hash
const users=[
    {email: "matteo@test.it", name: "Matteo", password: "pass1" },
    {email: "asier@test.it", name: "Asier", password: "pass2" },
    {email: "queso@test.it", name: "Queso", password: "pass3" },
];

db.run("DELETE FROM users"); //svuotiamo il db così possiamo lanciare lo script senza errori di unique di email

for(let i=0; i<users.length; i++){
    const u = users[i]; 
    const salt = crypto.randomBytes(16).toString("hex"); 
    crypto.scrypt(u.password, salt, 16, (err, hashed) => {
        if(err) throw err; 
        const hash = hashed.toString("hex"); 

        db.run("INSERT INTO users(email, name, hash, salt) VALUES (?,?,?,?)",
            [u.email, u.name, hash, salt],
            (err) => {
                if(err) console.error(err); 
                else console.log(`Creato: ${u.email} con password ${u.password})`); 
            }); 
    });
}