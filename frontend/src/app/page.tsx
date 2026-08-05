export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold">
          Turki AI OS
        </h1>

        <p className="text-zinc-400 text-xl">
          Enterprise AI Operating System
        </p>

        <button className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 transition">
          Launch Workspace
        </button>
      </div>
    </main>
  )
}