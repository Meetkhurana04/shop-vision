from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class DashboardWidgetCreate(BaseModel):
    widget_type: str
    position: int = 0
    config: Optional[str] = None
    is_visible: bool = True

class DashboardWidgetUpdate(BaseModel):
    position: Optional[int] = None
    config: Optional[str] = None
    is_visible: Optional[bool] = None

class DashboardWidgetRead(BaseModel):
    id: int
    user_id: int
    widget_type: str
    position: int
    config: Optional[str]
    is_visible: bool
    created_at: datetime

    model_config = {"from_attributes": True}
