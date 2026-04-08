import EligibilityForm from './components/EligibilityForm'

function App() {
  return (
    <div className="app-container">
      <header className="header">
        <h1>NUCALAPP Imunobiológicos</h1>
        <p>Critérios de Elegibilidade na Rinossinusite Crônica com Polipose Nasossinusal</p>
      </header>
      <main className="main-content glass-panel">
        <EligibilityForm />
      </main>
      <footer>
        <p className="reference">Guideline for the use of immunobiologicals in chronic rhinosinusitis with nasal polyps (CRSWNP) in Brazil</p>
        <p className="credits">Criado pelo Dr. Dario Hart Signorini</p>
      </footer>
    </div>
  )
}

export default App
