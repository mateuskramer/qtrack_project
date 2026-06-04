export default function Heatmap() {

  const qubits = Array.from(
    { length: 25 },
    () => Math.random()
  )

  return (

    <div className="panel">

      <h2>Heatmap dos Qubits</h2>

      <div className="heatmap">

        {qubits.map((value, index) => (

          <div
            key={index}
            className="cell"
            style={{
              background:
                `rgba(0,255,255,${value})`
            }}
          >
            {index}
          </div>

        ))}

      </div>

    </div>

  )

}