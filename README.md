# DocxStudio

A web app for editing Word documents with AI. Upload a `.docx`, describe what you want to change in plain language, and download the modified file with all original formatting preserved.

## Overview

I built this because editing DOCX files programmatically usually breaks formatting. This tool uses `python-docx` to make surgical edits while keeping styles intact.

The AI doesn't regenerate your document—it calls specific editing functions ("tools") based on what you ask for. So when you say "change 2025 to 2026", it literally finds and replaces that text, preserving fonts, colors, and layout.

## Features

- Upload any `.docx` file and see a live preview
- Natural language editing ("make all headings blue", "replace the old date")
- Streaming responses so you see progress in real time
- Downloads preserve the original Word formatting
- Dark theme UI

## Tech Stack

**Frontend:** Next.js 16, React 19, Tailwind 4, Framer Motion

**Backend:** FastAPI (Python), python-docx for document manipulation

**AI:** Connects to my Nexus Gateway which routes to Gemini/OpenAI with tool calling

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 20+
- Access to an OpenAI-compatible API (or my Nexus Gateway)

### Local Development

```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate  # or source venv/bin/activate on Mac/Linux
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`

### Docker

```bash
docker compose up
```

### Environment Variables

Create `.env` in the root:

```
NEXUS_GATEWAY_URL=https://api.ramsesdb.tech
NEXUS_API_KEY=your_key
```

## Project Structure

```
docx-studio/
├── backend/
│   ├── main.py              # FastAPI with streaming endpoint
│   ├── services/
│   │   ├── editor.py        # Text replacement logic
│   │   ├── styler.py        # Style modifications
│   │   ├── tools.py         # AI tool definitions
│   │   └── guardrails.py    # Input validation
│   └── utils/
│       └── streamer.py      # SSE event formatting
├── frontend/
│   └── src/
│       ├── app/             # Next.js pages
│       ├── components/      # React components
│       └── lib/             # API client
└── docker-compose.yml
```

## How the AI Works

The backend exposes these tools to the AI:

| Tool | What it does |
|------|--------------|
| `replace_text` | Finds and replaces text throughout the document |
| `change_style` | Modifies colors, bold, italic based on matching criteria |
| `get_document_stats` | Returns paragraph count, table count, styles used |

When you send a message, the AI decides which tool(s) to call, the backend executes them on your actual `.docx` file, and streams back the results.

## Author

Built by [Ramses Briceño](https://ramsesdb.tech)

## License

MIT
