/// <reference types="vite/client" />
import React, { useState, useEffect } from 'react';

const EligibilityForm: React.FC = () => {
  const [formData, setFormData] = useState({
    snot22: 0,
    vas: 0,
    olfactory_test: 0,
    previous_surgeries: 0,
    corticosteroid_use: 0,
    polyp_size: 0,
    sinus_opacification: 0,
    asthma: 0,
    nsaid_intolerance: 0,
    serum_eosinophilia: 0,
    tissue_eosinophilia: 0
  });

  const [totalScore, setTotalScore] = useState(0);
  const [resultMessage, setResultMessage] = useState('');
  const [isEligible, setIsEligible] = useState<boolean | null>(null);

  useEffect(() => {
    const total = Object.values(formData).reduce((acc, curr) => acc + curr, 0);
    setTotalScore(total);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value, 10)
    }));
  };

  const handleCalculate = () => {
    if (totalScore >= 14) {
      setIsEligible(true);
      setResultMessage("Tem indicação para uso do Imunobiológico");
    } else {
      setIsEligible(false);
      setResultMessage("Imunobiológico não indicado no momento");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleCalculate();
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    
    try {
      const response = await fetch(`${apiUrl}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          total_score: totalScore
        })
      });
      
      if (!response.ok) {
        throw new Error('Falha de conexão com a API OTTO');
      }
      
      const result = await response.json();
      alert(`Avaliação enviada à base clínica (ID: ${result.id})!`);
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar dados. Verifique sua conexão com o servidor Web.');
    }
  };

  return (
    <form className="eligibility-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3>Severidade dos Sintomas</h3>
        <label>
          SNOT-22 (validado para Português Brasileiro)
          <select name="snot22" value={formData.snot22} onChange={handleChange}>
            <option value={0}>&lt; 20 (0 pontos)</option>
            <option value={1}>20-50 (1 ponto)</option>
            <option value={2}>&gt; 50 (2 pontos)</option>
          </select>
        </label>

        <label>
          EVA (Obstrução nasal/Rinorréia)
          <select name="vas" value={formData.vas} onChange={handleChange}>
            <option value={0}>&lt; 3 (0 pontos)</option>
            <option value={1}>3-7 (1 ponto)</option>
            <option value={2}>&gt; 7 (2 pontos)</option>
          </select>
        </label>

        <label>
          Teste de Olfato (UPSIT/Connecticut)
          <select name="olfactory_test" value={formData.olfactory_test} onChange={handleChange}>
            <option value={0}>&lt; 3 (normosmia ou hiposmia leve) (0 pontos)</option>
            <option value={1}>3-7 (hiposmia moderada) (1 ponto)</option>
            <option value={2}>&gt; 7 (hiposmia grave/anosmia) (2 pontos)</option>
          </select>
        </label>
      </div>

      <div className="form-section">
        <h3>Extensão da Doença</h3>
        <label>
          Número de cirurgias anteriores
          <select name="previous_surgeries" value={formData.previous_surgeries} onChange={handleChange}>
            <option value={0}>0 (0 pontos)</option>
            <option value={1}>1 (1 ponto)</option>
            <option value={2}>2 (2 pontos)</option>
            <option value={3}>&gt;= 3 ou contraindicação (3 pontos)</option>
          </select>
        </label>

        <label>
          Uso de Corticóides Sistêmico/ano
          <select name="corticosteroid_use" value={formData.corticosteroid_use} onChange={handleChange}>
            <option value={0}>0 (0 pontos)</option>
            <option value={1}>1 ou 2 (1 ponto)</option>
            <option value={2}>&gt; 2 (2 pontos)</option>
          </select>
        </label>

        <label>
          Tamanho dos pólipos (Nasal Polyp Score - bilateral)
          <select name="polyp_size" value={formData.polyp_size} onChange={handleChange}>
            <option value={0}>0 (0 pontos)</option>
            <option value={1}>1-2 (1 ponto)</option>
            <option value={2}>3-4 (2 pontos)</option>
            <option value={3}>&gt;= 5 (3 pontos)</option>
          </select>
        </label>

        <label>
          Opacificação sinusal (Lund-Mackay - bilateral)
          <select name="sinus_opacification" value={formData.sinus_opacification} onChange={handleChange}>
            <option value={0}>0-4 (0 pontos)</option>
            <option value={1}>5-8 (1 ponto)</option>
            <option value={2}>9-16 (2 pontos)</option>
            <option value={3}>&gt; 16 (3 pontos)</option>
          </select>
        </label>
      </div>

      <div className="form-section">
        <h3>Comorbidades</h3>
        <label>
          Asma
          <select name="asthma" value={formData.asthma} onChange={handleChange}>
            <option value={0}>Não (0 pontos)</option>
            <option value={1}>Leve (1 ponto)</option>
            <option value={2}>Moderada/grave (2 pontos)</option>
          </select>
        </label>

        <label>
          Intolerância a AINEs
          <select name="nsaid_intolerance" value={formData.nsaid_intolerance} onChange={handleChange}>
            <option value={0}>Não (0 pontos)</option>
            <option value={2}>Sim (2 pontos)</option>
          </select>
        </label>
      </div>

      <div className="form-section">
        <h3>Biomarcadores</h3>
        <label>
          Eosinofilia sérica
          <select name="serum_eosinophilia" value={formData.serum_eosinophilia} onChange={handleChange}>
            <option value={0}>&lt; 150 (0 pontos)</option>
            <option value={1}>150-300 (1 ponto)</option>
            <option value={2}>&gt; 300 (2 pontos)</option>
          </select>
        </label>

        <label>
          Eosinofilia tecidual
          <select name="tissue_eosinophilia" value={formData.tissue_eosinophilia} onChange={handleChange}>
            <option value={0}>&lt; 10 (0 pontos)</option>
            <option value={1}>10-43 (1 ponto)</option>
            <option value={2}>&gt; 43 (2 pontos)</option>
          </select>
        </label>
      </div>

      <div className="score-panel">
        <h2>Pontuação Total: <span>{totalScore}</span></h2>
      </div>

      <div className="button-group">
        <button type="button" onClick={handleCalculate}>Calcular</button>
        <button type="submit" className="primary-btn">Enviar API</button>
      </div>

      {isEligible !== null && (
        <div className={`result-box ${isEligible ? 'eligible' : 'not-eligible'}`}>
          {resultMessage}
        </div>
      )}
    </form>
  );
};

export default EligibilityForm;
