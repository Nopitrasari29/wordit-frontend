// 1. Definisikan interface Props di sini
interface Props {
  title: string;
  description: string;
  onClick: () => void;
}

export default function TemplateCard({ title, description, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="bg-white p-6 rounded-[2rem] shadow-sm border-2 border-transparent hover:border-indigo-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
    >
      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
        🧩
      </div>
      <h2 className="text-xl font-black text-slate-800 mb-2">{title}</h2>
      <p className="text-slate-500 font-medium leading-relaxed">{description}</p>
    </div>
  )
}