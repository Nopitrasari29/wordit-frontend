import { ReactNode } from "react";

interface FeatureCardProps {
  title: string;
  desc: string;
  icon: string | ReactNode;
}

export default function FeatureCard({ title, desc, icon }: FeatureCardProps) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 hover:-translate-y-2 flex flex-col items-center text-center group">
      <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-5 group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-bold mb-2 text-slate-800">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
        {desc}
      </p>
    </div>
  )
}