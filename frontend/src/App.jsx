import { useState, useEffect } from 'react'
import './App.css'

import Sidebar from './components/Sidebar'
import MetricCard from './components/MetricCard'
import Heatmap from './components/Heatmap'
import ExperimentTable from './components/ExperimentTable'
import FidelityChart from './components/FidelityChart'
import ReadoutChart from './components/ReadoutChart'
import Copilot from './components/Copilot'
import CopilotHistory from './components/CopilotHistory'

// Importações do Recharts para os gráficos dos relatórios
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';

function App() {
  const [telaAtual, setTelaAtual] = useState('dashboard')
  const [listaQpus, setListaQpus] = useState([])
  const [listaAmbientes, setListaAmbientes] = useState([])

  // Estado para armazenar as várias conversas do Copilot
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('qtrack_conversations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Erro ao carregar conversas do localStorage:", e);
      }
    }
    return [
      {
        id: 'default',
        title: 'Conversa Inicial',
        messages: [
          {
            role: 'assistant',
            text: 'Olá! Sou o Copilot do QTrack. Posso responder dúvidas conceituais de computação quântica ou fazer consultas diretas no banco de dados para analisar o status das QPUs, qubits, criostatos, calibrações e experimentos. Como posso te ajudar hoje?'
          }
        ]
      }
    ];
  });

  // ID da conversa ativa no momento do Copilot
  const [activeConvId, setActiveConvId] = useState(() => {
    const savedActive = localStorage.getItem('qtrack_active_conv_id');
    return savedActive || 'default';
  });

  // Salva conversas no localStorage sempre que alteradas
  useEffect(() => {
    localStorage.setItem('qtrack_conversations', JSON.stringify(conversations));
  }, [conversations]);

  // Salva ID da conversa ativa no localStorage
  useEffect(() => {
    localStorage.setItem('qtrack_active_conv_id', activeConvId);
  }, [activeConvId]);

  // Estados para armazenar os dados dos relatórios (Abas acadêmicas)
  const [dadosT1, setDadosT1] = useState([])
  const [dadosFidelidade, setDadosFidelidade] = useState([])
  const [dadosTemperatura, setDadosTemperatura] = useState([])

  // ================= ESTADOS DOS FORMULÁRIOS (CRUD) =================
  
  // 1. QPUs
  const [nomeQpu, setNomeQpu] = useState('')
  const [fabricanteQpu, setFabricanteQpu] = useState('')
  const [modeloQpu, setModeloQpu] = useState('')
  const [tecnologiaQpu, setTecnologiaQpu] = useState('')
  const [dataInstalacaoQpu, setDataInstalacaoQpu] = useState('')
  const [statusQpu, setStatusQpu] = useState('Ativo')
  const [idCriostato, setIdCriostato] = useState('')
  const [idEditando, setIdEditando] = useState(null)

  // 2. Qubits
  const [listaQubits, setListaQubits] = useState([])
  const [indiceQubit, setIndiceQubit] = useState('')
  const [tipoQubit, setTipoQubit] = useState('')
  const [frequenciaRessonancia, setFrequenciaRessonancia] = useState('')
  const [statusQubit, setStatusQubit] = useState('Ativo')
  const [observacoesQubit, setObservacoesQubit] = useState('')
  const [idQpuQubit, setIdQpuQubit] = useState('')
  const [idQubitEditando, setIdQubitEditando] = useState(null)

  // 3. Criostatos
  const [listaCriostatos, setListaCriostatos] = useState([])
  const [nomeCrio, setNomeCrio] = useState('')
  const [fabricanteCrio, setFabricanteCrio] = useState('')
  const [modeloCrio, setModeloCrio] = useState('')
  const [tempCrio, setTempCrio] = useState('')
  const [statusCrio, setStatusCrio] = useState('Ativo')
  const [idCrioEditando, setIdCrioEditando] = useState(null)

  // 4. Pesquisadores
  const [listaPesquisadores, setListaPesquisadores] = useState([])
  const [nomePesq, setNomePesq] = useState('')
  const [emailPesq, setEmailPesq] = useState('')
  const [instituicaoPesq, setInstituicaoPesq] = useState('')
  const [areaPesq, setAreaPesq] = useState('')
  const [idPesqEditando, setIdPesqEditando] = useState(null)

  // 5. Experimentos
  const [listaExperimentos, setListaExperimentos] = useState([])
  const [nomeExp, setNomeExp] = useState('')
  const [objetivoExp, setObjetivoExp] = useState('')
  const [inicioExp, setInicioExp] = useState('')
  const [fimExp, setFimExp] = useState('')
  const [statusExp, setStatusExp] = useState('Planejado')
  const [obsExp, setObsExp] = useState('')
  const [idPesqExp, setIdPesqExp] = useState('')
  const [idQpuExp, setIdQpuExp] = useState('')
  const [idAmbExp, setIdAmbExp] = useState('')
  const [idExpEditando, setIdExpEditando] = useState(null)

  // 6. Calibrações
  const [listaCalibracoes, setListaCalibracoes] = useState([])
  const [inicioCal, setInicioCal] = useState('')
  const [fimCal, setFimCal] = useState('')
  const [tipoCal, setTipoCal] = useState('')
  const [versaoCal, setVersaoCal] = useState('')
  const [resultadoCal, setResultadoCal] = useState('Sucesso')
  const [obsCal, setObsCal] = useState('')
  const [idPesqCal, setIdPesqCal] = useState('')
  const [idQpuCal, setIdQpuCal] = useState('')
  const [idAmbCal, setIdAmbCal] = useState('')
  const [idCalEditando, setIdCalEditando] = useState(null)

  // 7. Novos campos de Ambiente (para Experimentos e Calibrações)
  const [tempAmbExp, setTempAmbExp] = useState('0.0102')
  const [presAmbExp, setPresAmbExp] = useState('0.81')
  const [umidAmbExp, setUmidAmbExp] = useState('30.1')
  const [vibAmbExp, setVibAmbExp] = useState('0.03')
  const [campoAmbExp, setCampoAmbExp] = useState('0.11')
  const [obsAmbExp, setObsAmbExp] = useState('Condição nominal')

  const [tempAmbCal, setTempAmbCal] = useState('0.0102')
  const [presAmbCal, setPresAmbCal] = useState('0.81')
  const [umidAmbCal, setUmidAmbCal] = useState('30.1')
  const [vibAmbCal, setVibAmbCal] = useState('0.03')
  const [campoAmbCal, setCampoAmbCal] = useState('0.11')
  const [obsAmbCal, setObsAmbCal] = useState('Condição nominal')

  const [listaSequencias, setListaSequencias] = useState([])
  const [idSeqExp, setIdSeqExp] = useState('')
  const [idSeqCal, setIdSeqCal] = useState('')

  // Estado para filtrar a QPU visualizada no Relatório 1
  const [qpuFiltrada, setQpuFiltrada] = useState('todas');
  const [detalhesModalOpen, setDetalhesModalOpen] = useState(false);
  const [detalhesDados, setDetalhesDados] = useState(null);

  // ============== ESTADOS DO DASHBOARD DINÂMICO ==============
  const [qpuSelecionada, setQpuSelecionada] = useState('')
  const [dadosDashQubits, setDadosDashQubits] = useState({ 
    mapa: [], 
    metricas: [], 
    fidelidades: [],
    historicoFidelidade: [],
    historicoErro: [],
    experimentos: [],
    distribuicaoT1: []
  })


  // ================= LIMPEZA DE FORMULÁRIOS =================
  const limparFormulario = () => {
    setNomeQpu(''); setFabricanteQpu(''); setModeloQpu('');
    setTecnologiaQpu(''); setDataInstalacaoQpu(''); setStatusQpu('Ativo'); 
    setIdCriostato(''); setIdEditando(null);
  }
  const limparFormQubit = () => {
    setIndiceQubit(''); setTipoQubit(''); setFrequenciaRessonancia('');
    setStatusQubit('Ativo'); setObservacoesQubit(''); setIdQpuQubit(''); setIdQubitEditando(null);
  }
  const limparFormCriostato = () => {
    setNomeCrio(''); setFabricanteCrio(''); setModeloCrio(''); setTempCrio(''); setStatusCrio('Ativo'); setIdCrioEditando(null);
  }
  const limparFormPesquisador = () => {
    setNomePesq(''); setEmailPesq(''); setInstituicaoPesq(''); setAreaPesq(''); setIdPesqEditando(null);
  }
  const limparFormExperimento = () => {
    setNomeExp(''); setObjetivoExp(''); setInicioExp(''); setFimExp(''); setStatusExp('Planejado'); setObsExp(''); setIdPesqExp(''); setIdQpuExp(''); setIdAmbExp('');
    setTempAmbExp('0.0102'); setPresAmbExp('0.81'); setUmidAmbExp('30.1'); setVibAmbExp('0.03'); setCampoAmbExp('0.11'); setObsAmbExp('Condição nominal');
    setIdSeqExp('');
    setIdExpEditando(null);
  }
  const limparFormCalibracao = () => {
    setInicioCal(''); setFimCal(''); setTipoCal(''); setVersaoCal(''); setResultadoCal('Sucesso'); setObsCal(''); setIdPesqCal(''); setIdQpuCal(''); setIdAmbCal('');
    setTempAmbCal('0.0102'); setPresAmbCal('0.81'); setUmidAmbCal('30.1'); setVibAmbCal('0.03'); setCampoAmbCal('0.11'); setObsAmbCal('Condição nominal');
    setIdSeqCal('');
    setIdCalEditando(null);
  }

  // ================= PREENCHIMENTO PARA EDIÇÃO =================
  const preencherFormulario = (qpu) => {
    setIdEditando(qpu.id_qpu); setNomeQpu(qpu.nome); setFabricanteQpu(qpu.fabricante);
    setModeloQpu(qpu.modelo); setTecnologiaQpu(qpu.tecnologia || '');
    setDataInstalacaoQpu(qpu.data_instalacao ? qpu.data_instalacao.split('T')[0] : '');
    setStatusQpu(qpu.status_operacional); setIdCriostato(qpu.id_criostato || '');
  }

  // ================= HANDLERS DE SALVAMENTO E EXCLUSÃO =================

  // 1. QPUs
  const handleSalvarQpu = async () => {
    if (!nomeQpu || !fabricanteQpu || !modeloQpu || !tecnologiaQpu || !dataInstalacaoQpu || !idCriostato) return alert("Preencha todos os campos!");
    const url = idEditando ? `http://localhost:8000/api/qpus/${idEditando}` : 'http://localhost:8000/api/qpus';
    const metodo = idEditando ? 'PUT' : 'POST';
    try {
      const resposta = await fetch(url, {
        method: metodo, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nomeQpu, fabricante: fabricanteQpu, modelo: modeloQpu, tecnologia: tecnologiaQpu, data_instalacao: dataInstalacaoQpu, status_operacional: statusQpu, id_criostato: idCriostato })
      });
      if (resposta.ok) {
        alert(idEditando ? "QPU atualizada com sucesso!" : "QPU salva com sucesso!"); limparFormulario();
        const dadosAtualizados = await fetch('http://localhost:8000/api/qpus').then(res => res.json()); setListaQpus(dadosAtualizados);
      }
    } catch (erro) { console.error(erro); }
  }
  const handleExcluirQpu = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta QPU?")) return;
    try {
      const resposta = await fetch(`http://localhost:8000/api/qpus/${id}`, { method: 'DELETE' });
      if (resposta.ok) setListaQpus(listaQpus.filter(qpu => qpu.id_qpu !== id));
    } catch (erro) { console.error(erro); }
  }

  // 2. Qubits
  const handleSalvarQubit = async () => {
    if (!indiceQubit || !tipoQubit || !frequenciaRessonancia || !idQpuQubit) return alert("Preencha os campos obrigatórios!");
    const url = idQubitEditando ? `http://localhost:8000/api/qubits/${idQubitEditando}` : 'http://localhost:8000/api/qubits';
    const metodo = idQubitEditando ? 'PUT' : 'POST';
    try {
      const resposta = await fetch(url, {
        method: metodo, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ indice_qubit: Number(indiceQubit), tipo_qubit: tipoQubit, frequencia_ressonancia: Number(frequenciaRessonancia), status_qubit: statusQubit, observacoes: observacoesQubit, id_qpu: Number(idQpuQubit) })
      });
      if (resposta.ok) {
        alert(idQubitEditando ? "Qubit atualizado!" : "Qubit salvo!"); limparFormQubit();
        const dados = await fetch('http://localhost:8000/api/qubits').then(res => res.json()); setListaQubits(dados);
      }
    } catch (err) { console.error(err); }
  }
  const handleExcluirQubit = async (id) => {
    if (!window.confirm("Deseja excluir este Qubit?")) return;
    try {
      const resposta = await fetch(`http://localhost:8000/api/qubits/${id}`, { method: 'DELETE' });
      if (resposta.ok) setListaQubits(listaQubits.filter(q => q.id_qubit !== id));
    } catch (err) { console.error(err); }
  }

  // 3. Criostatos
  const handleSalvarCriostato = async () => {
    if (!nomeCrio || !fabricanteCrio || !modeloCrio || !tempCrio) return alert("Preencha todos os campos!");
    const url = idCrioEditando ? `http://localhost:8000/api/criostatos/${idCrioEditando}` : 'http://localhost:8000/api/criostatos';
    const metodo = idCrioEditando ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method: metodo, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nomeCrio, fabricante: fabricanteCrio, modelo: modeloCrio, temperatura_nominal: Number(tempCrio), status_operacional: statusCrio })
      });
      if (res.ok) {
        alert("Criostato salvo com sucesso!"); limparFormCriostato();
        fetch('http://localhost:8000/api/criostatos').then(r => r.json()).then(d => setListaCriostatos(d));
      }
    } catch (err) { console.error(err); }
  }
  const handleExcluirCriostato = async (id) => {
    if (!window.confirm("Deseja excluir este criostato?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/criostatos/${id}`, { method: 'DELETE' });
      if (res.ok) setListaCriostatos(listaCriostatos.filter(c => c.id_criostato !== id));
    } catch (err) { console.error(err); }
  }

  // 4. Pesquisadores
  const handleSalvarPesquisador = async () => {
    if (!nomePesq || !emailPesq || !instituicaoPesq) return alert("Preencha os campos obrigatórios!");
    const url = idPesqEditando ? `http://localhost:8000/api/pesquisadores/${idPesqEditando}` : 'http://localhost:8000/api/pesquisadores';
    const metodo = idPesqEditando ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method: metodo, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nomePesq, email: emailPesq, instituicao: instituicaoPesq, area_atuacao: areaPesq })
      });
      if (res.ok) {
        alert("Pesquisador salvo com sucesso!"); limparFormPesquisador();
        fetch('http://localhost:8000/api/pesquisadores').then(r => r.json()).then(d => setListaPesquisadores(d));
      }
    } catch (err) { console.error(err); }
  }
  const handleExcluirPesquisador = async (id) => {
    if (!window.confirm("Deseja excluir este pesquisador?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/pesquisadores/${id}`, { method: 'DELETE' });
      if (res.ok) setListaPesquisadores(listaPesquisadores.filter(p => p.id_pesquisador !== id));
    } catch (err) { console.error(err); }
  }

  // 5. Experimentos
  const handleSalvarExperimento = async () => {
    if (!nomeExp || !objetivoExp) return alert("Nome e Objetivo são obrigatórios!");
    const url = idExpEditando ? `http://localhost:8000/api/experimentos/${idExpEditando}` : 'http://localhost:8000/api/experimentos';
    const metodo = idExpEditando ? 'PUT' : 'POST';
    try {
      let finalIdAmb = idAmbExp;
      if (idAmbExp === 'novo') {
        const ambRes = await fetch('http://localhost:8000/api/registro-ambiente', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            temperatura: Number(tempAmbExp),
            pressao: Number(presAmbExp),
            umidade: Number(umidAmbExp),
            vibracao: Number(vibAmbExp),
            campo_magnetico: Number(campoAmbExp),
            observacoes: obsAmbExp
          })
        });
        if (ambRes.ok) {
          const ambData = await ambRes.json();
          finalIdAmb = ambData.id_registro_ambiente;
        } else {
          return alert("Erro ao criar novo registro de ambiente!");
        }
      }

      const res = await fetch(url, {
        method: metodo, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nomeExp,
          objetivo: objetivoExp,
          data_hora_inicio: inicioExp || null,
          data_hora_fim: fimExp || null,
          status_execucao: statusExp,
          observacoes: obsExp,
          id_pesquisador: idPesqExp || null,
          id_qpu: idQpuExp || null,
          id_registro_ambiente: finalIdAmb ? Number(finalIdAmb) : null,
          id_sequencia: idSeqExp ? Number(idSeqExp) : null
        })
      });
      if (res.ok) {
        alert("Experimento salvo com sucesso!");
        limparFormExperimento();
        fetch('http://localhost:8000/api/experimentos').then(r => r.json()).then(d => setListaExperimentos(d));
        fetch('http://localhost:8000/api/registro-ambiente').then(r => r.json()).then(d => setListaAmbientes(d));
      }
    } catch (err) { console.error(err); }
  }
  const handleExcluirExperimento = async (id) => {
    if (!window.confirm("Deseja excluir este experimento?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/experimentos/${id}`, { method: 'DELETE' });
      if (res.ok) setListaExperimentos(listaExperimentos.filter(e => e.id_experimento !== id));
    } catch (err) { console.error(err); }
  }

  // 6. Calibrações
  const handleSalvarCalibracao = async () => {
    if (!tipoCal || !versaoCal) return alert("Tipo e Versão são obrigatórios!");
    const url = idCalEditando ? `http://localhost:8000/api/calibracoes/${idCalEditando}` : 'http://localhost:8000/api/calibracoes';
    const metodo = idCalEditando ? 'PUT' : 'POST';
    try {
      let finalIdAmb = idAmbCal;
      if (idAmbCal === 'novo') {
        const ambRes = await fetch('http://localhost:8000/api/registro-ambiente', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            temperatura: Number(tempAmbCal),
            pressao: Number(presAmbCal),
            umidade: Number(umidAmbCal),
            vibracao: Number(vibAmbCal),
            campo_magnetico: Number(campoAmbCal),
            observacoes: obsAmbCal
          })
        });
        if (ambRes.ok) {
          const ambData = await ambRes.json();
          finalIdAmb = ambData.id_registro_ambiente;
        } else {
          return alert("Erro ao criar novo registro de ambiente!");
        }
      }

      const res = await fetch(url, {
        method: metodo, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data_hora_inicio: inicioCal || null,
          data_hora_fim: fimCal || null,
          tipo_calibracao: tipoCal,
          versao_parametros: versaoCal,
          resultado: resultadoCal,
          observacoes: obsCal,
          id_pesquisador: idPesqCal || null,
          id_qpu: idQpuCal || null,
          id_registro_ambiente: finalIdAmb ? Number(finalIdAmb) : null,
          id_sequencia: idSeqCal ? Number(idSeqCal) : null
        })
      });
      if (res.ok) {
        alert("Calibração salva com sucesso!");
        limparFormCalibracao();
        fetch('http://localhost:8000/api/calibracoes').then(r => r.json()).then(d => setListaCalibracoes(d));
        fetch('http://localhost:8000/api/registro-ambiente').then(r => r.json()).then(d => setListaAmbientes(d));
      }
    } catch (err) { console.error(err); }
  }
  const handleExcluirCalibracao = async (id) => {
    if (!window.confirm("Deseja excluir esta calibração?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/calibracoes/${id}`, { method: 'DELETE' });
      if (res.ok) setListaCalibracoes(listaCalibracoes.filter(c => c.id_calibracao !== id));
    } catch (err) { console.error(err); }
  }

  const handleVerDetalhesExperimento = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/api/experimentos/${id}/detalhes`);
      if (res.ok) {
        const data = await res.json();
        setDetalhesDados({ type: 'experimento', ...data });
        setDetalhesModalOpen(true);
      } else {
        alert("Erro ao buscar detalhes do experimento");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao conectar no servidor para buscar detalhes");
    }
  }

  const handleVerDetalhesCalibracao = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/api/calibracoes/${id}/detalhes`);
      if (res.ok) {
        const data = await res.json();
        setDetalhesDados({ type: 'calibracao', ...data });
        setDetalhesModalOpen(true);
      } else {
        alert("Erro ao buscar detalhes da calibração");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao conectar no servidor para buscar detalhes");
    }
  }

  // ============== REQUISITOS DE BUSCA (EFFECTS) ==============
  useEffect(() => {
    fetch('http://localhost:8000/api/qpus')
      .then(res => res.json())
      .then(dados => { setListaQpus(dados); if (dados.length > 0) setQpuSelecionada(dados[0].id_qpu); })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (telaAtual === 'dashboard' && qpuSelecionada) {
      fetch(`http://localhost:8000/api/dashboard/qubits/${qpuSelecionada}`).then(res => res.json()).then(dados => setDadosDashQubits(dados));
    }
    if (telaAtual === 'relatorios') {
      fetch('http://localhost:8000/api/relatorios/t1').then(res => res.json()).then(dados => setDadosT1(dados));
      fetch('http://localhost:8000/api/relatorios/fidelidade').then(res => res.json()).then(dados => setDadosFidelidade(dados));
      fetch('http://localhost:8000/api/relatorios/temperatura').then(res => res.json()).then(dados => setDadosTemperatura(dados));
    }
    if (telaAtual === 'qpus') fetch('http://localhost:8000/api/qpus').then(res => res.json()).then(dados => setListaQpus(dados));
    if (telaAtual === 'criostatos') fetch('http://localhost:8000/api/criostatos').then(res => res.json()).then(dados => setListaCriostatos(dados));
    if (telaAtual === 'pesquisadores') fetch('http://localhost:8000/api/pesquisadores').then(res => res.json()).then(dados => setListaPesquisadores(dados));
    if (telaAtual === 'qubits') {
      fetch('http://localhost:8000/api/qubits').then(res => res.json()).then(dados => setListaQubits(dados));
      fetch('http://localhost:8000/api/qpus').then(res => res.json()).then(dados => setListaQpus(dados));
    }
    if (telaAtual === 'experimentos' || telaAtual === 'calibracoes') {
      fetch('http://localhost:8000/api/qpus').then(res => res.json()).then(dados => setListaQpus(dados));
      fetch('http://localhost:8000/api/pesquisadores').then(res => res.json()).then(dados => setListaPesquisadores(dados));
      fetch('http://localhost:8000/api/registro-ambiente').then(res => res.json()).then(dados => setListaAmbientes(dados));
      fetch('http://localhost:8000/api/sequencias-pulso').then(res => res.json()).then(dados => setListaSequencias(dados));
      if (telaAtual === 'experimentos') fetch('http://localhost:8000/api/experimentos').then(res => res.json()).then(dados => setListaExperimentos(dados));
      if (telaAtual === 'calibracoes') fetch('http://localhost:8000/api/calibracoes').then(res => res.json()).then(dados => setListaCalibracoes(dados));
    }
  }, [telaAtual, qpuSelecionada]);

  const encontrarMetrica = (nome) => {
    const metrica = dadosDashQubits.metricas.find(m => m.nome_metrica === nome);
    return metrica ? Number(metrica.media) : null;
  };

  return (
    <div className="layout">
      <Sidebar telaAtual={telaAtual} setTelaAtual={setTelaAtual} />

      <main className="main">
        {/* ================= TELA: DASHBOARD ================= */}
        {telaAtual === 'dashboard' && (
          <>
            <div className="topbar">
              <div>
                <h1>Dashboard</h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Visão geral do estado da QPU e dos qubits</p>
              </div>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <select value={qpuSelecionada} onChange={(e) => setQpuSelecionada(e.target.value)} style={{ padding: '8px 12px', background: 'var(--bg-panel)', color: 'white', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  {listaQpus.map(qpu => <option key={qpu.id_qpu} value={qpu.id_qpu}>QPU: {qpu.nome} ({qpu.modelo})</option>)}
                </select>
                <div style={{ padding: '8px 12px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)' }}>01/05/2026 - 08/05/2026</div>
              </div>
            </div>

            <div className="cards">
              <MetricCard title="Qubits Ativos" value={`${dadosDashQubits.mapa.filter(q => q.status_operacional !== 'Inativo').length} / ${dadosDashQubits.mapa.length || 0}`} />
              <MetricCard title="Fidelidade Média (1Q)" value={dadosDashQubits.fidelidades?.find(f => f.numero_qubits_alvo === 1) ? `${(Number(dadosDashQubits.fidelidades.find(f => f.numero_qubits_alvo === 1).media) * 100).toFixed(2)}%` : '---'} />
              <MetricCard title="Fidelidade Média (2Q)" value={dadosDashQubits.fidelidades?.find(f => f.numero_qubits_alvo === 2) ? `${(Number(dadosDashQubits.fidelidades.find(f => f.numero_qubits_alvo === 2).media) * 100).toFixed(2)}%` : '---'} />
              <MetricCard title="Tempo de Coerência T1 (médio)" value={encontrarMetrica('T1') ? `${encontrarMetrica('T1').toFixed(1)} μs` : '---'} />
              <MetricCard title="Taxa de Erro de Leitura" value={encontrarMetrica('TaxaErro') ? `${(encontrarMetrica('TaxaErro') * 100).toFixed(2)}%` : '---'} />
            </div>

            <div className="middle">
              <div className="panel"><h3>Mapa de Qubits</h3><Heatmap qubits={dadosDashQubits.mapa} /></div>
              <div className="panel"><h3>Fidelidade de Portas</h3><div style={{ height: '200px' }}><FidelityChart historico={dadosDashQubits.historicoFidelidade} /></div></div>
              <div className="panel"><h3>Distribuição de T1</h3><div style={{ height: '200px' }}><ReadoutChart distribuicao={dadosDashQubits.distribuicaoT1} /></div></div>
            </div>

            <div className="bottom" style={{ gridTemplateColumns: '1fr' }}>
              <div className="panel" style={{ overflowX: 'auto' }}><h3 style={{ marginBottom: '15px' }}>Experimentos Recentes</h3><ExperimentTable experimentos={dadosDashQubits.experimentos} onVerDetalhes={handleVerDetalhesExperimento} /></div>
            </div>
          </>
        )}

        {/* ================= TELA: RELATÓRIOS ACADÊMICOS ================= */}
        {telaAtual === 'relatorios' && (
          <div style={{ padding: '20px', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div>
              <h1 style={{ color: 'var(--text-main)' }}>Consultas Acadêmicas</h1>
              <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Resultados estruturados e representações gráficas das consultas do Item 6.</p>
            </div>

            {/* CONSULTA 1 */}
            <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h2 style={{ color: 'var(--text-main)' }}>Consulta 1: Evolução Diária do Tempo de Coerência (T1)</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                    <strong style={{ color: 'var(--text-main)' }}>Objetivo:</strong> Monitorar a degradação física do hardware comparando o T1 médio por processador e mapeando o qubit mais instável do dia. Envolve as tabelas <em>MedeQubit</em>, <em>Qubit</em> e <em>QPU</em>.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Filtrar Hardware:</span>
                  <select 
                    value={qpuFiltrada} 
                    onChange={(e) => setQpuFiltrada(e.target.value)}
                    style={{ padding: '6px 12px', background: 'var(--bg-main)', color: 'white', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                  >
                    <option value="todas">Visualizar Todas (Comparativo)</option>
                    {[...new Set(dadosT1.map(d => d.qpu_nome))].map(nome => (
                      <option key={nome} value={nome}>{nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '10px' }}>
                <div style={{ flex: '1 1 45%', height: '280px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-panel)', zIndex: 1 }}>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <th style={{ padding: '10px' }}>Data</th>
                        <th style={{ padding: '10px' }}>QPU</th>
                        <th style={{ padding: '10px' }}>Média T1</th>
                        <th style={{ padding: '10px', color: '#f87171' }}>Qubit Crítico (Pior T1)</th>
                      </tr>
                    </thead>
                    <tbody style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      {dadosT1
                        .filter(row => qpuFiltrada === 'todas' || row.qpu_nome === qpuFiltrada)
                        .map((row, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '10px' }}>{new Date(row.data).toLocaleDateString('pt-BR')}</td>
                            <td style={{ padding: '10px', fontWeight: 'bold' }}>{row.qpu_nome}</td>
                            <td style={{ padding: '10px' }}>{Number(row.media_t1).toFixed(1)} μs</td>
                            <td style={{ padding: '10px', color: '#f87171' }}>
                              ID #{row.pior_qubit_id} ({Number(row.pior_valor_t1).toFixed(1)} μs)
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ flex: '1 1 50%', height: '280px', background: 'var(--bg-main)', padding: '15px 10px 5px 10px', borderRadius: '8px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={
                        qpuFiltrada !== 'todas' 
                          ? dadosT1.filter(d => d.qpu_nome === qpuFiltrada)
                          : Object.values(dadosT1.reduce((acc, item) => {
                              const dataStr = item.data;
                              if (!acc[dataStr]) acc[dataStr] = { data: dataStr };
                              acc[dataStr][item.qpu_nome] = Number(item.media_t1).toFixed(2);
                              return acc;
                            }, {}))
                      }
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.2} />
                      <XAxis dataKey="data" stroke="var(--text-muted)" minTickGap={60} tickFormatter={(tick) => new Date(tick).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} />
                      <YAxis stroke="var(--text-muted)" domain={['dataMin - 5', 'dataMax + 5']} />
                      <Tooltip labelFormatter={(label) => new Date(label).toLocaleDateString('pt-BR')} />
                      <Legend />
                      {qpuFiltrada === 'todas' ? (
                        [...new Set(dadosT1.map(d => d.qpu_nome))].map((nome, idx) => (
                          <Line key={nome} type="monotone" dataKey={nome} name={nome} stroke={idx % 2 === 0 ? "var(--accent-purple)" : "#38bdf8"} strokeWidth={2} dot={false} />
                        ))
                      ) : (
                        <Line type="monotone" dataKey="media_t1" name={`Média T1 (${qpuFiltrada})`} stroke="var(--accent-purple)" strokeWidth={2} dot={false} />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <details style={{ marginTop: '15px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: 'var(--text-main)', fontSize: '0.85rem' }}>
                  💻 Visualizar Consulta SQL
                </summary>
                <div style={{ marginTop: '12px' }}>
                  <pre style={{ color: '#c084fc', fontSize: '0.75rem', whiteSpace: 'pre-wrap', background: '#0f172a', padding: '10px', borderRadius: '6px', fontFamily: 'monospace', border: '1px solid #1e293b', margin: 0 }}>
{`WITH diario_qpu AS (
  SELECT p.id_qpu, p.nome as qpu_nome, DATE(mq.data_hora_medicao) as data, AVG(mq.valor) as media_t1
  FROM MedeQubit mq JOIN Qubit q ON mq.id_qubit = q.id_qubit JOIN QPU p ON q.id_qpu = p.id_qpu
  WHERE mq.nome_metrica = 'T1' GROUP BY p.id_qpu, p.nome, DATE(mq.data_hora_medicao)
),
ranqueamento_piores AS (
  SELECT q.id_qpu, DATE(mq.data_hora_medicao) as data, mq.id_qubit as pior_qubit_id, mq.valor as pior_valor_t1,
  ROW_NUMBER() OVER(PARTITION BY q.id_qpu, DATE(mq.data_hora_medicao) ORDER BY mq.valor ASC) as rn
  FROM MedeQubit mq JOIN Qubit q ON mq.id_qubit = q.id_qubit WHERE mq.nome_metrica = 'T1'
)
SELECT d.qpu_nome, d.data, d.media_t1, r.pior_qubit_id, r.pior_valor_t1
FROM diario_qpu d LEFT JOIN ranqueamento_piores r ON d.id_qpu = r.id_qpu AND d.data = r.data AND r.rn = 1
ORDER BY d.data ASC, d.qpu_nome ASC;`}
                  </pre>
                </div>
              </details>
            </div>

            {/* CONSULTA 2 */}
            <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h2 style={{ color: 'var(--text-main)' }}>Consulta 2: Fidelidade Média por Porta Quântica</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                    <strong style={{ color: 'var(--text-main)' }}>Objetivo:</strong> Calcular a média geral de fidelidade por operation física para avaliar se as portas de acoplamento mais complexas (2 Qubits) estão sofrendo taxas de erro maiores. Envolve as tabelas <em>MedePorta</em>, <em>PortaQuantica</em> e <em>Experimento</em>.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', background: 'var(--bg-main)', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#38bdf8', borderRadius: '3px' }}></span>
                    <span style={{ color: 'var(--text-main)' }}>2 Qubits</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ display: 'inline-block', width: '12px', height: '12px', background: 'var(--accent-purple)', borderRadius: '3px' }}></span>
                    <span style={{ color: 'var(--text-main)' }}>1 Qubit</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '10px' }}>
                <div style={{ flex: '1 1 40%', height: '250px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-panel)', zIndex: 1 }}>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '10px' }}>Porta</th>
                        <th style={{ padding: '10px' }}>Categoria</th>
                        <th style={{ padding: '10px' }}>Fidelidade Média</th>
                      </tr>
                    </thead>
                    <tbody style={{ color: 'var(--text-main)' }}>
                      {dadosFidelidade.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '10px', fontWeight: 'bold' }}>{row.nome_porta}</td>
                          <td style={{ padding: '10px' }}>{row.categoria}</td>
                          <td style={{ padding: '10px' }}>{(Number(row.fidelidade_media) * 100).toFixed(3)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ flex: '1 1 50%', height: '250px', background: 'var(--bg-main)', padding: '15px 10px 5px 10px', borderRadius: '8px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosFidelidade}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.2} />
                      <XAxis dataKey="nome_porta" stroke="var(--text-muted)" interval={0} style={{ fontSize: '0.75rem' }} />
                      <YAxis stroke="var(--text-muted)" domain={[0.9, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                      <Tooltip formatter={(value) => `${(Number(value) * 100).toFixed(3)}%`} />
                      <Legend />
                      <Bar dataKey="fidelidade_media" name="Fidelidade da Operação" radius={[4, 4, 0, 0]}>
                        {dadosFidelidade.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.categoria.includes('1') ? 'var(--accent-purple)' : '#38bdf8'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <details style={{ marginTop: '15px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: 'var(--text-main)', fontSize: '0.85rem' }}>
                  💻 Visualizar Consulta SQL
                </summary>
                <div style={{ marginTop: '12px' }}>
                  <pre style={{ color: '#c084fc', fontSize: '0.75rem', whiteSpace: 'pre-wrap', background: '#0f172a', padding: '10px', borderRadius: '6px', fontFamily: 'monospace', border: '1px solid #1e293b', margin: 0 }}>
{`SELECT pq.nome_porta, pq.numero_qubits_alvo || ' Qubit(s)' as categoria, AVG(mp.valor) as fidelidade_media
FROM MedePorta mp JOIN PortaQuantica pq ON mp.id_porta = pq.id_porta JOIN Experimento e ON mp.id_experimento = e.id_experimento
WHERE mp.nome_metrica = 'Fidelidade' GROUP BY pq.nome_porta, pq.numero_qubits_alvo ORDER BY categoria DESC, fidelidade_media DESC;`}
                  </pre>
                </div>
              </details>
            </div>

            {/* CONSULTA 3 */}
            <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h2 style={{ color: 'var(--text-main)' }}>Consulta 3: Impacto da Temperatura do Criostato na Taxa de Erro</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <strong style={{ color: 'var(--text-main)' }}>Objetivo:</strong> Avaliar se flutuações na temperatura do ambiente criogênico estão correlacionadas com o aumento da taxa média de erro de leitura dos qubits. Envolve as tabelas <em>RegistroAmbiente</em>, <em>Experimento</em> e <em>MedeQubit</em>.
              </p>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '10px' }}>
                <div style={{ flex: '1 1 40%', height: '250px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-panel)', zIndex: 1 }}>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '10px' }}>Temperatura</th>
                        <th style={{ padding: '10px' }}>Taxa de Erro Média</th>
                      </tr>
                    </thead>
                    <tbody style={{ color: 'var(--text-main)' }}>
                      {dadosTemperatura.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '10px' }}>{row.temperatura} K</td>
                          <td style={{ padding: '10px' }}>{(Number(row.taxa_erro_media) * 100).toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ flex: '1 1 50%', height: '250px', background: 'var(--bg-main)', padding: '15px 10px 5px 10px', borderRadius: '8px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosTemperatura}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.2} />
                      <XAxis dataKey="temperatura" stroke="var(--text-muted)" unit="K" />
                      <YAxis stroke="var(--text-muted)'" />
                      <Tooltip formatter={(value) => `${(Number(value) * 100).toFixed(2)}%`} />
                      <Legend />
                      <Bar dataKey="taxa_erro_media" name="Taxa de Erro Leitura" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <details style={{ marginTop: '15px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: 'var(--text-main)', fontSize: '0.85rem' }}>
                  💻 Visualizar Consulta SQL
                </summary>
                <div style={{ marginTop: '12px' }}>
                  <pre style={{ color: '#c084fc', fontSize: '0.75rem', whiteSpace: 'pre-wrap', background: '#0f172a', padding: '10px', borderRadius: '6px', fontFamily: 'monospace', border: '1px solid #1e293b', margin: 0 }}>
{`SELECT ra.temperatura, AVG(mq.valor) as taxa_erro_media
FROM RegistroAmbiente ra JOIN Experimento e ON ra.id_registro_ambiente = e.id_registro_ambiente JOIN MedeQubit mq ON e.id_experimento = mq.id_experimento
WHERE mq.nome_metrica = 'TaxaErro' GROUP BY ra.temperatura ORDER BY ra.temperatura;`}
                  </pre>
                </div>
              </details>
            </div>
          </div>
        )}


        {/* ================= TELA: CRUD DE QPUs ================= */}
        {telaAtual === 'qpus' && (
          <div style={{ padding: '20px', color: 'var(--text-main)' }}>
            <h2>Gerenciamento de QPUs</h2>
            <div className="panel" style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <h3>{idEditando ? `Editando QPU #${idEditando}` : 'Cadastrar Nova QPU'}</h3>
                {idEditando && <button onClick={limparFormulario} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', textDecoration: 'underline' }}>Cancelar Edição</button>}
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input value={nomeQpu} onChange={(e) => setNomeQpu(e.target.value)} type="text" placeholder="Nome (ex: QPU-01)" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }} />
                <input value={fabricanteQpu} onChange={(e) => setFabricanteQpu(e.target.value)} type="text" placeholder="Fabricante" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }} />
                <input value={modeloQpu} onChange={(e) => setModeloQpu(e.target.value)} type="text" placeholder="Modelo" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }} />
                <input value={tecnologiaQpu} onChange={(e) => setTecnologiaQpu(e.target.value)} type="text" placeholder="Tecnologia" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }} />
                <input value={dataInstalacaoQpu} onChange={(e) => setDataInstalacaoQpu(e.target.value)} type="date" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }} />
                <input value={idCriostato} onChange={(e) => setIdCriostato(e.target.value)} type="number" placeholder="ID do Criostato" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }} />
                <select value={statusQpu} onChange={(e) => setStatusQpu(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }}>
                  <option value="Ativo">Ativo</option><option value="Manutenção">Manutenção</option><option value="Inativo">Inativo</option>
                </select>
                <button onClick={handleSalvarQpu} style={{ width: '100%', padding: '10px', background: idEditando ? '#eab308' : 'var(--accent-purple)', color: idEditando ? 'black' : 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>{idEditando ? 'Atualizar QPU' : 'Salvar QPU'}</button>
              </div>
            </div>
            <div className="panel" style={{ marginTop: '20px', overflowX: 'auto' }}>
              <h3 style={{ marginBottom: '15px' }}>QPUs Cadastradas</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead><tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}><th>ID</th><th>Nome</th><th>Fabricante/Modelo</th><th>Tecnologia</th><th>Instalação</th><th>Criostato</th><th>Status</th><th>Ações</th></tr></thead>
                <tbody>
                  {listaQpus.map(qpu => (
                    <tr key={qpu.id_qpu} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px' }}>{qpu.id_qpu}</td><td style={{ padding: '12px' }}>{qpu.nome}</td><td style={{ padding: '12px' }}>{qpu.fabricante} {qpu.modelo}</td><td style={{ padding: '12px' }}>{qpu.tecnologia}</td><td style={{ padding: '12px' }}>{qpu.data_instalacao ? new Date(qpu.data_instalacao).toLocaleDateString('pt-BR') : ''}</td><td style={{ padding: '12px' }}>{qpu.id_criostato}</td><td style={{ padding: '12px' }}>{qpu.status_operacional}</td>
                      <td>
                        <button onClick={() => preencherFormulario(qpu)} style={{ marginRight: '8px', background: 'transparent', border: '1px solid #eab308', color: '#eab308', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Editar</button>
                        <button onClick={() => handleExcluirQpu(qpu.id_qpu)} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TELA: CRUD DE QUBITS ================= */}
        {telaAtual === 'qubits' && (
          <div style={{ padding: '20px', color: 'var(--text-main)' }}>
            <h2>Gerenciamento de Qubits</h2>
            <div className="panel" style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3>{idQubitEditando ? `Editando Qubit #${idQubitEditando}` : 'Cadastrar Novo Qubit'}</h3>
                {idQubitEditando && <button onClick={limparFormQubit} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', textDecoration: 'underline' }}>Cancelar</button>}
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input value={indiceQubit} onChange={(e) => setIndiceQubit(e.target.value)} type="number" placeholder="Índice do Qubit" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 20%' }} />
                <input value={tipoQubit} onChange={(e) => setTipoQubit(e.target.value)} type="text" placeholder="Tipo (ex: Transmon)" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 25%' }} />
                <input value={frequenciaRessonancia} onChange={(e) => setFrequenciaRessonancia(e.target.value)} type="number" step="0.01" placeholder="Frequência (GHz)" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 20%' }} />
                <select value={idQpuQubit} onChange={(e) => setIdQpuQubit(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 25%' }}>
                  <option value="">Selecionar QPU Alvo</option>
                  {listaQpus.map(p => <option key={p.id_qpu} value={p.id_qpu}>{p.nome}</option>)}
                </select>
                <select value={statusQubit} onChange={(e) => setStatusQubit(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 20%' }}>
                  <option value="Ativo">Ativo</option><option value="Atenção">Atenção</option><option value="Inativo">Inativo</option>
                </select>
                <input value={observacoesQubit} onChange={(e) => setObservacoesQubit(e.target.value)} type="text" placeholder="Observações" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 70%' }} />
                <button onClick={handleSalvarQubit} style={{ width: '100%', padding: '10px', background: idQubitEditando ? '#eab308' : 'var(--accent-purple)', color: idQubitEditando ? 'black' : 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>{idQubitEditando ? 'Atualizar Qubit' : 'Salvar Qubit'}</button>
              </div>
            </div>
            <div className="panel" style={{ marginTop: '20px', overflowX: 'auto' }}>
              <h3>Qubits Cadastrados</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead><tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}><th>ID</th><th>Índice</th><th>Hardware (QPU)</th><th>Tipo</th><th>Frequência</th><th>Status</th><th>Ações</th></tr></thead>
                <tbody>
                  {listaQubits.map(q => (
                    <tr key={q.id_qubit} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px' }}>{q.id_qubit}</td><td style={{ padding: '12px', fontWeight: 'bold' }}>q{q.indice_qubit}</td><td style={{ padding: '12px' }}>{q.qpu_nome}</td><td style={{ padding: '12px' }}>{q.tipo_qubit}</td><td style={{ padding: '12px' }}>{Number(q.frequencia_ressonancia).toFixed(2)} GHz</td><td style={{ padding: '12px' }}>{q.status_qubit}</td>
                      <td>
                        <button onClick={() => { setIdQubitEditando(q.id_qubit); setIndiceQubit(q.indice_qubit); setTipoQubit(q.tipo_qubit); setFrequenciaRessonancia(q.frequencia_ressonancia); setStatusQubit(q.status_qubit); setObservacoesQubit(q.observacoes || ''); setIdQpuQubit(q.id_qpu); }} style={{ marginRight: '8px', background: 'transparent', border: '1px solid #eab308', color: '#eab308', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Editar</button>
                        <button onClick={() => handleExcluirQubit(q.id_qubit)} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TELA: CRUD DE CRIOSTATOS ================= */}
        {telaAtual === 'criostatos' && (
          <div style={{ padding: '20px', color: 'var(--text-main)' }}>
            <h2>Gerenciamento de Criostatos</h2>
            <div className="panel" style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3>{idCrioEditando ? `Editando Criostato #${idCrioEditando}` : 'Cadastrar Novo Criostato'}</h3>
                {idCrioEditando && <button onClick={limparFormCriostato} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', textDecoration: 'underline' }}>Cancelar</button>}
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input value={nomeCrio} onChange={(e) => setNomeCrio(e.target.value)} type="text" placeholder="Nome identificador" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }} />
                <input value={fabricanteCrio} onChange={(e) => setFabricanteCrio(e.target.value)} type="text" placeholder="Fabricante" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }} />
                <input value={modeloCrio} onChange={(e) => setModeloCrio(e.target.value)} type="text" placeholder="Modelo" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }} />
                <input value={tempCrio} onChange={(e) => setTempCrio(e.target.value)} type="number" step="0.001" placeholder="Temp. Nominal (K)" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 45%' }} />
                <select value={statusCrio} onChange={(e) => setStatusCrio(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 45%' }}>
                  <option value="Ativo">Ativo</option><option value="Manutenção">Manutenção</option><option value="Inativo">Inativo</option>
                </select>
                <button onClick={handleSalvarCriostato} style={{ width: '100%', padding: '10px', background: idCrioEditando ? '#eab308' : 'var(--accent-purple)', color: idCrioEditando ? 'black' : 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>{idCrioEditando ? 'Atualizar Criostato' : 'Salvar Criostato'}</button>
              </div>
            </div>
            <div className="panel" style={{ marginTop: '20px', overflowX: 'auto' }}>
              <h3>Criostatos Cadastrados</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '15px' }}>
                <thead><tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}><th>ID</th><th>Nome</th><th>Fabricante/Modelo</th><th>Temp. Nominal</th><th>Status</th><th>Ações</th></tr></thead>
                <tbody>
                  {listaCriostatos.map(c => (
                    <tr key={c.id_criostato} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px' }}>{c.id_criostato}</td><td style={{ padding: '12px', fontWeight: 'bold' }}>{c.nome}</td><td style={{ padding: '12px' }}>{c.fabricante} {c.modelo}</td><td style={{ padding: '12px' }}>{Number(c.temperatura_nominal).toFixed(3)} K</td><td style={{ padding: '12px' }}>{c.status_operacional}</td>
                      <td>
                        <button onClick={() => { setIdCrioEditando(c.id_criostato); setNomeCrio(c.nome); setFabricanteCrio(c.fabricante); setModeloCrio(c.modelo); setTempCrio(c.temperatura_nominal); setStatusCrio(c.status_operacional); }} style={{ marginRight: '8px', background: 'transparent', border: '1px solid #eab308', color: '#eab308', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Editar</button>
                        <button onClick={() => handleExcluirCriostato(c.id_criostato)} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TELA: CRUD DE PESQUISADORES ================= */}
        {telaAtual === 'pesquisadores' && (
          <div style={{ padding: '20px', color: 'var(--text-main)' }}>
            <h2>Corpo de Pesquisadores</h2>
            <div className="panel" style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3>{idPesqEditando ? `Editando Cadastro #${idPesqEditando}` : 'Cadastrar Novo Pesquisador'}</h3>
                {idPesqEditando && <button onClick={limparFormPesquisador} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', textDecoration: 'underline' }}>Cancelar</button>}
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input value={nomePesq} onChange={(e) => setNomePesq(e.target.value)} type="text" placeholder="Nome Completo" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 45%' }} />
                <input value={emailPesq} onChange={(e) => setEmailPesq(e.target.value)} type="email" placeholder="E-mail" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 45%' }} />
                <input value={instituicaoPesq} onChange={(e) => setInstituicaoPesq(e.target.value)} type="text" placeholder="Instituição" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 45%' }} />
                <input value={areaPesq} onChange={(e) => setAreaPesq(e.target.value)} type="text" placeholder="Área de Atuação" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 45%' }} />
                <button onClick={handleSalvarPesquisador} style={{ width: '100%', padding: '10px', background: idPesqEditando ? '#eab308' : 'var(--accent-purple)', color: idPesqEditando ? 'black' : 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>{idPesqEditando ? 'Atualizar Cadastro' : 'Cadastrar Pesquisador'}</button>
              </div>
            </div>
            <div className="panel" style={{ marginTop: '20px', overflowX: 'auto' }}>
              <h3>Pesquisadores Registrados</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '15px' }}>
                <thead><tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}><th>ID</th><th>Nome</th><th>E-mail</th><th>Instituição</th><th>Área</th><th>Ações</th></tr></thead>
                <tbody>
                  {listaPesquisadores.map(p => (
                    <tr key={p.id_pesquisador} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px' }}>{p.id_pesquisador}</td><td style={{ padding: '12px', fontWeight: 'bold' }}>{p.nome}</td><td style={{ padding: '12px' }}>{p.email}</td><td style={{ padding: '12px' }}>{p.instituicao}</td><td style={{ padding: '12px' }}>{p.area_atuacao}</td>
                      <td>
                        <button onClick={() => { setIdPesqEditando(p.id_pesquisador); setNomePesq(p.nome); setEmailPesq(p.email); setInstituicaoPesq(p.instituicao || ''); setAreaPesq(p.area_atuacao || ''); }} style={{ marginRight: '8px', background: 'transparent', border: '1px solid #eab308', color: '#eab308', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Editar</button>
                        <button onClick={() => handleExcluirPesquisador(p.id_pesquisador)} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TELA: CRUD DE EXPERIMENTOS ================= */}
        {telaAtual === 'experimentos' && (
          <div style={{ padding: '20px', color: 'var(--text-main)' }}>
            <h2>Gerenciamento de Experimentos</h2>
            <div className="panel" style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3>{idExpEditando ? `Editando Experimento #${idExpEditando}` : 'Registrar Novo Experimento'}</h3>
                {idExpEditando && <button onClick={limparFormExperimento} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', textDecoration: 'underline' }}>Cancelar</button>}
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input value={nomeExp} onChange={(e) => setNomeExp(e.target.value)} type="text" placeholder="Nome do Experimento" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 45%' }} />
                <input value={objetivoExp} onChange={(e) => setObjetivoExp(e.target.value)} type="text" placeholder="Objetivo Científico" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 45%' }} />
                <input value={inicioExp} onChange={(e) => setInicioExp(e.target.value)} type="datetime-local" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }} />
                <input value={fimExp} onChange={(e) => setFimExp(e.target.value)} type="datetime-local" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }} />
                <select value={statusExp} onChange={(e) => setStatusExp(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }}>
                  <option value="Planejado">Planejado</option><option value="Concluído">Concluído</option><option value="Falhou">Falhou</option>
                </select>
                <select value={idPesqExp} onChange={(e) => setIdPesqExp(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }}>
                  <option value="">Pesquisador Responsável</option>
                  {listaPesquisadores.map(p => <option key={p.id_pesquisador} value={p.id_pesquisador}>{p.nome}</option>)}
                </select>
                <select value={idQpuExp} onChange={(e) => setIdQpuExp(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }}>
                  <option value="">Processador Alvo (QPU)</option>
                  {listaQpus.map(p => <option key={p.id_qpu} value={p.id_qpu}>{p.nome}</option>)}
                </select>
                <select value={idAmbExp} onChange={(e) => setIdAmbExp(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }}>
                  <option value="">Log de Ambiente Vinculado</option>
                  <option value="novo">+ Criar Novo Registro de Ambiente</option>
                  {listaAmbientes.map(a => <option key={a.id_registro_ambiente} value={a.id_registro_ambiente}>Log #{a.id_registro_ambiente} ({new Date(a.data_hora_registro).toLocaleString('pt-BR')})</option>)}
                </select>
                <select value={idSeqExp} onChange={(e) => setIdSeqExp(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }}>
                  <option value="">Sequência de Pulso Vinculada (Opcional)</option>
                  {listaSequencias.map(s => <option key={s.id_sequencia} value={s.id_sequencia}>{s.nome} ({s.finalidade})</option>)}
                </select>
                {idAmbExp === 'novo' && (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: '100%', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px dashed var(--border-color)', marginTop: '5px', marginBottom: '10px' }}>
                    <h4 style={{ width: '100%', margin: '0 0 5px 0', fontSize: '0.9rem', color: 'var(--accent-purple)' }}>Novas Condições Ambientais (Valores Padrão Preenchidos)</h4>
                    <div style={{ flex: '1 1 15%', display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Temp. (K)</label>
                      <input type="number" step="0.0001" value={tempAmbExp} onChange={(e) => setTempAmbExp(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white' }} />
                    </div>
                    <div style={{ flex: '1 1 15%', display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Pressão (atm)</label>
                      <input type="number" step="0.01" value={presAmbExp} onChange={(e) => setPresAmbExp(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white' }} />
                    </div>
                    <div style={{ flex: '1 1 15%', display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Umidade (%)</label>
                      <input type="number" step="0.1" value={umidAmbExp} onChange={(e) => setUmidAmbExp(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white' }} />
                    </div>
                    <div style={{ flex: '1 1 15%', display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Vibração (mm/s)</label>
                      <input type="number" step="0.01" value={vibAmbExp} onChange={(e) => setVibAmbExp(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white' }} />
                    </div>
                    <div style={{ flex: '1 1 15%', display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Campo Mag. (mT)</label>
                      <input type="number" step="0.01" value={campoAmbExp} onChange={(e) => setCampoAmbExp(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white' }} />
                    </div>
                    <div style={{ flex: '1 1 30%', display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Observações</label>
                      <input type="text" value={obsAmbExp} onChange={(e) => setObsAmbExp(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white' }} />
                    </div>
                  </div>
                )}
                <input value={obsExp} onChange={(e) => setObsExp(e.target.value)} type="text" placeholder="Observações Gerais" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 100%' }} />
                <button onClick={handleSalvarExperimento} style={{ width: '100%', padding: '10px', background: idExpEditando ? '#eab308' : 'var(--accent-purple)', color: idExpEditando ? 'black' : 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>{idExpEditando ? 'Atualizar Experimento' : 'Salvar Experimento'}</button>
              </div>
            </div>
            <div className="panel" style={{ marginTop: '20px', overflowX: 'auto' }}>
              <h3>Experimentos Cadastrados</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '15px' }}>
                <thead><tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}><th>ID</th><th>Nome</th><th>QPU</th><th>Pesquisador</th><th>Status</th><th>Ações</th></tr></thead>
                <tbody>
                  {listaExperimentos.map(e => (
                    <tr key={e.id_experimento} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px' }}>{e.id_experimento}</td><td style={{ padding: '12px', fontWeight: 'bold' }}>{e.nome}</td><td style={{ padding: '12px' }}>{e.qpu_nome}</td><td style={{ padding: '12px' }}>{e.pesquisador_nome}</td><td style={{ padding: '12px' }}>{e.status_execucao}</td>
                      <td>
                        <button onClick={() => handleVerDetalhesExperimento(e.id_experimento)} style={{ marginRight: '8px', background: 'transparent', border: '1px solid var(--accent-purple)', color: 'var(--accent-purple)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Detalhes</button>
                        <button onClick={() => { setIdExpEditando(e.id_experimento); setNomeExp(e.nome); setObjetivoExp(e.objetivo); setStatusExp(e.status_execucao); setObsExp(e.observacoes || ''); setIdPesqExp(e.id_pesquisador || ''); setIdQpuExp(e.id_qpu || ''); setIdAmbExp(e.id_registro_ambiente || ''); setIdSeqExp(e.id_sequencia || ''); }} style={{ marginRight: '8px', background: 'transparent', border: '1px solid #eab308', color: '#eab308', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Editar</button>
                        <button onClick={() => handleExcluirExperimento(e.id_experimento)} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TELA: CRUD DE CALIBRAÇÕES ================= */}
        {telaAtual === 'calibracoes' && (
          <div style={{ padding: '20px', color: 'var(--text-main)' }}>
            <h2>Gerenciamento de Calibrações</h2>
            <div className="panel" style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3>{idCalEditando ? `Editando Calibração #${idCalEditando}` : 'Registrar Nova Calibração'}</h3>
                {idCalEditando && <button onClick={limparFormCalibracao} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', textDecoration: 'underline' }}>Cancelar</button>}
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input value={tipoCal} onChange={(e) => setTipoCal(e.target.value)} type="text" placeholder="Tipo de Calibração (ex: Rabi Oscillation)" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 45%' }} />
                <input value={versaoCal} onChange={(e) => setVersaoCal(e.target.value)} type="text" placeholder="Versão dos Parâmetros" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 45%' }} />
                <input value={inicioCal} onChange={(e) => setInicioCal(e.target.value)} type="datetime-local" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }} />
                <input value={fimCal} onChange={(e) => setFimCal(e.target.value)} type="datetime-local" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }} />
                <select value={resultadoCal} onChange={(e) => setResultadoCal(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }}>
                  <option value="Sucesso">Sucesso</option><option value="Falha">Falha</option>
                </select>
                <select value={idPesqCal} onChange={(e) => setIdPesqCal(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }}>
                  <option value="">Pesquisador Responsável</option>
                  {listaPesquisadores.map(p => <option key={p.id_pesquisador} value={p.id_pesquisador}>{p.nome}</option>)}
                </select>
                <select value={idQpuCal} onChange={(e) => setIdQpuCal(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }}>
                  <option value="">QPU Calibrada</option>
                  {listaQpus.map(p => <option key={p.id_qpu} value={p.id_qpu}>{p.nome}</option>)}
                </select>
                <select value={idAmbCal} onChange={(e) => setIdAmbCal(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }}>
                  <option value="">Log de Ambiente Vinculado</option>
                  <option value="novo">+ Criar Novo Registro de Ambiente</option>
                  {listaAmbientes.map(a => <option key={a.id_registro_ambiente} value={a.id_registro_ambiente}>Log #{a.id_registro_ambiente}</option>)}
                </select>
                <select value={idSeqCal} onChange={(e) => setIdSeqCal(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }}>
                  <option value="">Sequência de Pulso Vinculada (Opcional)</option>
                  {listaSequencias.map(s => <option key={s.id_sequencia} value={s.id_sequencia}>{s.nome} ({s.finalidade})</option>)}
                </select>
                {idAmbCal === 'novo' && (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: '100%', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px dashed var(--border-color)', marginTop: '5px', marginBottom: '10px' }}>
                    <h4 style={{ width: '100%', margin: '0 0 5px 0', fontSize: '0.9rem', color: 'var(--accent-purple)' }}>Novas Condições Ambientais (Valores Padrão Preenchidos)</h4>
                    <div style={{ flex: '1 1 15%', display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Temp. (K)</label>
                      <input type="number" step="0.0001" value={tempAmbCal} onChange={(e) => setTempAmbCal(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white' }} />
                    </div>
                    <div style={{ flex: '1 1 15%', display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Pressão (atm)</label>
                      <input type="number" step="0.01" value={presAmbCal} onChange={(e) => setPresAmbCal(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white' }} />
                    </div>
                    <div style={{ flex: '1 1 15%', display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Umidade (%)</label>
                      <input type="number" step="0.1" value={umidAmbCal} onChange={(e) => setUmidAmbCal(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white' }} />
                    </div>
                    <div style={{ flex: '1 1 15%', display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Vibração (mm/s)</label>
                      <input type="number" step="0.01" value={vibAmbCal} onChange={(e) => setVibAmbCal(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white' }} />
                    </div>
                    <div style={{ flex: '1 1 15%', display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Campo Mag. (mT)</label>
                      <input type="number" step="0.01" value={campoAmbCal} onChange={(e) => setCampoAmbCal(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white' }} />
                    </div>
                    <div style={{ flex: '1 1 30%', display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Observações</label>
                      <input type="text" value={obsAmbCal} onChange={(e) => setObsAmbCal(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white' }} />
                    </div>
                  </div>
                )}
                <input value={obsCal} onChange={(e) => setObsCal(e.target.value)} type="text" placeholder="Observações" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 100%' }} />
                <button onClick={handleSalvarCalibracao} style={{ width: '100%', padding: '10px', background: idCalEditando ? '#eab308' : 'var(--accent-purple)', color: idCalEditando ? 'black' : 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>{idCalEditando ? 'Atualizar Calibração' : 'Salvar Calibração'}</button>
              </div>
            </div>
            <div className="panel" style={{ marginTop: '20px', overflowX: 'auto' }}>
              <h3>Calibrações Cadastradas</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '15px' }}>
                <thead><tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}><th>ID</th><th>Tipo</th><th>QPU</th><th>Versão</th><th>Resultado</th><th>Ações</th></tr></thead>
                <tbody>
                  {listaCalibracoes.map(c => (
                    <tr key={c.id_calibracao} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px' }}>{c.id_calibracao}</td><td style={{ padding: '12px', fontWeight: 'bold' }}>{c.tipo_calibracao}</td><td style={{ padding: '12px' }}>{c.qpu_nome}</td><td style={{ padding: '12px' }}>{c.versao_parametros}</td><td style={{ padding: '12px' }}>{c.resultado}</td>
                      <td>
                        <button onClick={() => handleVerDetalhesCalibracao(c.id_calibracao)} style={{ marginRight: '8px', background: 'transparent', border: '1px solid var(--accent-purple)', color: 'var(--accent-purple)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Detalhes</button>
                        <button onClick={() => { setIdCalEditando(c.id_calibracao); setInicioCal(c.data_hora_inicio || ''); setFimCal(c.data_hora_fim || ''); setTipoCal(c.tipo_calibracao); setVersaoCal(c.versao_parametros); setResultadoCal(c.resultado); setObsCal(c.observacoes || ''); setIdPesqCal(c.id_pesquisador || ''); setIdQpuCal(c.id_qpu || ''); setIdAmbCal(c.id_registro_ambiente || ''); setIdSeqCal(c.id_sequencia || ''); }} style={{ marginRight: '8px', background: 'transparent', border: '1px solid #eab308', color: '#eab308', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Editar</button>
                        <button onClick={() => handleExcluirCalibracao(c.id_calibracao)} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {telaAtual === 'configuracoes' && (
          <div style={{ padding: '20px', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div>
              <h1 style={{ color: 'var(--text-main)' }}>Configurações do Banco de Dados</h1>
              <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                Gerenciamento estrutural do banco de dados (Requisito de Inicialização e Reset).
              </p>
            </div>

            <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
              <div>
                <h3 style={{ color: 'var(--text-main)' }}>🚀 Criar Tabelas e Carregar Dados</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '5px', marginBottom: '15px', lineHeight: '1.4' }}>
                  Cria todas as 10 tabelas do banco de dados (Criostato, QPU, Qubit, Pesquisador, Experimento, etc.) e insere os dados iniciais pré-definidos (incluindo 20 qubits na QPU Triton-20, experimentos e medições de calibração).
                </p>
                <button 
                  onClick={async () => {
                    try {
                      const res = await fetch('http://localhost:8000/api/db/init', { method: 'POST' });
                      const data = await res.json();
                      alert(data.message);
                      // Recarrega todos os dados nos estados locais
                      fetch('http://localhost:8000/api/qpus').then(res => res.json()).then(dados => { setListaQpus(dados); if (dados.length > 0) setQpuSelecionada(dados[0].id_qpu); });
                      fetch('http://localhost:8000/api/criostatos').then(res => res.json()).then(dados => setListaCriostatos(dados));
                      fetch('http://localhost:8000/api/pesquisadores').then(res => res.json()).then(dados => setListaPesquisadores(dados));
                      fetch('http://localhost:8000/api/qubits').then(res => res.json()).then(dados => setListaQubits(dados));
                      fetch('http://localhost:8000/api/experimentos').then(res => res.json()).then(dados => setListaExperimentos(dados));
                      fetch('http://localhost:8000/api/calibracoes').then(res => res.json()).then(dados => setListaCalibracoes(dados));
                    } catch (err) {
                      alert("Erro ao inicializar: " + err.message);
                    }
                  }}
                  style={{ padding: '12px 24px', background: 'var(--accent-purple)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Inicializar e Popular Banco
                </button>
              </div>

              <hr style={{ borderColor: 'var(--border-color)', margin: '10px 0' }} />

              <div>
                <h3 style={{ color: '#ef4444' }}>⚠️ Eliminar Todas as Tabelas (Reset)</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '5px', marginBottom: '15px', lineHeight: '1.4' }}>
                  Remove permanentemente todas as tabelas e dados do banco de dados (DROP TABLE CASCADE). Esta ação não pode ser desfeita!
                </p>
                <button 
                  onClick={async () => {
                    if (!window.confirm("ATENÇÃO: Você tem certeza que deseja APAGAR todas as tabelas do banco de dados? Isso apagará todos os dados definitivamente!")) return;
                    try {
                      const res = await fetch('http://localhost:8000/api/db/drop', { method: 'POST' });
                      const data = await res.json();
                      alert(data.message);
                      // Zera os dados locais no state do react
                      setListaQpus([]);
                      setListaCriostatos([]);
                      setListaPesquisadores([]);
                      setListaQubits([]);
                      setListaExperimentos([]);
                      setListaCalibracoes([]);
                      setQpuSelecionada('');
                      setDadosDashQubits({ 
                        mapa: [], 
                        metricas: [], 
                        fidelidades: [], 
                        historicoFidelidade: [], 
                        historicoErro: [], 
                        experimentos: [],
                        distribuicaoT1: []
                      });
                    } catch (err) {
                      alert("Erro ao eliminar tabelas: " + err.message);
                    }
                  }}
                  style={{ padding: '12px 24px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Eliminar Todas as Tabelas
                </button>
              </div>
            </div>
          </div>
        )}

        {telaAtual === 'copilot' && (
          <Copilot 
            conversations={conversations}
            setConversations={setConversations}
            activeConvId={activeConvId}
            setActiveConvId={setActiveConvId}
          />
        )}

        {telaAtual === 'copilot_history' && (
          <CopilotHistory 
            conversations={conversations}
            setConversations={setConversations}
            activeConvId={activeConvId}
            setActiveConvId={setActiveConvId}
            setTelaAtual={setTelaAtual}
          />
        )}
      </main>

      {/* ================= MODAL: DETALHAR ITEM ================= */}
      {detalhesModalOpen && detalhesDados && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            backgroundColor: '#1b1b2f',
            border: '1px solid #3c3c5c',
            borderRadius: '12px',
            padding: '25px',
            maxWidth: '650px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            color: 'white',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #3c3c5c', paddingBottom: '15px', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--accent-purple)' }}>
                Detalhes {detalhesDados.type === 'experimento' ? 'do Experimento' : 'da Calibração'} #{detalhesDados.type === 'experimento' ? detalhesDados.experimento.id_experimento : detalhesDados.calibracao.id_calibracao}
              </h2>
              <button 
                onClick={() => { setDetalhesModalOpen(false); setDetalhesDados(null); }}
                style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '1.5rem', cursor: 'pointer', fontWeight: 'bold' }}
              >
                &times;
              </button>
            </div>

            {/* Main Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px', backgroundColor: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Nome / Tipo</span>
                <div style={{ fontWeight: 'bold', fontSize: '0.95rem', marginTop: '3px' }}>
                  {detalhesDados.type === 'experimento' ? detalhesDados.experimento.nome : detalhesDados.calibracao.tipo_calibracao}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>QPU Alvo</span>
                <div style={{ fontWeight: 'bold', fontSize: '0.95rem', marginTop: '3px' }}>
                  {detalhesDados.type === 'experimento' ? detalhesDados.experimento.qpu_nome : detalhesDados.calibracao.qpu_nome}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Pesquisador</span>
                <div style={{ fontWeight: 'bold', fontSize: '0.95rem', marginTop: '3px' }}>
                  {detalhesDados.type === 'experimento' ? detalhesDados.experimento.pesquisador_nome : detalhesDados.calibracao.pesquisador_nome}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Status / Resultado</span>
                <div style={{ marginTop: '3px' }}>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    background: detalhesDados.type === 'experimento'
                      ? (detalhesDados.experimento.status_execucao === 'Concluído' ? 'rgba(34, 197, 94, 0.1)' : detalhesDados.experimento.status_execucao === 'Falhou' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)')
                      : (detalhesDados.calibracao.resultado === 'Sucesso' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'),
                    color: detalhesDados.type === 'experimento'
                      ? (detalhesDados.experimento.status_execucao === 'Concluído' ? '#22c55e' : detalhesDados.experimento.status_execucao === 'Falhou' ? '#ef4444' : '#3b82f6')
                      : (detalhesDados.calibracao.resultado === 'Sucesso' ? '#22c55e' : '#ef4444')
                  }}>
                    {detalhesDados.type === 'experimento' ? detalhesDados.experimento.status_execucao : detalhesDados.calibracao.resultado}
                  </span>
                </div>
              </div>
              {detalhesDados.type === 'experimento' && (
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Objetivo</span>
                  <div style={{ fontSize: '0.9rem', marginTop: '3px', color: '#e2e8f0' }}>{detalhesDados.experimento.objetivo || 'Sem objetivo cadastrado'}</div>
                </div>
              )}
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Observações</span>
                <div style={{ fontSize: '0.9rem', marginTop: '3px', color: '#e2e8f0' }}>
                  {detalhesDados.type === 'experimento' ? (detalhesDados.experimento.observacoes || 'Sem observações') : (detalhesDados.calibracao.observacoes || 'Sem observações')}
                </div>
              </div>
            </div>

            {/* Conditions (Ambient) */}
            <h3 style={{ fontSize: '1.05rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', marginBottom: '12px', color: 'var(--accent-purple)' }}>
              Condições Ambientais do Criostato (No Momento do Registro)
            </h3>
            {((detalhesDados.type === 'experimento' && detalhesDados.experimento.id_registro_ambiente) || 
              (detalhesDados.type === 'calibracao' && detalhesDados.calibracao.id_registro_ambiente)) ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '25px', backgroundColor: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Temperatura</span>
                  <div style={{ fontWeight: 'bold', marginTop: '3px', color: '#e2e8f0' }}>
                    {detalhesDados.type === 'experimento' 
                      ? (detalhesDados.experimento.temperatura !== null ? `${Number(detalhesDados.experimento.temperatura).toFixed(4)} K` : '---')
                      : (detalhesDados.calibracao.temperatura !== null ? `${Number(detalhesDados.calibracao.temperatura).toFixed(4)} K` : '---')}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Pressão</span>
                  <div style={{ fontWeight: 'bold', marginTop: '3px', color: '#e2e8f0' }}>
                    {detalhesDados.type === 'experimento'
                      ? (detalhesDados.experimento.pressao !== null ? `${Number(detalhesDados.experimento.pressao).toFixed(4)} mTorr` : '---')
                      : (detalhesDados.calibracao.pressao !== null ? `${Number(detalhesDados.calibracao.pressao).toFixed(4)} mTorr` : '---')}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Umidade</span>
                  <div style={{ fontWeight: 'bold', marginTop: '3px', color: '#e2e8f0' }}>
                    {detalhesDados.type === 'experimento'
                      ? (detalhesDados.experimento.umidade !== null ? `${Number(detalhesDados.experimento.umidade).toFixed(2)}%` : '---')
                      : (detalhesDados.calibracao.umidade !== null ? `${Number(detalhesDados.calibracao.umidade).toFixed(2)}%` : '---')}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Vibração</span>
                  <div style={{ fontWeight: 'bold', marginTop: '3px', color: '#e2e8f0' }}>
                    {detalhesDados.type === 'experimento'
                      ? (detalhesDados.experimento.vibracao !== null ? `${Number(detalhesDados.experimento.vibracao).toFixed(4)} µm/s` : '---')
                      : (detalhesDados.calibracao.vibracao !== null ? `${Number(detalhesDados.calibracao.vibracao).toFixed(4)} µm/s` : '---')}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Campo Magnético</span>
                  <div style={{ fontWeight: 'bold', marginTop: '3px', color: '#e2e8f0' }}>
                    {detalhesDados.type === 'experimento'
                      ? (detalhesDados.experimento.campo_magnetico !== null ? `${Number(detalhesDados.experimento.campo_magnetico).toFixed(4)} mT` : '---')
                      : (detalhesDados.calibracao.campo_magnetico !== null ? `${Number(detalhesDados.calibracao.campo_magnetico).toFixed(4)} mT` : '---')}
                  </div>
                </div>
                <div style={{ gridColumn: 'span 3' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Obs. do Log Ambiental</span>
                  <div style={{ fontSize: '0.85rem', marginTop: '3px', color: '#cbd5e1' }}>
                    {detalhesDados.type === 'experimento' ? (detalhesDados.experimento.ambiente_observacoes || 'Nenhuma observação registrada') : (detalhesDados.calibracao.ambiente_observacoes || 'Nenhuma observação registrada')}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem', marginBottom: '25px', backgroundColor: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.08)' }}>
                Nenhum registro de ambiente vinculado.
              </div>
            )}

            {/* Qubits Calibrados (Abrange) - APENAS para Calibrações */}
            {detalhesDados.type === 'calibracao' && (
              <>
                <h3 style={{ fontSize: '1.05rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', marginBottom: '12px', color: 'var(--accent-purple)' }}>
                  Qubits Calibrados (Relação Abrange)
                </h3>
                {detalhesDados.qubitsCalibrados && detalhesDados.qubitsCalibrados.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px' }}>
                    {detalhesDados.qubitsCalibrados.map(qc => (
                      <div key={qc.id_qubit} style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '12px 15px', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold', color: 'var(--accent-purple)' }}>Qubit #{qc.indice_qubit} ({qc.tipo_qubit})</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '6px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Parâmetro Ajustado</span>
                            <span style={{ fontWeight: 'bold' }}>{qc.parametro_ajustado || 'N/A'}</span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Valor Antes</span>
                            <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{qc.valor_antes !== null ? Number(qc.valor_antes).toFixed(4) : '---'}</span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Valor Depois</span>
                            <span style={{ color: '#22c55e', fontWeight: 'bold' }}>{qc.valor_depois !== null ? Number(qc.valor_depois).toFixed(4) : '---'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem', marginBottom: '25px', backgroundColor: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.08)' }}>
                    Nenhum qubit associado a esta calibração no registro abrange.
                  </div>
                )}
              </>
            )}

            {/* Pulse Sequences */}
            <h3 style={{ fontSize: '1.05rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', marginBottom: '12px', color: 'var(--accent-purple)' }}>
              Sequências de Pulso Utilizadas
            </h3>
            {detalhesDados.sequencias && detalhesDados.sequencias.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {detalhesDados.sequencias.map(seq => (
                  <div key={seq.id_sequencia} style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '12px 15px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--accent-purple)' }}>{seq.nome}</span>
                      <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)', color: '#a78bfa' }}>
                        Versão: {seq.versao}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      <strong>Finalidade:</strong> {seq.finalidade}
                    </div>
                    <div style={{ fontSize: '0.85rem', marginTop: '6px', color: '#cbd5e1' }}>{seq.descricao}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem', backgroundColor: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.08)' }}>
                Nenhuma sequência de pulso vinculada a este registro.
              </div>
            )}

            {/* Footer Close Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '25px', borderTop: '1px solid #3c3c5c', paddingTop: '15px' }}>
              <button 
                onClick={() => { setDetalhesModalOpen(false); setDetalhesDados(null); }}
                style={{ padding: '8px 20px', background: 'var(--accent-purple)', border: 'none', borderRadius: '6px', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App;