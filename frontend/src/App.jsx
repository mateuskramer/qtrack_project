import './App.css'

import Sidebar from './components/Sidebar'
import MetricCard from './components/MetricCard'
import Heatmap from './components/Heatmap'
import ExperimentTable from './components/ExperimentTable'

function App() {

  return (
    <div className="layout">

      <Sidebar />

      <main className="main">

        <div className="topbar">

          <div>
            <h1>Quantum Hardware Dashboard</h1>
            <p>Monitoramento de QPUs</p>
          </div>

          <select>
            <option>QPU Alpha</option>
            <option>QPU Beta</option>
            <option>QPU Gamma</option>
          </select>

        </div>

        <div className="cards">

          <MetricCard
            title="Qubits Ativos"
            value="27 / 31"
          />

          <MetricCard
            title="Fidelidade 1Q"
            value="99.23%"
          />

          <MetricCard
            title="Fidelidade 2Q"
            value="97.14%"
          />

          <MetricCard
            title="T1 Médio"
            value="84 μs"
          />

        </div>

        <div className="middle">

          <Heatmap />

          <div className="panel">

            <h2>Resumo da QPU</h2>

            <p>
              Sistema operando normalmente.
            </p>

            <br />

            <p>
              Última calibração:
              02/06/2026
            </p>

            <p>
              Temperatura:
              15 mK
            </p>

          </div>

        </div>

        <ExperimentTable />

      </main>

    </div>
  )
}

export default App