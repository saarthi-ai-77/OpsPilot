import { DailyUpdate } from "@/types";

const SUBMIT_WEBHOOK = import.meta.env.VITE_N8N_SUBMIT_WEBHOOK;
const GET_SUMMARY_WEBHOOK = import.meta.env.VITE_N8N_GET_SUMMARY_WEBHOOK;

export async function submitUpdate(data: Omit<DailyUpdate, 'id' | 'date'>) {
    if (!SUBMIT_WEBHOOK) {
        throw new Error("VITE_N8N_SUBMIT_WEBHOOK is not defined");
    }

    const response = await fetch(SUBMIT_WEBHOOK, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to submit update");
    }

    return response.json();
}

export async function getSummary(teamId: string, date: string) {
    if (!GET_SUMMARY_WEBHOOK) {
        throw new Error("VITE_N8N_GET_SUMMARY_WEBHOOK is not defined");
    }

    const url = new URL(GET_SUMMARY_WEBHOOK);
    url.searchParams.append('team_id', teamId);
    url.searchParams.append('date', date);

    const response = await fetch(url.toString());

    if (!response.ok) {
        throw new Error("Failed to fetch summary");
    }

    return response.json();
}
