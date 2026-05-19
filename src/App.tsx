/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, FC } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Info, Loader2, Calendar } from 'lucide-react';
import { fetchSpreadsheetData } from './services/dataService';
import { SpreadsheetData, Team } from './types';

export default function App() {
  const [data, setData] = useState<SpreadsheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const result = await fetchSpreadsheetData();
        setData(result);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('No se pudo cargar la información del Google Sheet.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
    // Refresh data every 5 minutes
    const interval = setInterval(loadData, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-petrol flex flex-col items-center justify-center text-gold">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="text-xl font-medium">Cargando datos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-petrol flex flex-col items-center justify-center text-white p-4 text-center">
        <div className="bg-red-500/10 border border-red-500 p-6 rounded-xl max-w-md">
          <Info className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">¡Ups!</p>
          <p className="opacity-80">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-gold text-petrol font-bold rounded-lg hover:bg-gold-dark transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-petrol text-white font-sans selection:bg-gold/30">
      {/* Header */}
      <header className="p-6 md:px-12 flex flex-col md:flex-row justify-between items-center bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className="w-12 h-12 bg-gold rounded-xl flex items-center justify-center shadow-lg shadow-gold/20">
            <Users className="text-petrol w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gold">EQUIPS</h1>
            <p className="text-xs uppercase tracking-widest opacity-60">GESTIÓ D'EQUIPS</p>
          </div>
        </div>
        
        {/* Quick Summary Bar */}
        <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 max-w-full no-scrollbar">
          {data?.summary.map((item, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={item.day} 
              className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg flex items-center gap-3 whitespace-nowrap"
            >
              <div className="text-[10px] uppercase font-bold opacity-50">{item.day}</div>
              <div className={`text-sm font-bold ${item.freeSpaces === "0" ? "text-red-400" : "text-green-400"}`}>
                {String(item.freeSpaces).toLowerCase().includes('limitat') ? item.freeSpaces : `${item.freeSpaces} PLACES LLIURES`}
              </div>
            </motion.div>
          ))}
        </div>
      </header>

      <main className="p-6 md:p-12 max-w-7xl mx-auto">
        {/* Page Title & Stats */}
        <div className="mb-12">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-6xl font-black mb-4 flex items-baseline gap-4 text-white"
          >
            BÀSQUET <span className="text-gold italic">PANTERES</span>
          </motion.h2>
          <p className="max-w-2xl text-lg opacity-70 leading-relaxed">
            Visualització en temps real dels jugadors inscrits i places disponibles.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {data?.teams.map((team: Team, index: number) => (
              <TeamCard key={team.name} team={team} index={index} />
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-12 border-t border-white/5 mt-12 bg-black/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 opacity-40 text-sm">
          <p>© 2024 Reserva Pistes System</p>
          <div className="flex gap-6">
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Actualizado hoy</span>
            <span className="flex items-center gap-2"><Users className="w-4 h-4" /> {data?.teams.length} Equipos</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface TeamCardProps {
  team: Team;
  index: number;
}

const TeamCard: FC<TeamCardProps> = ({ team, index }) => {
  const isFull = team.freeSpaces === "0";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-gold/30 transition-all duration-300 shadow-xl hover:shadow-gold/5">
        {/* Card Header */}
        <div className={`p-5 flex justify-between items-start ${isFull ? 'bg-white/5' : 'bg-gold/10'}`}>
          <div>
            <h3 className="text-xl font-bold text-gold group-hover:scale-105 transition-transform origin-left">{team.name}</h3>
            <p className="text-xs opacity-50 uppercase tracking-tighter mt-1">{team.players.length} Miembros activos</p>
          </div>
          <div className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${isFull ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
            {isFull ? 'COMPLETO' : String(team.freeSpaces).toLowerCase().includes('limitat') ? team.freeSpaces : `${team.freeSpaces} LIBRES`}
          </div>
        </div>

        {/* Table Content */}
        <div className="p-1">
          <div className="bg-gold p-[1px] rounded-lg overflow-hidden">
            <div className="bg-petrol grid grid-cols-12 text-[10px] font-bold uppercase tracking-widest text-gold/60 border-b border-gold/20 p-2">
              <div className="col-span-2 text-center">#</div>
              <div className="col-span-5">Nombre</div>
              <div className="col-span-5">Apellidos</div>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar bg-petrol/50 backdrop-blur-lg">
              {team.players.length > 0 ? (
                team.players.map((player, pIdx) => (
                  <div key={pIdx} className="grid grid-cols-12 text-sm py-2 px-2 border-b border-white/5 last:border-0 hover:bg-gold/5 transition-colors group/row">
                    <div className="col-span-2 text-center opacity-30 font-mono text-xs">{String(pIdx + 1).padStart(2, '0')}</div>
                    <div className="col-span-5 font-semibold text-white/90">{player.firstName}</div>
                    <div className="col-span-5 opacity-70 group-hover/row:opacity-100 transition-opacity uppercase text-[10px] self-center">{player.lastName}</div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center opacity-30 italic text-sm">
                  Sin jugadores registrados
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1 bg-white/5 w-full">
          <div 
            className={`h-full transition-all duration-1000 ${isFull ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-gold shadow-[0_0_10px_rgba(255,215,0,0.5)]'}`}
            style={{ width: `${Math.min(100, (team.players.length / 20) * 100)}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
};
