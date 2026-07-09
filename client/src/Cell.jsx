//File JSX per una singola cella della griglia
//stato: empty, water, hit, sunk, ship

function Cell({ state, onClick }) {
  let cssClass = "cell";
  let icon = null;
  if (state === "water") {cssClass += " cell-water"; icon = "bi-droplet-fill";} //acqua (mancato)
  else if (state === "hit") {cssClass += " cell-hit";   icon = "bi-x-lg";}         //colpito
  else if (state === "sunk") {cssClass += " cell-sunk";  icon = "bi-fire";}         //affondato
  else if (state === "ship") {cssClass += " cell-ship";  icon = "bi-suit-diamond-fill";} //nave rivelata
  else  {cssClass += " cell-empty";}                            //cella cliccabile

  return (
    <div
      className={cssClass}
      onClick={state === "empty" ? onClick : undefined}
    >
      {icon && <i className={"bi " + icon}></i>}
    </div>
  );
}

export default Cell;
