# app/routers/receipts.py
from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from app.templates_config import templates

router = APIRouter(prefix="/receipts", tags=["receipts"])


@router.get("/capture", response_class=HTMLResponse)
async def capture_page(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="receipts/capture.html",
        context={"page_title": "Capture Receipt"},
    )
