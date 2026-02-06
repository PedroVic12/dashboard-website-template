export default function ProjectsPage() {
  const projects = [
    { name: 'ONS PLC', tag: 'Work' },
    { name: 'ProjectHub', tag: 'Product' },
    { name: 'Data Science', tag: 'Study' },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl md:text-3xl font-black tracking-tight">Projects</h1>
      <p className="text-slate-500 dark:text-slate-400">
        Rota real: <code className="px-1 rounded bg-slate-100 dark:bg-slate-800">/dashboard/projects</code>
      </p>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {projects.map((p) => (
          <div key={p.name} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="font-black">{p.name}</div>
              <span className="text-xs font-extrabold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                {p.tag}
              </span>
            </div>
            <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Descrição curta do projeto e status.
            </div>
            <button className="mt-4 w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-extrabold hover:bg-slate-50 dark:hover:bg-slate-800">
              Open
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
