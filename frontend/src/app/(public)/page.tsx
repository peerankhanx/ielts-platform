import Link from "next/link";
import { Button } from "@/components/ui/button";

const modules = [
  { time: "00:00 – 00:30", title: "Listening", duration: "30 MIN", desc: "Four sections of adaptive-streamed audio with synced answer sheets." },
  { time: "00:30 – 01:30", title: "Reading", duration: "60 MIN", desc: "Split-screen passages with highlight, notes, and flagging." },
  { time: "01:30 – 02:30", title: "Writing", duration: "60 MIN", desc: "Full-screen editor with live word count, evaluated on all four criteria." },
  { time: "02:30 – 02:44", title: "Speaking", duration: "~14 MIN", desc: "Recording booth for Parts 1–3, with a cue-card timer." },
];

export default function LandingPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-5 font-mono text-xs uppercase tracking-widest text-primary">
              AI IELTS Preparation Platform
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Practice IELTS the way it&apos;s actually scored.
            </h1>
            <p className="mt-5 max-w-md text-base text-text-soft">
              Bandwise rebuilds the real exam interface, then puts an AI examiner behind
              every Reading, Listening, Writing and Speaking response — scored against
              genuine IELTS band descriptors.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register">
                <Button size="lg">Start free practice</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  I have an account
                </Button>
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-bg-subtle p-6">
            <p className="font-mono text-xs text-text-soft">Predicted band, this session</p>
            <p className="font-display text-5xl font-bold text-primary">7.5</p>
            <p className="mt-2 text-sm text-text-soft">Based on your last 6 practice attempts.</p>
          </div>
        </div>
      </section>

      <section id="modules" className="border-t border-border py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-3xl font-bold">Built like exam day.</h2>
          <p className="mt-2 max-w-lg text-text-soft">
            Students move through Bandwise in the exact sequence of the real test.
          </p>
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {modules.map((m) => (
              <div key={m.title} className="bg-background p-6">
                <p className="font-mono text-xs text-info">{m.time}</p>
                <h3 className="mt-4 font-display text-lg font-semibold">{m.title}</h3>
                <p className="mt-2 text-sm text-text-soft">{m.desc}</p>
                <span className="mt-4 inline-block rounded border border-border px-2 py-1 font-mono text-[11px] text-text-soft">
                  {m.duration}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="institutions" className="border-t border-border py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="font-display text-3xl font-bold">Bring Bandwise to your students.</h2>
          <p className="mx-auto mt-3 max-w-md text-text-soft">
            TechLink Solutions scopes, builds, and deploys the full platform for your institution.
          </p>
          <Link href="/register" className="mt-8 inline-block">
            <Button size="lg">Request a proposal</Button>
          </Link>
        </div>
      </section>
    </>
  );
}
