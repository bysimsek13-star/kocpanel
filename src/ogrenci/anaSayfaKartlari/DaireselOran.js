import React from 'react';
import PropTypes from 'prop-types';

export default function DaireselOran({ oran, s, boyut = 50 }) {
  const stroke = boyut < 60 ? 3.5 : 5;
  const r = (boyut - stroke * 2) / 2;
  const cx = boyut / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(oran, 100) / 100);
  const renk = oran >= 100 ? s.ok : s.accent;
  const fontSize = boyut < 60 ? 9 : 13;

  return (
    <svg width={boyut} height={boyut} viewBox={`0 0 ${boyut} ${boyut}`} style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={s.border} strokeWidth={stroke} />
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke={renk}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cx})`}
        style={{ transition: 'stroke-dashoffset .5s ease' }}
      />
      <text
        x={cx}
        y={cx}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={fontSize}
        fontWeight={700}
        fill={renk}
        fontFamily="Inter,sans-serif"
      >
        %{oran}
      </text>
    </svg>
  );
}

DaireselOran.propTypes = {
  oran: PropTypes.number,
  s: PropTypes.object.isRequired,
  boyut: PropTypes.number,
};
