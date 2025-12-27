# OpsPilot AI 🚀

OpsPilot AI is an asynchronous daily standup tool designed for small teams to stay aligned without the overhead of daily meetings. It leverages **Google Gemini AI** to summarize daily updates, providing managers with high-level insights into team progress and blockers.

## ✨ Key Features

- **Quick Daily Updates:** Members can submit their "Work Done", "Blockers", and "Confidence Level" in under a minute.
- **AI-Powered Summaries:** Uses Google Gemini (via n8n) to analyze team updates and generate actionable daily reports for managers.
- **Modern Dashboard:** A clean, responsive interface built with React, Tailwind CSS, and shadcn/ui.
- **Secure Integration:** Built-in connection to Supabase for reliable data storage and team management.

## 🛠️ Tech Stack

- **Frontend:** React + Vite + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui + Lucide Icons
- **Backend:** n8n (Serverless Workflows)
- **Database/Auth:** Supabase
- **AI Engine:** Google Gemini
- **Deployment:** Ready for Vercel

## ⚙️ Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/saarthi-ai-77/OpsPilot.git
cd OpsPilot/frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root of the `frontend` directory and add your credentials (see `.env.example`):
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_N8N_SUBMIT_WEBHOOK=your_n8n_submit_webhook_url
VITE_N8N_GET_SUMMARY_WEBHOOK=your_n8n_get_summary_webhook_url
```

### 4. Run the application
```bash
npm run dev
```

## 🚀 Deployment

The application is optimized for **Vercel**. 
1. Push your code to GitHub.
2. Connect your repository to Vercel.
3. Add the environment variables in the Vercel Dashboard.
4. Deploy!

## 📝 License

This project is open-source and available under the MIT License.
