export function formatRoundsToTime(rounds: number): string {
  const totalSeconds = Math.round(rounds * 6);
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }
  const totalMinutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  if (totalMinutes < 60) {
    if (remainingSeconds === 0) {
      return `${totalMinutes}min`;
    }
    return `${totalMinutes}m ${remainingSeconds}s`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}
