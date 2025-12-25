export interface User {
  id: string;
  email: string;
  name: string;
  role: 'member' | 'manager';
  teamId: string;
  teamName: string;
}

export interface DailyUpdate {
  id: string;
  userId: string;
  userName: string;
  teamId: string;
  date: string;
  workDone: string;
  blockers: string;
  confidence: 'low' | 'medium' | 'high';
  submittedAt: string;
}

export interface TeamSummary {
  id: string;
  teamId: string;
  teamName: string;
  date: string;
  summary: string;
  generatedAt: string;
}
