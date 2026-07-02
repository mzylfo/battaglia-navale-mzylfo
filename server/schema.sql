-- Schema database "Battaglia navale"

-- Tabella utenti registrati per effettuare il login
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    email TEXT NOT NULL UNIQUE, 
    name TEXT NOT NULL, 
    hash TEXT NOT NULL, -- password cifrata
    salt TEXT NOT NULL -- valore casuale che rende ogni hash diverso nel caso in cui due utenti abbiano due password uguali 
); 

-- Tabella delle partite
-- Abbiamo una riga per ogni partita in corso o finita
CREATE TABLE games(
    id  INTEGER PRIMARY KEY AUTOINCREMENT, 
    user_id INTEGER, --NULL se la partita è in modalità Casual (anonima)
    tournament_id INTEGER, --NULL se non è un torneo 
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    grid_size   INTEGER NOT NULL , -- grandezza della griglia 
    torpedoes_total INTEGER NOT NULL, --siluri totali ed iniziali
    torpedoes_left INTEGER NOT NULL, --siluri rimanenti disponibili
    status TEXT NOT NULL CHECK (status IN ('playing', 'won', 'lost')), -- "interruttore" che ci permette regolare il caso in cui il client NON ha mai la posizione delle navi
    created_at  TEXT NOT NULL, --data con ora di creazione
    FOREIGN KEY (user_id) REFERENCES users(id) --generiamo il legame tra le due tabelle 
);

-- Tabella deele navi 
CREATE TABLE ships (
    id  INTEGER PRIMARY KEY AUTOINCREMENT, 
    game_id INTEGER NOT NULL, -- indichiamo a quale partita appartiene la nave
    size    INTEGER NOT NULL, -- lunghezza della nave [2..5] celle
    start_row   INTEGER NOT NULL, -- riga della prima cella 
    start_col   INTEGER NOT NULL, -- colonna della prima cella
    orientation TEXT NOT NULL CHECK (orientation IN ('H', 'V')), -- H: orizzontale e V: verticale
    sunk    INTEGER NOT NULL DEFAULT 0, -- 0 -> a galla, 1 -> affondata (usiamo 0 e 1 perchè SQLite non ha tipo BOOLEAN)
    FOREIGN KEY (game_id)   REFERENCES games(id) -- una nave appartiene solo ad uno ed un solo gioco 
); 

-- Tabella dei siluri lanciati 
CREATE TABLE shots (
    id  INTEGER PRIMARY KEY AUTOINCREMENT, 
    game_id INTEGER NOT NULL, -- a quale partita appartiene il torpedoes
    row INTEGER NOT NULL, -- riga colpita
    col INTEGER NOT NULL, -- colonna della cella colpita
    result TEXT NOT NULL CHECK (result IN ('water', 'hit', 'sunk')),
    FOREIGN KEY (game_id) REFERENCES games(id), -- il siluro lanciato appartiene ad una sola partita
    UNIQUE (game_id, row, col) -- nella stessa partita non possono esistere due colpi sulla stessa cella 
); 

-- Tabella: Tournaments!!! da implementare a testo consolidato 