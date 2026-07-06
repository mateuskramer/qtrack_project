import React from 'react';

export default function ReadoutChart({ distribuicao = [] }) {
  if (!distribuicao || distribuicao.length === 0) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: "#94a3b8",
        fontSize: "14px"
      }}>
        Sem dados de distribuição de T1 nesta QPU.
      </div>
    );
  }

  const values = distribuicao.map(item => Number(item.t1_valor));

  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  
  // Vamos criar 5 faixas (bins) de distribuição
  const binCount = 5;
  const step = (maxVal - minVal) / binCount;
  
  const bins = Array.from({ length: binCount }, (_, i) => {
    const start = minVal + i * step;
    const end = start + step;
    return {
      label: `${start.toFixed(0)}-${end.toFixed(0)} μs`,
      count: 0,
      min: start,
      max: end
    };
  });
  
  // Distribuir os valores dos qubits nos bins
  values.forEach(v => {
    for (let i = 0; i < binCount; i++) {
      if (v >= bins[i].min && (i === binCount - 1 ? v <= bins[i].max : v < bins[i].max)) {
        bins[i].count++;
        break;
      }
    }
  });
  
  const maxCount = Math.max(...bins.map(b => b.count), 1);
  const width = 500;
  const height = 180; // Altura ajustada para caber no painel perfeitamente

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{
          width: "100%",
          height: "140px",
          overflow: "visible",
        }}
      >
        {/* Linhas de Grade de Fundo */}
        {[0, 1, 2, 3, 4].map((i) => {
          const y = (height / 4) * i;
          return (
            <line
              key={i}
              x1="0"
              y1={y}
              x2={width}
              y2={y}
              stroke="var(--border-color)"
              strokeWidth="1"
              opacity="0.1"
            />
          );
        })}

        {/* Barras do Histograma */}
        {bins.map((bin, i) => {
          const barWidth = (width / binCount) - 16;
          const barHeight = (bin.count / maxCount) * (height - 35);
          const x = i * (width / binCount) + 8;
          const y = height - 20 - barHeight;

          return (
            <g key={i}>
              {/* Barra com Gradiente ou Cor Amber da Interface */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#f59e0b"
                opacity="0.85"
                rx="4"
                ry="4"
                style={{ transition: "all 0.3s ease" }}
              />
              {/* Texto com a Quantidade de Qubits em cada Faixa */}
              {bin.count > 0 && (
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  fill="var(--text-main)"
                  fontSize="11px"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {bin.count} {bin.count === 1 ? 'Qubit' : 'Qubits'}
                </text>
              )}
              {/* Rótulo da Faixa (Eixo X) */}
              <text
                x={x + barWidth / 2}
                y={height - 5}
                fill="var(--text-muted)"
                fontSize="10px"
                textAnchor="middle"
              >
                {bin.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '2px' }}>
        Amostragem de dispersão de tempos de coerência da QPU atual
      </div>
    </div>
  );
}