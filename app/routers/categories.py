# app/routers/categories.py
from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from app.templates_config import templates

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_class=HTMLResponse)
async def category_list(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="transactions/index.html",
        context={"page_title": "Categories", "transactions": []},
    )
