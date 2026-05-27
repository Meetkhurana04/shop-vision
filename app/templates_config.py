# app/templates_config.py
# ─────────────────────────────────────────────────────────────
# Single shared Jinja2Templates instance.
# All routers import from here so globals (settings) are available
# in every template response, regardless of which router renders it.
# ─────────────────────────────────────────────────────────────

from fastapi.templating import Jinja2Templates
from app.config import settings

templates = Jinja2Templates(directory="app/templates")

# Make settings accessible in every Jinja2 template as {{ settings.APP_NAME }}
templates.env.globals["settings"] = settings
