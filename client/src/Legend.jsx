//Legenda dei colori/icone della griglia

function Legend() {
  const items = [
    { cls: "cell-water", icon: "bi-droplet-fill",      label: "Acqua" },
    { cls: "cell-hit",   icon: "bi-x-lg",              label: "Colpito" },
    { cls: "cell-sunk",  icon: "bi-fire",              label: "Affondato" },
    { cls: "cell-ship",  icon: "bi-suit-diamond-fill", label: "Nave (rivelata)" },
  ];

  return (
    <div className="d-flex justify-content-center flex-wrap gap-4 mt-3">
      {items.map((it) => (
        <div key={it.label} className="d-flex align-items-center">
          <span
            className={"cell " + it.cls}
            style={{ width: 28, height: 28, fontSize: 14, margin: 0 }}
          >
            <i className={"bi " + it.icon}></i>
          </span>
          <span className="ms-2">{it.label}</span>
        </div>
      ))}
    </div>
  );
}

export default Legend;
