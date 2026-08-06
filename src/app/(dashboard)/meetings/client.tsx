"use client";

import { useTransition, useState } from "react";
import { Plus, Users, MapPin, Target, CheckCircle2 } from "lucide-react";
import { createMeeting, createMeetingDecision } from "./actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const initialMeetingState = { success: false, message: "" };
const initialDecisionState = { success: false, message: "" };

type MeetingItem = Record<string, unknown> & {
  id?: string;
  name?: string;
  date?: string;
  location?: string;
};

type DecisionItem = Record<string, unknown> & {
  id?: string;
  meeting_id?: string;
  decision?: string;
  status?: string;
};

export function MeetingsClient({ meetings, decisions }: { meetings: MeetingItem[], decisions: DecisionItem[] }) {
  const [pendingMeeting, startTransitionMeeting] = useTransition();
  const [pendingDecision, startTransitionDecision] = useTransition();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState<string | null>(null);

  const handleMeetingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransitionMeeting(async () => {
      try {
        await createMeeting(formData);
      } catch (e: any) {
        if (e?.message?.includes("NEXT_REDIRECT")) throw e;
        toast.error("Terjadi kesalahan.");
      }
    });
  };

  const handleDecisionSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransitionDecision(async () => {
      try {
        await createMeetingDecision(formData);
      } catch (e: any) {
        if (e?.message?.includes("NEXT_REDIRECT")) throw e;
        toast.error("Terjadi kesalahan.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Rapat & Keputusan</h2>
          <p className="mt-1 text-sm text-slate-500">
            Arsip rapat sekolah dan tindak lanjut keputusan bersama.
          </p>
        </div>
        {!isFormOpen && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus size={18} className="mr-2" />
            Jadwalkan Rapat
          </Button>
        )}
      </div>

      {isFormOpen && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-950 mb-4">Jadwalkan Rapat</h3>
          <form onSubmit={handleMeetingSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-800">
                Topik Rapat
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                placeholder="Contoh: Rapat Evaluasi Bulanan"
              />
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="date" className="block text-sm font-semibold text-slate-800">
                  Tanggal
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-semibold text-slate-800">
                  Lokasi (Opsional)
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  placeholder="Contoh: Ruang Guru"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={pendingMeeting}>
                {pendingMeeting ? "Menyimpan..." : "Simpan Rapat"}
              </Button>
            </div>
          </form>
        </section>
      )}

      {meetings.length === 0 && !isFormOpen ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 py-16 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-slate-100 text-slate-400">
            <Users size={24} />
          </div>
          <h3 className="mt-4 font-semibold text-slate-950">Belum ada jadwal rapat</h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Jadwalkan rapat dan catat hasil keputusannya agar semua guru terinfo.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <div key={meeting.id} className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">{meeting.name}</h3>
                    <div className="mt-2 flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center">
                        <Users size={16} className="mr-1 text-slate-400" />
                        {meeting.date ? new Date(meeting.date).toLocaleDateString("id-ID", {
                          day: "numeric", month: "long", year: "numeric"
                        }) : "-"}
                      </span>
                      {meeting.location && (
                        <span className="flex items-center">
                          <MapPin size={16} className="mr-1 text-slate-400" />
                          {meeting.location}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Button variant="secondary" onClick={() => setActiveMeeting(activeMeeting === meeting.id ? null : (meeting.id || null))}>
                    {activeMeeting === meeting.id ? "Batal Tambah" : "+ Tambah Keputusan"}
                  </Button>
                </div>

                {activeMeeting === meeting.id && (
                  <form onSubmit={handleDecisionSubmit} className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <input type="hidden" name="meeting_id" value={meeting.id} />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="decision"
                        required
                        placeholder="Contoh: Seluruh wali kelas mengumpulkan data portofolio Jumat ini"
                        className="flex-1 rounded-xl border border-slate-300 p-2 text-sm text-slate-950 outline-none focus:border-indigo-500"
                      />
                      <Button type="submit" disabled={pendingDecision}>Simpan</Button>
                    </div>
                  </form>
                )}

                <div className="mt-6 border-t border-slate-100 pt-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Target size={16} className="text-indigo-500" /> Hasil Keputusan
                  </h4>
                  
                  {decisions.filter(d => d.meeting_id === meeting.id).length === 0 ? (
                    <p className="text-sm text-slate-500 italic">Belum ada keputusan tercatat.</p>
                  ) : (
                    <ul className="space-y-2">
                      {decisions.filter(d => d.meeting_id === meeting.id).map(d => (
                        <li key={d.id} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                          <CheckCircle2 size={16} className={d.status === 'completed' ? 'text-emerald-500 mt-0.5' : 'text-slate-300 mt-0.5'} />
                          <div className="flex-1">
                            <p className={`text-sm ${d.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                              {d.decision}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
