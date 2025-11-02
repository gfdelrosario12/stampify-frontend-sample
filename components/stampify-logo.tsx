export function StampifyLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`font-bold text-xl tracking-tight ${className}`}>
      <span>STAMP</span>
      <span className="text-accent">i</span>
      <span>FY</span>
    </div>
  )
}
