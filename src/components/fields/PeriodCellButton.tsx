/** A Month or Year cell's press target. The coded webds cells take no
 *  handler, so the label is a button that fills the 46 × 32 cell. */
export function PeriodCellButton({ label, onPick }: { label: React.ReactNode; onPick: () => void }) {
  return (
    <button type="button" onClick={onPick} className="h-[32px] w-[46px] cursor-pointer">
      {label}
    </button>
  )
}
