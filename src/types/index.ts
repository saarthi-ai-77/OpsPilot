export interface User {
  id: string;
  email: string;
  team_id: string;
  role: 'member' | 'manager';
}

export interface DailyUpdate {
  id: string;
  team_id: string;
  member_id: string;
  work_done: string;
  blockers: string;
  confidence: 'Low' | 'Medium' | 'High';
  date: string;
}

export interface TeamSummary {
  id: string;
  team_id: string;
  date: string;
  summary_text: string;
}
