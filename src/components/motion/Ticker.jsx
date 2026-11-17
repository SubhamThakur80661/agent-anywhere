// Idle motion: a slow marquee strip. Pure CSS transform animation, paused
// under reduced motion (the row then sits still and stays readable).
function Ticker({ items, className = "", separator = "//" }) {
  const row = (ariaHidden) => (
    <span className="aa-ticker-row" aria-hidden={ariaHidden || undefined}>
      {items.map((item, i) => (
        <span key={i} className="aa-ticker-item">
          <span>{item}</span>
          <span className="aa-ticker-sep">{separator}</span>
        </span>
      ))}
    </span>
  );

  return (
    <div className={`aa-ticker ${className}`}>
      <div className="aa-ticker-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

export default Ticker;
