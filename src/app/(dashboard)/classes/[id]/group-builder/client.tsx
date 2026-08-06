"use client";

import { useState } from "react";
import { Users, Shuffle, Copy, Check } from "lucide-react";

type Student = {
  id: string;
  name: string;
  local_code: string;
  gender?: string;
};

type Group = {
  id: number;
  name: string;
  members: Student[];
};

export default function GroupBuilderClient({ students }: { students: Student[] }) {
  const [groupCount, setGroupCount] = useState<number>(4);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [balanceGender, setBalanceGender] = useState(false);

  // Fisher-Yates shuffle algorithm
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const generateGroups = () => {
    if (students.length === 0 || groupCount < 1) return;

    let shuffledStudents: Student[] = [];

    if (balanceGender) {
      // Separate by gender
      const males = students.filter(s => s.gender === 'L');
      const females = students.filter(s => s.gender === 'P');
      const unknown = students.filter(s => s.gender !== 'L' && s.gender !== 'P');

      const shuffledMales = shuffleArray(males);
      const shuffledFemales = shuffleArray(females);
      const shuffledUnknown = shuffleArray(unknown);

      // Distribute evenly
      const newGroups: Group[] = Array.from({ length: groupCount }, (_, i) => ({
        id: i + 1,
        name: `Kelompok ${i + 1}`,
        members: []
      }));

      let currentGroupIndex = 0;
      
      const addToGroup = (studentList: Student[]) => {
        studentList.forEach(student => {
          newGroups[currentGroupIndex].members.push(student);
          currentGroupIndex = (currentGroupIndex + 1) % groupCount;
        });
      };

      addToGroup(shuffledMales);
      addToGroup(shuffledFemales);
      addToGroup(shuffledUnknown);

      setGroups(newGroups);
      return;
    }

    // Standard shuffle
    shuffledStudents = shuffleArray(students);

    const newGroups: Group[] = Array.from({ length: groupCount }, (_, i) => ({
      id: i + 1,
      name: `Kelompok ${i + 1}`,
      members: []
    }));

    shuffledStudents.forEach((student, index) => {
      const groupIndex = index % groupCount;
      newGroups[groupIndex].members.push(student);
    });

    setGroups(newGroups);
    setIsCopied(false);
  };

  const copyToClipboard = () => {
    if (groups.length === 0) return;

    let text = "Pembagian Kelompok:\n\n";
    groups.forEach(g => {
      text += `**${g.name}**\n`;
      g.members.forEach((m, idx) => {
        text += `${idx + 1}. ${m.name}\n`;
      });
      text += "\n";
    });

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex-1 max-w-sm">
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Jumlah Kelompok
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="2"
                max={Math.max(2, Math.min(20, Math.floor(students.length / 2)))}
                value={groupCount}
                onChange={e => setGroupCount(Number(e.target.value))}
                className="flex-1 accent-indigo-600"
              />
              <span className="w-12 text-center rounded-lg bg-indigo-50 px-2 py-1 text-sm font-bold text-indigo-700 border border-indigo-100">
                {groupCount}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-1 sm:justify-end">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={balanceGender} 
                onChange={(e) => setBalanceGender(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 w-4 h-4" 
              />
              <span className="text-sm font-medium text-slate-700">Ratakan L/P</span>
            </label>
            
            <button
              onClick={generateGroups}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <Shuffle size={16} />
              Acak Murid
            </button>
          </div>
        </div>
      </div>

      {groups.length > 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Hasil Pembagian</h3>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              {isCopied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
              {isCopied ? "Tersalin!" : "Salin Teks"}
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {groups.map(group => (
              <div key={group.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-bold text-indigo-900">{group.name}</h4>
                  <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    <Users size={12} /> {group.members.length}
                  </span>
                </div>
                <ul className="space-y-2">
                  {group.members.map((member, idx) => (
                    <li key={member.id} className="text-sm text-slate-700 flex items-start gap-2 bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                      <span className="text-slate-400 font-medium text-xs mt-0.5">{idx + 1}.</span>
                      <div>
                        <div className="font-semibold">{member.name}</div>
                        {member.gender && <div className="text-[10px] text-slate-400">{member.gender === 'L' ? 'Laki-laki' : member.gender === 'P' ? 'Perempuan' : ''}</div>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-500">
          <Users size={48} className="mb-4 text-slate-300" />
          <p className="text-sm font-medium">Tentukan jumlah kelompok lalu klik &quot;Acak Murid&quot;</p>
        </div>
      )}
    </div>
  );
}
