import { DailyUpdate, TeamSummary } from '@/types';

const UPDATES_KEY = 'opspilot_updates';
const SUMMARIES_KEY = 'opspilot_summaries';

export function getUpdates(): DailyUpdate[] {
  const stored = localStorage.getItem(UPDATES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveUpdate(update: DailyUpdate): void {
  const updates = getUpdates();
  updates.push(update);
  localStorage.setItem(UPDATES_KEY, JSON.stringify(updates));
}

export function getUpdatesByDate(date: string): DailyUpdate[] {
  return getUpdates().filter((u) => u.date === date);
}

export function getUpdatesByUserAndDate(userId: string, date: string): DailyUpdate | undefined {
  return getUpdates().find((u) => u.userId === userId && u.date === date);
}

export function getSummaries(): TeamSummary[] {
  const stored = localStorage.getItem(SUMMARIES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveSummary(summary: TeamSummary): void {
  const summaries = getSummaries();
  // Replace if exists for same team and date
  const index = summaries.findIndex(
    (s) => s.teamId === summary.teamId && s.date === summary.date
  );
  if (index >= 0) {
    summaries[index] = summary;
  } else {
    summaries.push(summary);
  }
  localStorage.setItem(SUMMARIES_KEY, JSON.stringify(summaries));
}

export function getSummaryByTeamAndDate(teamId: string, date: string): TeamSummary | undefined {
  return getSummaries().find((s) => s.teamId === teamId && s.date === date);
}

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
