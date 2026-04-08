export function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-background p-4">
      <div className="flex-1 overflow-auto rounded-[30px] bg-card">
        {children}
      </div>
    </main>
  )
}
