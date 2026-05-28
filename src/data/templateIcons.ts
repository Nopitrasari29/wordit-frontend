import React from "react";
import {
  Shuffle,
  Files,
  HelpCircle,
  Compass,
  RefreshCw,
  Search,
  ListTodo,
  ToggleLeft,
  Link as LinkIcon,
  FileText,
} from "lucide-react";

const createIconBadge = (IconComponent: any, gradientClass: string, shadowClass: string) => {
  return React.createElement(
    "div",
    {
      className: `w-[1.8em] h-[1.8em] rounded-[0.5em] flex items-center justify-center text-white shadow-lg bg-gradient-to-tr ${gradientClass} ${shadowClass} transition-transform duration-300 group-hover:scale-110`
    },
    React.createElement(IconComponent, { className: "w-[0.9em] h-[0.9em] stroke-[2.5]" })
  );
};

export const templateIcons: Record<string, React.ReactNode> = {
  ANAGRAM: createIconBadge(Shuffle, "from-purple-500 to-indigo-600", "shadow-indigo-200/50"),
  FLASHCARD: createIconBadge(Files, "from-pink-500 to-rose-600", "shadow-rose-200/50"),
  HANGMAN: createIconBadge(HelpCircle, "from-red-500 to-orange-600", "shadow-orange-200/50"),
  MAZE_CHASE: createIconBadge(Compass, "from-emerald-500 to-teal-600", "shadow-emerald-200/50"),
  SPIN_THE_WHEEL: createIconBadge(RefreshCw, "from-amber-400 to-orange-500", "shadow-orange-200/50"),
  WORD_SEARCH: createIconBadge(Search, "from-blue-500 to-cyan-500", "shadow-blue-200/50"),
  MULTIPLE_CHOICE: createIconBadge(ListTodo, "from-violet-500 to-fuchsia-600", "shadow-fuchsia-200/50"),
  TRUE_FALSE: createIconBadge(ToggleLeft, "from-sky-400 to-indigo-600", "shadow-sky-200/50"),
  MATCHING: createIconBadge(LinkIcon, "from-lime-500 to-green-600", "shadow-green-200/50"),
  ESSAY: createIconBadge(FileText, "from-yellow-500 to-amber-600", "shadow-amber-200/50"),
};