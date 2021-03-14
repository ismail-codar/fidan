export const svg_feoffset4 = (
  <svg height="140" width="140">
    <defs>
      <filter id="f1" x="0" y="0" width="200%" height="200%">
        <feOffset result="offOut" in="SourceGraphic" dx="20" dy="20" />
        <feColorMatrix
          result="matrixOut"
          in="offOut"
          type="matrix"
          values="0.2 0 0 0 0 0 0.2 0 0 0 0 0 0.2 0 0 0 0 0 1 0"
        />
        <feGaussianBlur result="blurOut" in="matrixOut" stdDeviation="10" />
        <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
      </filter>
    </defs>
    <rect
      width="90"
      height="90"
      stroke="green"
      stroke-width="3"
      fill="yellow"
      filter="url(#f1)"
    />
    Sorry, your browser does not support inline SVG.
  </svg>
);

document.getElementById('main').appendChild(svg_feoffset4 as any);
