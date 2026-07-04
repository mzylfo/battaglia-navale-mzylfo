//Questo file permette di presentare la logica del gioco

//Intervallo consentito per la dimensione di una nave - dalla traccia --> [2..5]
export const MIN_SHIP_SIZE = 2; 
export const MAX_SHIP_SIZE = 5;

//CONFIGURAZIONE DIFFICOLTA'
//Per ogni livello viene definita:
// - dimensione griglia
// - numero di navi --> le dimensioni vengono generate nell'intervallo [2..5]
// - numero di torpedoes / siluri 


export const DIFFICULTIES = { //variabile const esportabile cosi' le API potranno leggerlo 
    easy: {gridSize: 8, numShips: 4, torpedoes: 25}, 
    medium: {gridSize: 10, numShips: 6, torpedoes: 30}, 
    hard: {gridSize: 12, numShips: 8, torpedoes: 35}, 
}; 

//STRATEGIA PIAZZAMENTO DELLE NAVI 
/* Per ogni nave della flotta: 
 - ripetiamo: 
   1) scegliamo un orientamento casuale - H o V
   2) scegliamo una posizione di partenza a caso 
   3) calcoliamo le celle che occuperebbe
   4) controlliamo se è una posizione valida -> è dentro la griglia E non attaccata ad altre navi
     - Se SI': piazza la nave e passiamo alla successiva
     - Se NO: riproviamo con un'altra posizione */

//shipCells -> calcoliamo le celle che occuperebbe una nave
export function shipCells(size, startRow, startCol, orientation) { 
    const cells=[]; 

    for(let i=0; i<size; i++){  //utilizziamo un for per marcare i singoli blocchi nella grid 
        if(orientation === 'H')
            cells.push({row: startRow, col: startCol + i}); 
        else
            cells.push({row: startRow + i, col: startCol});
    }

    return cells; 
}

//generateFleet --> andiamo a generare le dimensioni della flotta
//Le dimensioni hanno dimensione casuale nell'intervallo [MIN_SHIP_SIZE, MAX_SHIP_SIZE]
export function generateFleet(numShips) { 
    const sizes=[]; 

    for(let i=0; i<numShips; i++){
        const size = MIN_SHIP_SIZE + Math.floor(Math.random() * (MAX_SHIP_SIZE - MIN_SHIP_SIZE +1)); 
        sizes.push(size); 
    }
    
    return sizes; 
}

/*isValidPlacement -> controlliamo se (1) tutte le celle sono dentro la griglia 
                   -> se nessuna cella tocca una nave già piazzata, nemmeno in diagonale*/ 
export function isValidPlacement(cells, gridSize, placedCells) { 
    for(let i=0; i<cells.length; i++){
        const cell = cells[i]; 

        //1) la cella è dentro la griglia? 
        if(cell.row<0 || cell.row >= gridSize || cell.col<0 || cell.col >=gridSize)
            return false; 

        //2) la cella tocca una nave già piazzata? 
        for(let j=0; j<placedCells.length; j++){
            const placed = placedCells[j]; 

            if(Math.abs(cell.row - placed.row) <= 1 && Math.abs(cell.col - placed.col) <= 1)
                return false; 
        }
    }

    return true; 
}

/* placeFleet -> piazziamo l'intera flotta sulla griglia
   - restituisce un array di navi: {size, startRow, startCol, orientation} */ 
export function placeFleet(gridSize, fleet){
    const ships=[]; 
    const placedCells=[]; 

    for(let i=0; i<fleet.length; i++){
        const size = fleet[i]; 
        let placed = false; 
        let attempts = 0; 

        while(!placed && attempts<1000){ //riprova 1000 volte finchè non la piazza
            attempts++; 

            //1) orientamento casuale 
            const orientation = Math.random() < 0.5 ? 'H' : 'V'; 

            //2) posiziona di partenza casuale con indice tra 0 e gridSize-1
            const startRow = Math.floor(Math.random() * gridSize); 
            const startCol = Math.floor(Math.random() * gridSize); 

            //3) celle che occuperebbe
            const cells = shipCells(size, startRow, startCol, orientation); 

            //4) la posizione è valida? 
            if(isValidPlacement(cells, gridSize, placedCells)){ 
                ships.push({size, startRow, startCol, orientation}); //salviamo la nave

                for(let j=0; j<cells.length; j++)
                    placedCells.push(cells[j]); //segno le celle come occupate

                placed=true; //segniamo in true così possiamo uscire dal ciclo 
            }
        }

        if(!placed) throw new Error("Impossibile piazzare la flotta"); 
    }

    return ships; 
}

/* setupFleet --> genera e piazza una flotta per la griglia data. 
   se il piazzamento fallisce per una flotta troppo densa, rigenera e riproviamo. */ 
export function setupFleet(gridSize, numShips) {
    for(let attempt=0; attempt<20; attempt++){
        try{
            const fleet = generateFleet(numShips); //dimensioni casuali generate
            return placeFleet(gridSize, fleet); //proviamo a piazzare le navi -> se ci riesce subito usciamo
        } catch{
            //flotta troppo densa da piazzare -> non facciamo niente, il for riprova
        }
    }
    throw new Error("Impossibile piazzare la flotta dopo vari tentativi"); 
}

// cellIsIn --> scorriamo la lista e restituiamo 'true' se troviano r, c nella lista passata
export function cellIsIn(r, c, list) {
    for(let i=0; i<list.length; i++){
        if(list[i].row === r && list[i].col === c)
            return true;
        }
            return false; 
    }

/* evaluateShot --> dato il colpo (r,c), le navi e colpi già fatti,
    - restituiamo {water, hit o sunk} per shipId*/
export function evaluateShot(row, col, ships, shots){
    //1) cerco la nave che contiene la cella colpita
    let hitShip = null; 
    let hitShipCells = null; 

    for(let i=0; i<ships.length; i++){
        const s = ships[i]; 

        const cells = shipCells(s.size, s.start_row, s.start_col, s.orientation); 

        if(cellIsIn(row, col, cells)){
            hitShip = s; 
            hitShipCells = cells; 
        }
    }

    //2) nesuna nave in quella cella --> ritorniamo ACQUA
    if(hitShip === null){
        return { result: "water"}; 
    }

    //3) c'è una nave: è affondata? 
    let sunk = true; //assumiamo che sia affondata
    for(let k=0; k<hitShipCells.length; k++){ //controlliamo tutte le sue celle
        const cell = hitShipCells[k]; 
        const isCurrent = (cell.row === row && cell.col === col); //è la cella che sto colpendo ora? 

        if(!isCurrent && !cellIsIn(cell.row, cell.col, shots)){ //la cella è diversa da quella che sto colpendo ora E non è mai stata colpita prima? 
            sunk = false; //abbiamo trovato una cella ancora intatta --> quindi la nave non era affondata 
        }
    }

    // 4) esito 
    if(sunk) {
        return {result: "sunk", shipId: hitShip.id}; 
    }
    return {result: "hit"}; 

}

//allShipsSunk --> true se tutte le celle di tutte le navi sono state colpite 
export function allShipsSunk(ships, shots) {
    for(let i=0; i<ships.length; i++){
        const s = ships[i]; //prendiamo ogni singola nave
        const cells = shipCells(s.size, s.start_row, s.start_col, s.orientation); //ritorniamo le colonne e righe che occupa

        for(let k=0; k<cells.length; k++){ 
            if(!cellIsIn(cells[k].row, cells[k].col, shots)){ //controlliamo: le celle delle navi sono nelle celle colpite? Se No, entriamo
                return false; //trovata almeno una cella di nave che non è ancora stata colpita
            }
        }
    }
    return true; //nessuna cella di nave ancora da colpire è stata scoperta --> vittoria!!
}
