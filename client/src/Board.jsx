import Cell from './Cell.jsx';

//Espande una nave nelle sue celle (stessa logica del server)
function shipToCells(ship) {
  const cells = [];
  for (let i = 0; i < ship.size; i++) {
    if (ship.orientation === 'H') cells.push({ row: ship.startRow, col: ship.startCol + i });
    else cells.push({row: ship.startRow + i, col: ship.startCol });
  }
  return cells;
}

function Board({ game, shots, revealedShips, onShoot }) {
  //A fine partita: raccolgo tutte le celle delle navi da rivelare
  const shipCellsAll = [];
  if (revealedShips) {
    for (let s = 0; s < revealedShips.length; s++) {
      const cells = shipToCells(revealedShips[s]);
      for (let k = 0; k < cells.length; k++) shipCellsAll.push(cells[k]);
    }
  }

  const rows = [];
  for (let r = 0; r < game.gridSize; r++) {
    const cellsRow = [];
    for (let c = 0; c < game.gridSize; c++) {
      const shot = shots.find((s) => s.row === r && s.col === c);
      let state;
      if (shot) state = shot.result; //cella già colpita
      else if (shipCellsAll.find((x) => x.row === r && x.col === c))
        state = "ship"; 
      else state = "empty";
      cellsRow.push(<Cell key={c} state={state} onClick={() => onShoot(r, c)} />);
    }
    rows.push(<div key={r} className="d-flex">{cellsRow}</div>);
  }
  return <div>{rows}</div>;
}

export default Board;
