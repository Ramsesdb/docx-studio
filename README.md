# 📄 DocxStudio

<p align="center">
  <strong>Web-based DOCX editor with style preservation and AI assistance</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11+-blue?style=flat-square&logo=python" alt="Python">
  <img src="https://img.shields.io/badge/FastAPI-0.109+-green?style=flat-square&logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Vite-5+-646CFF?style=flat-square&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="License">
</p>

---

## ✨ Features

- **📤 Drag & Drop Upload** - Simple file upload with instant document parsing
- **🔍 Find & Replace** - Bulk text replacement preserving original formatting
- **🎨 Style Changes** - Modify colors, bold, italic across matching text
- **🤖 AI Assistant** - Describe changes in natural language
- **📥 Download** - Export your edited document maintaining all styles
- **🌙 Dark Mode** - Beautiful modern dark theme UI

## 🖥️ Screenshot

```
┌─────────────────────────────────────────────────────────────┐
│  🔷 DocxStudio                           [New] [Download]   │
├─────────────────────────────────────────────────────────────┤
│                        │                                    │
│    Document Preview    │   🔍 Find & Replace               │
│    ───────────────     │   ────────────────                │
│                        │   Find: [2025       ]             │
│    [Your document      │   Replace: [2026    ]             │
│     rendered as        │   [+ Add More] [Apply]            │
│     styled HTML]       │                                    │
│                        │   🎨 Change Styles                │
│                        │   ─────────────────                │
│                        │   Match: ● Bold ○ Red             │
│                        │   Apply: ● Purple                 │
│                        │                                    │
│                        │   🤖 AI Assistant                 │
│                        │   "Change all dates to 2026..."   │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Local Development

**1. Start Backend:**
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**2. Start Frontend (new terminal):**
```bash
cd frontend
npm install
npm run dev
```

**3. Open:** http://localhost:3000

### Docker (Local)

```bash
docker-compose -f docker-compose.dev.yml up --build
```
Open http://localhost:3000

### Docker (Production - Coolify)

```bash
# In Coolify, point to this repo and use docker-compose.yml
# Configure environment variables:
# - NEXUS_GATEWAY_URL=https://api.ramsesdb.tech
# - NEXUS_API_KEY=your_key
```

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Frontend    │────▶│     Backend     │────▶│  Nexus Gateway  │
│  React + Vite   │     │    FastAPI      │     │   (AI API)      │
│    Port 3000    │     │   Port 8000     │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 📁 Project Structure

```
docx-studio/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── services/
│   │   ├── parser.py        # DOCX → JSON
│   │   ├── editor.py        # Text replacement
│   │   ├── styler.py        # Style modifications
│   │   └── ai_assistant.py  # AI integration
│   ├── models/
│   │   └── schemas.py       # Pydantic models
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── DropZone.jsx
│   │   │   ├── DocumentPreview.jsx
│   │   │   ├── ReplacePanel.jsx
│   │   │   ├── StylePanel.jsx
│   │   │   └── AiChat.jsx
│   │   └── styles/
│   │       └── index.css
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload DOCX file |
| `POST` | `/api/replace` | Find & replace text |
| `POST` | `/api/style` | Modify styles |
| `POST` | `/api/ai-suggest` | Get AI suggestions |
| `GET` | `/api/download/{id}` | Download edited file |

## 🎯 Use Cases

- **Bulk Updates**: Change "2025" to "2026" across all documents
- **Rebranding**: Replace company names while keeping formatting
- **Style Fixes**: Convert all red bold text to purple
- **AI Editing**: "Make all headings blue and remove italic from body"

## 🛠️ Tech Stack

**Backend:**
- Python 3.11+
- FastAPI
- python-docx
- Pydantic

**Frontend:**
- React 18
- Vite 5
- react-dropzone
- Vanilla CSS (custom design system)

## 📜 License

MIT License - feel free to use this project for personal or commercial purposes.

## 👤 Author

**Ramses Briceño**

- Portfolio: [ramsesdb.tech](https://ramsesdb.tech)
- GitHub: [@Ramsesdb](https://github.com/Ramsesdb)

---

<p align="center">
  Made with ☕ and 🎵
</p>
