//File JSX per una singola cella della griglia
//il suo stato --> empty, water, hit, sunk 

function Cell({state, onClick}){
    let cssClass = "border d-flex align-items-center justify-content-center"; 
    let content = ""; 

    if(state === "water"){
        cssClass += " bg-info"; //azzurro --> acqua
    }
    else if (state === "hit"){
        cssClass += " bg-warning"; //giallo --> colpito
    }
    else if (state === "sunk"){
        cssClass += " bg-danger"; //rosso --> affondato
    }
    else if (state === "ship"){
        cssClass += " bg-secondary"; //grigio --> nave rivelata (a fine partita)
    }

    return (
        <div
            className={cssClass}
            style={{width: 40, height: 40, cursor: state === "empty" ? "pointer" : "default" }}
            onClick={state === "empty" ? onClick: undefined}
        ></div> 
    ); 
}

export default Cell; 