import { Link } from "react-router-dom";
import { templateIcons } from "../../../data/templateIcons";

interface GameCardProps {
  game: any;
  onDelete?: (id: string) => void;
  onPublish?: (id: string) => void;
}

export default function GameCard({ game, onDelete, onPublish }: GameCardProps) {
  // Gunakan shareCode jika ada, jika tidak gunakan 6 digit awal ID
  const displayId = game.shareCode || game.id?.substring(0, 6).toUpperCase();

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group flex flex-col">
      
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-slate-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
            {templateIcons[game.templateType] || "🎮"}
          </div>
          <div>
            <h3 className="font-black text-2xl text-slate-800 tracking-tight">
              {game.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-indigo-50 text-indigo-600 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                {game.templateType.replace(/_/g, " ")}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                {game.educationLevel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* STATUS & ID INFO */}
      <div className="flex items-center gap-3 mb-8">
        <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border ${game.isPublished ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"}`}>
          {game.isPublished && <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>}
          <span className="text-[10px] font-black uppercase tracking-widest">
            {game.isPublished ? "PUBLISHED" : "DRAFT"}
          </span>
        </div>
        <div className="bg-slate-50 text-indigo-500 px-4 py-1.5 rounded-full border border-slate-100 text-[10px] font-black tracking-widest">
          ID: {displayId}
        </div>
        <p className="ml-auto text-slate-400 font-black text-[10px] uppercase tracking-widest">
          {game.playCount || 0} PLAYS
        </p>
      </div>

      {/* 🎮 BUTTON AREA */}
      <div className="mt-auto pt-6 border-t border-slate-50 flex flex-wrap items-center gap-3">
        {/* Tombol Play: Hanya muncul jika sudah Published */}
        {game.isPublished && (
          <Link 
            to={`/game/play/${game.shareCode}`}
            className="flex-1 bg-indigo-600 text-white text-center py-4 rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
          >
            Play 🎮
          </Link>
        )}

        {/* Tombol Publish: Muncul jika masih Draft */}
        {!game.isPublished && onPublish && (
          <button 
            onClick={() => onPublish(game.id)}
            className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all active:scale-95"
          >
            Publish 🚀
          </button>
        )}

        <Link 
          to={`/teacher/game/edit/${game.id}`}
          className="flex-1 bg-slate-900 text-white text-center py-4 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all active:scale-95"
        >
          Edit
        </Link>
        
        <Link 
          to={`/teacher/game/preview/${game.id}`} 
          className="flex-1 bg-white border-2 border-slate-100 text-slate-600 text-center py-4 rounded-2xl font-black text-sm hover:border-indigo-500 hover:text-indigo-600 transition-all"
        >
          Preview
        </Link>

        <button 
          onClick={() => onDelete && onDelete(game.id)}
          className="text-rose-400 hover:text-rose-600 font-black text-[10px] uppercase tracking-widest px-2 transition-colors"
        >
          Hapus
        </button>
      </div>
    </div>
  );
}