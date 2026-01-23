# DocxStudio Backend

FastAPI backend for DOCX document manipulation with style preservation.

## Setup

```bash
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

## Endpoints

- `POST /api/upload` - Upload DOCX file
- `POST /api/replace` - Find/replace text
- `POST /api/style` - Modify styles
- `POST /api/ai-suggest` - AI-powered suggestions
- `GET /api/download/{session_id}` - Download modified file
