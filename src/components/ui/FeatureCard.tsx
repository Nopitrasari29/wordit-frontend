import { ReactNode } from "react";

interface FeatureCardProps {
  title: string;
  desc: string;
  icon: string | ReactNode;
}

export default function FeatureCard({ title, desc, icon }: { title: string, desc: string, icon: string }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center group">
      <div className="w-20 h-20 bg-indigo-50 text-4xl flex items-center justify-center rounded-[2rem] mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:rotate-6 transition-all duration-500">
        {icon}
      </div>
      <h3 className="text-xl font-black text-slate-800 mb-3 tracking-tight">{title}</h3>
      <p className="text-slate-500 font-bold text-sm leading-relaxed">{desc}</p>
    </div>
  )
}