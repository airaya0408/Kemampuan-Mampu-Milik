
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import ReactMarkdown from 'react-markdown';
import { RAW_PROPERTY_DATA } from './constants';
import PropertyCard from './components/PropertyCard';
import BottomAgent from './components/BottomAgent';
import { analyzeMarketData } from './services/geminiService';
import { PropertyChatAgent } from './services/chatService';

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<string>('');
  const [errorStatus, setErrorStatus] = useState<'technical' | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'deep-dive' | 'data-table' | 'ai-expert' | 'ai-agent'>('dashboard');
  
  const [filterState, setFilterState] = useState<string>('Semua Negeri');
  const [filterType, setFilterType] = useState<string>('Semua Jenis');
  const [filterStatus, setFilterStatus] = useState<string>('Semua Status');
  const [query, setQuery] = useState<string>('');
  
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'agent', text: string}[]>([
    { role: 'agent', text: 'Selamat datang! Sistem telah memuatkan kesemua 145 rekod hartanah 2024. Ada apa-apa yang anda ingin tahu?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const dedicatedAgent = useRef<PropertyChatAgent | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const lastAnalysisKey = useRef<string>('');

  const states = useMemo(() => {
    const s = new Set(RAW_PROPERTY_DATA.map(d => d.negeri));
    return ['Semua Negeri', ...Array.from(s).sort()];
  }, []);

  const houseTypes = useMemo(() => {
    const types = new Set(RAW_PROPERTY_DATA.map(d => d.jenisRumah));
    return ['Semua Jenis', ...Array.from(types).sort()];
  }, []);

  const affordabilityStatuses = useMemo(() => {
    const statuses = new Set(RAW_PROPERTY_DATA.map(d => d.kategoriKemampuan));
    return ['Semua Status', ...Array.from(statuses).sort()];
  }, []);
  
  const filteredData = useMemo(() => {
    return RAW_PROPERTY_DATA.filter(item => {
      const stateMatch = filterState === 'Semua Negeri' || item.negeri === filterState;
      const typeMatch = filterType === 'Semua Jenis' || item.jenisRumah === filterType;
      const statusMatch = filterStatus === 'Semua Status' || item.kategoriKemampuan === filterStatus;
      return stateMatch && typeMatch && statusMatch;
    }).map(item => ({
      ...item,
      chartLabel: `${item.negeri} (${item.jenisRumah})`,
      absBezaHarga: Math.abs(item.bezaHarga)
    }));
  }, [filterState, filterType, filterStatus]);

  const fetchAIAnalysis = useCallback(async (customQuery?: string) => {
    const currentKey = `${filterState}-${filterType}-${filterStatus}-${customQuery || 'default'}`;
    if (currentKey === lastAnalysisKey.current && analysis && !errorStatus) return;

    setLoading(true);
    setErrorStatus(null);
    
    try {
      const result = await analyzeMarketData(filteredData, customQuery);
      setAnalysis(result);
      lastAnalysisKey.current = currentKey;
    } catch (err: any) {
      console.error("Analysis Error:", err);
      setErrorStatus("technical");
      setAnalysis("Maaf, ralat teknikal berlaku semasa menjana analisis AI.");
    } finally {
      setLoading(false);
    }
  }, [filteredData, filterState, filterType, filterStatus, analysis, errorStatus]);

  const handleSendDedicatedChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatting) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    if (!dedicatedAgent.current) dedicatedAgent.current = new PropertyChatAgent();

    try {
      let fullResponse = '';
      setChatMessages(prev => [...prev, { role: 'agent', text: '' }]);
      const stream = dedicatedAgent.current.sendMessage(userMsg);
      for await (const chunk of stream) {
        fullResponse += chunk;
        setChatMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].text = fullResponse;
          return updated;
        });
      }
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'agent', text: 'Maaf, ralat berlaku semasa memproses mesej.' }]);
    } finally {
      setIsChatting(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'ai-expert' && (!analysis || errorStatus)) fetchAIAnalysis();
    if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [activeTab, fetchAIAnalysis, analysis, errorStatus, chatMessages]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setActiveTab('ai-expert');
      fetchAIAnalysis(query);
    }
  };

  const averageMultiple = useMemo(() => {
    if (filteredData.length === 0) return "0";
    const total = filteredData.reduce((acc, curr) => acc + curr.medianMultiple, 0);
    return (total / filteredData.length).toFixed(1);
  }, [filteredData]);

  // Temporary variable fix for isChatting vs setIsTyping confusion in the code
  const [isTyping, setIsTyping] = useState(false);

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <aside className="hidden lg:flex flex-col w-72 bg-slate-900 text-white p-8 h-full shrink-0">
        <div className="mb-12">
          <h1 className="text-2xl font-black tracking-tighter flex items-center gap-2">
            <span className="bg-blue-600 px-2 py-1 rounded-lg">DATA</span> HARTANAH
          </h1>
          <p className="text-slate-500 text-[10px] font-bold mt-2 uppercase tracking-widest">Sistem Analisis 145 Rekod</p>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard Utama', icon: 'M4 6h16M4 12h16M4 18h16' },
            { id: 'deep-dive', label: 'Analisis Visual', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2' },
            { id: 'data-table', label: 'Jadual Data Penuh', icon: 'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
            { id: 'ai-expert', label: 'Analisis Pakar AI', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
            { id: 'ai-agent', label: 'Ejen Sembang AI', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-semibold text-xs ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} /></svg>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-slate-800">
          <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50">
            <p className="text-[9px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Integriti Data</p>
            <div className="flex justify-between items-center mb-1">
               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pemuatan</span>
               <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">100%</span>
            </div>
            <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full w-full"></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">145 Rekod Disahkan 2024</p>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex flex-col sm:flex-row justify-between items-center z-20 gap-4 shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800 capitalize mr-2">{activeTab.replace('-', ' ')}</h2>
            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
            <div className="flex flex-wrap gap-2">
              <select value={filterState} onChange={(e) => setFilterState(e.target.value)} className="bg-slate-100 border-none rounded-lg text-[10px] font-bold py-1.5 px-2.5 outline-none cursor-pointer hover:bg-slate-200 transition-colors">
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bg-slate-100 border-none rounded-lg text-[10px] font-bold py-1.5 px-2.5 outline-none cursor-pointer hover:bg-slate-200 transition-colors">
                {houseTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-slate-100 border-none rounded-lg text-[10px] font-bold py-1.5 px-2.5 outline-none cursor-pointer hover:bg-slate-200 transition-colors">
                {affordabilityStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <form onSubmit={handleSearch} className="relative w-full max-w-md">
            <input type="text" placeholder="Cari wawasan dari 145 rekod..." className="w-full bg-slate-100 border-none rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-inner" value={query} onChange={(e) => setQuery(e.target.value)} />
            <svg className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </form>
        </header>

        <main className="flex-1 overflow-y-auto p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-12 pb-32">
            {activeTab === 'dashboard' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Jumlah Rekod', val: filteredData.length, desc: 'Entri Terpilih' },
                    { label: 'Purata Indeks', val: `${averageMultiple}x`, desc: 'Kadar Median' },
                    { label: 'Mampu Milik', val: filteredData.filter(d => d.medianMultiple <= 3).length, desc: 'Terjangkau' },
                    { label: 'Kritikal', val: filteredData.filter(d => d.medianMultiple > 5.1).length, desc: 'Risiko Tinggi' }
                  ].map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1 tracking-widest">{s.label}</p>
                      <p className="text-3xl font-black text-slate-900">{s.val}</p>
                      <p className="text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-wider">{s.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <h3 className="text-lg font-bold italic text-slate-800">Visualisasi Jurang Kemampuan (Top 50 Terpilih)</h3>
                  </div>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={filteredData.slice(0, 50)} margin={{ bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="chartLabel" hide />
                        <YAxis fontSize={10} stroke="#94a3b8" tickFormatter={(val) => `RM ${val / 1000}k`} />
                        <Tooltip contentStyle={{ borderRadius: '15px' }} />
                        <Bar dataKey="bezaHarga" radius={[4, 4, 0, 0]}>
                          {filteredData.slice(0, 50).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.bezaHarga < 0 ? '#ef4444' : '#22c55e'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-6">
                   <h3 className="text-xl font-black text-slate-800">Senarai Terperinci ({filteredData.length} Keputusan)</h3>
                   {filteredData.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {filteredData.map((d, i) => <PropertyCard key={i} data={d} />)}
                     </div>
                   ) : (
                     <div className="py-20 bg-white border border-dashed border-slate-300 rounded-[3rem] flex flex-col items-center justify-center text-center text-slate-400">
                        <p>Tiada data untuk gabungan penapis ini.</p>
                     </div>
                   )}
                </div>
              </>
            )}

            {activeTab === 'data-table' && (
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10 backdrop-blur-sm">
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">Pangkalan Data Nasional 2024</h3>
                  <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold">Total: {filteredData.length} Rekod</span>
                </div>
                <div className="overflow-x-auto max-h-[700px]">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                      <tr className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                        <th className="px-8 py-4 border-b border-slate-200">Bil</th>
                        <th className="px-8 py-4 border-b border-slate-200">Negeri</th>
                        <th className="px-8 py-4 border-b border-slate-200">Jenis Rumah</th>
                        <th className="px-8 py-4 border-b border-slate-200 text-right">Harga Median</th>
                        <th className="px-8 py-4 border-b border-slate-200 text-right">Multiple</th>
                        <th className="px-8 py-4 border-b border-slate-200">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-100">
                      {filteredData.map((d, i) => (
                        <tr key={i} className="hover:bg-blue-50/50 transition-colors group">
                          <td className="px-8 py-4 text-slate-400 font-mono text-xs">{i + 1}</td>
                          <td className="px-8 py-4 font-bold text-slate-800">{d.negeri}</td>
                          <td className="px-8 py-4 text-slate-600 font-medium">{d.jenisRumah}</td>
                          <td className="px-8 py-4 font-mono font-bold text-right text-blue-600">RM {d.medianHarga.toLocaleString()}</td>
                          <td className="px-8 py-4 font-black text-right">{d.medianMultiple.toFixed(2)}x</td>
                          <td className="px-8 py-4">
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase whitespace-nowrap shadow-sm ${
                              d.medianMultiple <= 3 ? 'bg-green-100 text-green-700' : 
                              d.medianMultiple > 5.1 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                            }`}>{d.kategoriKemampuan}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'deep-dive' && (
              <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm h-[650px]">
                <h3 className="text-2xl font-black text-slate-800 mb-8 text-center uppercase tracking-tighter italic">Matriks Sebaran 145 Rekod: Harga vs Multiple</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" dataKey="medianHarga" name="Harga" unit="RM" fontSize={10} tickFormatter={(v) => `${v/1000}k`} />
                    <YAxis type="number" dataKey="medianMultiple" name="Indeks" unit="x" fontSize={10} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Lokasi" data={filteredData}>
                      {filteredData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.medianMultiple > 5.1 ? '#ef4444' : entry.medianMultiple > 3 ? '#f97316' : '#22c55e'} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            )}

            {activeTab === 'ai-expert' && (
              <div className="max-w-4xl mx-auto bg-white p-12 rounded-[3rem] border border-slate-200 shadow-2xl min-h-[500px]">
                {loading ? (
                  <div className="py-24 flex flex-col items-center gap-6 text-center text-slate-400">
                    <p>Menghadam 145 Rekod Nasional...</p>
                  </div>
                ) : (
                  <article className="prose prose-slate max-w-none">
                    <ReactMarkdown>{analysis}</ReactMarkdown>
                  </article>
                )}
              </div>
            )}

            {activeTab === 'ai-agent' && (
              <div className="max-w-4xl mx-auto h-[650px] flex flex-col bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden">
                 <div className="bg-slate-900 p-8 flex items-center gap-4 shrink-0 text-white">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-bold">A</div>
                    <div>
                      <h3 className="font-bold italic text-lg">Terminal Sembang Hartanah Nasional</h3>
                    </div>
                 </div>
                 <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50">
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-5 rounded-[2rem] shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}`}>
                          <div className="prose prose-sm max-w-none text-inherit leading-relaxed">
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    ))}
                 </div>
                 <form onSubmit={handleSendDedicatedChat} className="p-6 bg-white border-t border-slate-100 flex gap-4 shrink-0">
                    <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Tanya tentang mana-mana rekod..." className="flex-1 bg-slate-100 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    <button type="submit" disabled={isTyping} className="bg-blue-600 text-white p-4 rounded-2xl shadow-xl hover:bg-blue-700 transition-all">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                 </form>
              </div>
            )}
          </div>
        </main>

        {activeTab !== 'ai-agent' && <BottomAgent />}
      </div>
    </div>
  );
};

export default App;
