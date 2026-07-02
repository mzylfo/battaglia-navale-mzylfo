import{DIFFICULTIES, placeFleet, shipCells} from "./game_logic.js"; 

const config = DIFFICULTIES.easy; 
const ships = placeFleet(config.gridSize, config.ships); 
console.log("navi piazzate: ", ships); 
console.log(""); 

// disegno la griglia: '.' = acqua, '#' = nave
for (let r = 0; r < config.gridSize; r++) {
  let line = "";
  for (let c = 0; c < config.gridSize; c++) {
    let ch = ".";
    for (let s = 0; s < ships.length; s++) {            // per ogni nave...
      const cells = shipCells(ships[s].size, ships[s].startRow, ships[s].startCol, ships[s].orientation);
      for (let k = 0; k < cells.length; k++)            // ...per ogni sua cella...
        if (cells[k].row === r && cells[k].col === c)   // ...è questa cella?
          ch = "#";
    }
    line += ch + " ";
  }
  console.log(line);
}