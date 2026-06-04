export default function ExperimentTable() {

  const experiments = [

    {
      id: 1,
      nome: 'Randomized Benchmarking'
    },

    {
      id: 2,
      nome: 'T1 Characterization'
    },

    {
      id: 3,
      nome: 'Gate Tomography'
    }

  ]

  return (

    <div className="panel experiments">

      <h2>Últimos Experimentos</h2>

      <table>

        <thead>

          <tr>
            <th>ID</th>
            <th>Experimento</th>
          </tr>

        </thead>

        <tbody>

          {experiments.map(exp => (

            <tr key={exp.id}>
              <td>{exp.id}</td>
              <td>{exp.nome}</td>
            </tr>

          ))}

        </tbody>

      </table>

    </div>

  )

}