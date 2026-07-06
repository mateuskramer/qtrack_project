export default function FidelityChart({ historico = [] }) {
  if (!historico || historico.length === 0) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: "#94a3b8",
        fontSize: "14px"
      }}>
        Sem dados históricos de fidelidade nesta QPU.
      </div>
    );
  }

  const dataMap = {};
  historico.forEach(item => {
    const d = item.data;
    if (!dataMap[d]) {
      dataMap[d] = { q1: null, q2: null };
    }
    const rawVal = Number(item.media);
    const val = rawVal <= 1 ? rawVal * 100 : rawVal;
    
    if (item.numero_qubits_alvo === 1) {
      dataMap[d].q1 = val;
    } else if (item.numero_qubits_alvo === 2) {
      dataMap[d].q2 = val;
    }
  });

  const dates = Object.keys(dataMap);
  if (dates.length < 2) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: "#94a3b8",
        fontSize: "14px"
      }}>
        Dados insuficientes para histórico de fidelidade (mínimo de 2 dias).
      </div>
    );
  }

  const labels = dates;
  let lastQ1 = 99.0;
  let lastQ2 = 97.0;
  const data1Q = [];
  const data2Q = [];
  
  dates.forEach(d => {
    const val1 = dataMap[d].q1 !== null ? dataMap[d].q1 : lastQ1;
    const val2 = dataMap[d].q2 !== null ? dataMap[d].q2 : lastQ2;
    data1Q.push(val1);
    data2Q.push(val2);
    if (dataMap[d].q1 !== null) lastQ1 = dataMap[d].q1;
    if (dataMap[d].q2 !== null) lastQ2 = dataMap[d].q2;
  });

  const width = 500;
  const height = 220;

  const allValues = [...data1Q, ...data2Q];

  const min = Math.min(...allValues) - 0.5;
  const max = Math.max(...allValues) + 0.5;

  const getPoint = (value, index, total) => {
    const x = (index / (total - 1)) * width;

    const y =
      height -
      ((value - min) / (max - min)) * height;

    return { x, y };
  };

  const points1 = data1Q
    .map((v, i) => {
      const p = getPoint(v, i, data1Q.length);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  const points2 = data2Q
    .map((v, i) => {
      const p = getPoint(v, i, data2Q.length);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  return (
    <div style={{ width: "100%" }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{
          width: "100%",
          height: "220px",
          overflow: "visible",
        }}
      >
        {[0, 1, 2, 3, 4].map((i) => {
          const y = (height / 4) * i;

          return (
            <line
              key={i}
              x1="0"
              y1={y}
              x2={width}
              y2={y}
              stroke="#1e293b"
              strokeWidth="1"
            />
          );
        })}

        <polyline
          fill="none"
          stroke="#3b82f6"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points1}
        />

        <polyline
          fill="none"
          stroke="#a855f7"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points2}
        />

        {data1Q.map((value, index) => {
          const p = getPoint(value, index, data1Q.length);

          return (
            <circle
              key={`b-${index}`}
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#3b82f6"
            />
          );
        })}

        {data2Q.map((value, index) => {
          const p = getPoint(value, index, data2Q.length);

          return (
            <circle
              key={`p-${index}`}
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#a855f7"
            />
          );
        })}
      </svg>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "8px",
          color: "#94a3b8",
          fontSize: "12px",
        }}
      >
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "14px",
          color: "#cbd5e1",
          fontSize: "14px",
        }}
      >
        <span>🔵 Fidelidade 1Q</span>
        <span>🟣 Fidelidade 2Q</span>
      </div>
    </div>
  );
}