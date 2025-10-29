import { useState } from 'react';
import axios from 'axios';
import './App.css';

export default function App() {
    const [url, setUrl] = useState('');
    const [mode, setMode] = useState('auto');
    const [adapter, setAdapter] = useState('');
    const [goal, setGoal] = useState('');

    const [backend, setBackend] = useState('local');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const presets = [
        { label: 'Selecione um atalho...', value: 'none' },
        {
            label: 'Buscar Manchetes do G1',
            value: 'g1',
            config: {
                url: 'https://g1.globo.com',
                mode: 'static',
                adapter: 'g1.globo.com',
            },
        },
        {
            label: 'Preços de Notebooks no Mercado Livre',
            value: 'mercadolivre_notebooks',
            config: {
                url: 'https://lista.mercadolivre.com.br/notebook',
                mode: 'browser',
                adapter: 'mercadolivre.com.br',
            },
        },
       
    ];

    const handlePresetChange = (selectedValue) => {
        const selectedPreset = presets.find(p => p.value === selectedValue);
        if (selectedPreset && selectedPreset.config) {
            const { url, mode, adapter, goal } = selectedPreset.config;
            setUrl(url);
            setMode(mode);
            setAdapter(adapter || '');
            setGoal(goal || '');
        } else {
            setUrl('');
            setMode('auto');
            setAdapter('');
            setGoal('');
        }
    };

    const handleScrape = async () => {
        setLoading(true);
        setError('');
        setResult(null);

        const baseURL = 'https://scraper-fullstack-universal.onrender.com'; 

        try {
            const payload = { url, mode };
            if (adapter) payload.adapter = adapter;
            if (mode === 'ai' && goal) payload.goal = goal;
            
            const { data } = await axios.post(`${baseURL}/scrape`, payload);

            if (data.success) {
                if (Array.isArray(data.data) && data.data.length === 0) {
                    setError('A extração funcionou, mas nenhum dado foi encontrado. A estrutura do site pode ter mudado ou não há itens na página.');
                } else {
                    const cleanedData = Array.isArray(data.data) ? data.data.map(item => {
                        if (item.link && item.link.includes('click1.mercadolivre.com.br')) {
                            const hashIndex = item.link.indexOf('#');
                            const linkWithoutHash = hashIndex !== -1 ? item.link.substring(0, hashIndex) : item.link;
                            const match = linkWithoutHash.match(/link%3A\s*(https?:\/\/[^&]*)/i);
                            if (match && match[1]) {
                                item.link = decodeURIComponent(match[1]);
                            }
                        }
                        return item;
                    }) : data.data;

                    setResult(cleanedData);
                }
            } else {
                setError(data.error || 'Ocorreu um erro desconhecido no backend.');
            }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                setError(`Erro do servidor: ${err.response.data.error}`);
            } else if (err.code === 'ERR_CONNECTION_REFUSED') {
                setError(`Erro de conexão: O backend não está ativo na porta 3000. Por favor, inicie o servidor (npm run dev na pasta backend).`);
            } else {
                setError(`Falha ao processar a requisição: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const renderResult = () => {
        if (!result) return null;

        if (Array.isArray(result)) {
            return (
                <ul className="results-list">
                    {result.map((item, index) => (
                        <li key={index} className="results-list-item">
                            <a href={item.link} target="_blank" rel="noopener noreferrer">
                                {item.title || 'Sem título'}
                            </a>
                            {item.price && <p className="price-tag">{item.price}</p>}
                        </li>
                    ))}
                </ul>
            );
        }

        return <pre>{JSON.stringify(result, null, 2)}</pre>;
    }

    return (
        <div className="container">
            <header>
                <h1>Scraper Fullstack Universal</h1>
                <p>Uma ferramenta poderosa para extração de dados da web.</p>
            </header>

            <main>
                <div className="form-group">
                    <label htmlFor="presets">Atalhos Prontos</label>
                    <select id="presets" onChange={(e) => handlePresetChange(e.target.value)} defaultValue="none">
                        {presets.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="url">URL do Site</label>
                    <input
                        id="url"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        placeholder="https://exemplo.com"
                        disabled={loading}
                    />
                </div>

                <div className="form-group-row">
                    <div className="form-group">
                        <label htmlFor="mode">Modo de Extração</label>
                        <select id="mode" value={mode} onChange={e => setMode(e.target.value)} disabled={loading}>
                            <option value="auto">Automático</option>
                            <option value="static">Estático</option>
                            <option value="browser">Navegador</option>
                            <option value="ai">IA (GPT/Gemini)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="adapter">Adapter (Opcional)</label>
                        <input
                            id="adapter"
                            value={adapter}
                            onChange={e => setAdapter(e.target.value)}
                            placeholder="ex: g1.globo.com"
                            disabled={loading}
                        />
                    </div>
                </div>
                
                {mode === 'ai' && (
                    <div className="form-group">
                        <label htmlFor="goal">Objetivo (para modo IA)</label>
                        <input
                            id="goal"
                            value={goal}
                            onChange={e => setGoal(e.target.value)}
                            placeholder="Ex: extrair o nome e preço de todos os produtos"
                            disabled={loading}
                        />
                    </div>
                )}

                <button onClick={handleScrape} disabled={loading || !url}>
                    {loading ? 'Extraindo...' : 'Extrair Dados'}
                </button>

                <div className="results-container">
                    <h3>Resultados</h3>
                    <div className="results-box">
                        {loading && <p className="loading-message">Carregando...</p>}
                        {error && <p className="error-message">ALERTA DO ESPIÃO: {error}</p>}
                        {result && !error && renderResult()}
                        {!loading && !error && !result && <p>Os resultados aparecerão aqui.</p>}
                    </div>
                </div>
            </main>

            <footer>
                <p>Desenvolvido por RICHARD V DUARTE</p>
            </footer>
        </div>
    );
}