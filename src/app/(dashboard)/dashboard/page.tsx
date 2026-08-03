import Link from "next/link";
import { ArrowRight, BookOpenText, ChartNoAxesColumnIncreasing, ClipboardCheck, Clock3, Plus, Users, CalendarX2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Beranda" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let schoolName = "Sekolah";
  let userName = "Guru";
  let activeYearId = null;

  let todayClassCount = 0;
  let activeStudentsCount = 0;
  let schedulesData: Record<string, unknown>[] = [];
  
  // 1 = Monday, 7 = Sunday
  const todayDate = new Date();
  const currentDayIndex = todayDate.getDay() === 0 ? 7 : todayDate.getDay();

  if (user) {
    const { data: member } = await supabase
      .from("school_members")
      .select("school_id, schools(name), profiles(display_name)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .single();

    if (member) {
      // @ts-expect-error Supabase types for joined tables might not infer correctly
      schoolName = member.schools?.name || "Sekolah";
      // @ts-expect-error Supabase types for joined tables might not infer correctly
      userName = member.profiles?.display_name || "Guru";

      const { data: activeYear } = await supabase
        .from("academic_years")
        .select("id")
        .eq("school_id", member.school_id)
        .eq("is_active", true)
        .limit(1)
        .single();

      if (activeYear) {
        activeYearId = activeYear.id;

        // Fetch schedules for today
        const { data: rawSchedules } = await supabase
          .from("schedules")
          .select(`
            *,
            teaching_assignments!inner (
              id,
              teacher_id,
              academic_year_id,
              classes ( name ),
              subjects ( name )
            )
          `)
          .eq("school_id", member.school_id)
          .eq("day_of_week", currentDayIndex)
          .eq("teaching_assignments.teacher_id", user.id)
          .eq("teaching_assignments.academic_year_id", activeYearId)
          .order("starts_at", { ascending: true });
          
        if (rawSchedules) {
          schedulesData = rawSchedules;
          todayClassCount = rawSchedules.length;
        }

        // Active students count (unique students in classes this teacher teaches)
        // Since we don't have a direct query to get distinct students easily without custom RPC or doing it in JS,
        // Let's get all classes the teacher teaches, then count unique students.
        const { data: assignments } = await supabase
          .from("teaching_assignments")
          .select("class_id")
          .eq("school_id", member.school_id)
          .eq("teacher_id", user.id)
          .eq("academic_year_id", activeYearId);
          
        if (assignments && assignments.length > 0) {
          const classIds = Array.from(new Set(assignments.map(a => a.class_id)));
          
          const { data: students } = await supabase
            .from("class_students")
            .select("student_id")
            .in("class_id", classIds);
            
          if (students) {
            const uniqueStudents = new Set(students.map(s => s.student_id));
            activeStudentsCount = uniqueStudents.size;
          }
        }
      }
    }
  }

  // Indonesian date formatting for the eyebrow
  const formatter = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  const todayStr = formatter.format(todayDate);

  const pendingItems: Record<string, unknown>[] = []; // Empty for now until Wave 2/3

  return (
    <div>
      <PageHeader 
        eyebrow={todayStr} 
        title={`Selamat datang, ${userName} di ${schoolName}`} 
        description="Lihat kelas berikutnya dan selesaikan pekerjaan yang paling mendesak." 
        action={<Link href="/record" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white"><Plus size={18} />Catat kegiatan</Link>} 
      />
      
      {!activeYearId && (
        <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950 mb-8">
          <h2 className="text-lg font-bold">Tahun Ajaran Belum Diatur</h2>
          <p className="mt-2 text-sm text-amber-800">
            Minta admin sekolah mengatur tahun ajaran aktif agar data kelas dan jadwal dapat ditampilkan.
          </p>
        </div>
      )}

      <section aria-labelledby="ringkasan" className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <h2 id="ringkasan" className="sr-only">Ringkasan</h2>
        {[
          { label: 'Kelas hari ini', value: todayClassCount.toString(), icon: Clock3 },
          { label: 'Murid aktif', value: activeStudentsCount.toString(), icon: Users },
          { label: 'Presensi selesai', value: '0/0', icon: ClipboardCheck },
          { label: 'Nilai tertunda', value: '0', icon: ChartNoAxesColumnIncreasing }
        ].map(({ label, value, icon: Icon }) => (
          <article key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-2xl bg-indigo-50 text-indigo-700">
                <Icon size={20} />
              </span>
              <ArrowRight size={17} className="text-slate-300" />
            </div>
            <p className="mt-5 text-2xl font-bold text-slate-950">{value}</p>
            <p className="mt-1 text-sm text-slate-600">{label}</p>
          </article>
        ))}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Jadwal hari ini</h2>
              <p className="mt-1 text-sm text-slate-500">Mulai dari kelas berikutnya.</p>
            </div>
            <Link href="/schedules" className="text-sm font-semibold text-indigo-700">Lihat semua</Link>
          </div>
          
          <div className="mt-5 space-y-3">
            {schedulesData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500">
                <CalendarX2 size={40} className="mb-3 text-slate-300" />
                <p>Tidak ada jadwal mengajar hari ini.</p>
              </div>
            ) : (
              schedulesData.map((item) => {
                const assignment = item.teaching_assignments as Record<string, unknown>;
                const className = (assignment?.classes as Record<string, unknown>)?.name as string || "Tanpa Kelas";
                const subject = (assignment?.subjects as Record<string, unknown>)?.name as string || "Tanpa Mapel";
                const timeStr = `${(item.starts_at as string).slice(0, 5)} - ${(item.ends_at as string).slice(0, 5)}`;
                const roomStr = item.room ? item.room as string : "-";

                return (
                <article key={item.id as string} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center">
                    <div className="shrink-0 text-sm font-bold text-indigo-700 sm:w-28">{timeStr}</div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-slate-950">{className} · {subject}</h3>
                      <p className="text-sm text-slate-500">{roomStr}</p>
                    </div>
                    <Link href={`/record?assignment_id=${assignment.id as string}&date=${todayDate.toISOString().split('T')[0]}`} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                      Catat kelas
                    </Link>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-bold text-slate-950">Perlu perhatian</h2>
          <div className="mt-5 space-y-4">
            {pendingItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                Semua tugas sudah diselesaikan. Keren!
              </div>
            ) : (
              pendingItems.map(item => (
                <article key={item.title as string} className="rounded-2xl bg-slate-50 p-4">
                  <Badge tone={item.tone as "neutral" | "success" | "warning" | "danger" | undefined}>{item.tone === 'warning' ? 'Belum lengkap' : item.tone === 'danger' ? 'Tindak lanjut' : 'Tertunda'}</Badge>
                  <h3 className="mt-3 font-semibold text-slate-950">{item.title as string}</h3>
                  <p className="mt-1 text-sm leading-5 text-slate-600">{item.detail as string}</p>
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-3xl bg-indigo-600 p-6 text-white sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-100">
              <BookOpenText size={18} />
              <span className="text-sm font-semibold">Prinsip Teman Guru</span>
            </div>
            <h2 className="mt-2 text-2xl font-bold">Selesaikan satu catatan, pakai datanya di banyak laporan.</h2>
          </div>
          <Link href="/record" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-indigo-700">Catat kegiatan</Link>
        </div>
      </section>
    </div>
  );
}
