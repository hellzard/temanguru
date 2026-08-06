"use client";

import { useState } from "react";
import { MessageSquare, Users, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

type StudentItem = Record<string, unknown> & {
  id?: string;
  display_name?: string;
  local_code?: string;
};

export function ConnectClient({ students }: { students: StudentItem[] }) {
  const [activeTab, setActiveTab] = useState<"whatsapp" | "parent_meeting">("whatsapp");
  
  const [messageTemplate, setMessageTemplate] = useState("Halo Bapak/Ibu wali dari {nama_siswa}, menginformasikan bahwa ananda hari ini {status}. Terima kasih.");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [status, setStatus] = useState("tidak hadir tanpa keterangan");
  
  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const generateMessage = () => {
    if (!selectedStudent) return "";
    return messageTemplate
      .replace("{nama_siswa}", selectedStudent.display_name || "")
      .replace("{status}", status || "");
  };

  const handleSendWhatsApp = () => {
    const text = generateMessage();
    if (!text) return;
    
    // As we don't store actual phone numbers in this MVP, we just open a WA link 
    // that the teacher can forward, or we can use a dummy number if we had one.
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Komunikasi & Orang Tua</h2>
          <p className="mt-1 text-sm text-slate-500">
            Kirim pesan instan via WhatsApp dan siapkan materi pertemuan orang tua.
          </p>
        </div>
      </div>

      <div className="flex rounded-xl bg-slate-100 p-1 w-full max-w-sm">
        <button
          onClick={() => setActiveTab("whatsapp")}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
            activeTab === "whatsapp" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Pesan Instan (WA)
        </button>
        <button
          onClick={() => setActiveTab("parent_meeting")}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
            activeTab === "parent_meeting" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Pertemuan Wali
        </button>
      </div>

      {activeTab === "whatsapp" && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
            <div className="grid size-10 place-items-center rounded-full bg-green-100 text-green-600">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-950">Komposer WhatsApp</h3>
              <p className="text-sm text-slate-500">Buat pesan otomatis untuk orang tua murid</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800">Pilih Siswa</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-slate-950 outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.display_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800">Status / Kondisi</label>
                <input
                  type="text"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-slate-950 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800">Templat Pesan</label>
                <textarea
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  rows={4}
                  className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-slate-950 outline-none focus:border-indigo-500"
                />
                <p className="mt-2 text-xs text-slate-500">Gunakan tag {'{nama_siswa}'} dan {'{status}'} untuk data dinamis.</p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6 border border-slate-100 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-4">Pratinjau Pesan</h4>
                <div className="rounded-2xl rounded-tl-sm bg-white p-4 shadow-sm border border-slate-200">
                  <p className="text-slate-800 whitespace-pre-wrap">
                    {generateMessage() || "Pilih siswa terlebih dahulu untuk melihat pratinjau pesan."}
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <Button 
                  onClick={handleSendWhatsApp} 
                  disabled={!selectedStudent}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <Send size={18} className="mr-2" /> Buka di WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === "parent_meeting" && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
            <div className="grid size-10 place-items-center rounded-full bg-indigo-100 text-indigo-600">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-950">Persiapan Pertemuan Wali (Konseling/Rapor)</h3>
              <p className="text-sm text-slate-500">Rangkuman data siswa dalam satu halaman</p>
            </div>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => (
              <div key={student.id} className="rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-indigo-300 transition cursor-pointer">
                <h4 className="font-bold text-slate-900 line-clamp-1">{student.display_name}</h4>
                <p className="text-xs text-slate-500">NISN: {student.local_code || '-'}</p>
                
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <span className="text-[11px] font-medium text-slate-400">
                    Gunakan profil siswa ini saat pertemuan wali.
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
