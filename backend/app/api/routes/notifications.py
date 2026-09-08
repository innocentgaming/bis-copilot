"""Notifications API Routes."""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, Path

from backend.app.api.dependencies import get_request_id
from backend.app.api.schemas.common import ResponseEnvelope, ResponseMeta
from backend.app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get(
    "",
    response_model=ResponseEnvelope[List[Dict[str, Any]]],
    summary="List user notifications",
)
async def list_notifications(
    unread_only: bool = Query(False, description="Filter only unread notifications"),
    type_filter: Optional[str] = Query(None, alias="type", description="Filter by notification type"),
    req_id: str = Depends(get_request_id),
):
    """Retrieve notifications with filtering."""
    notifs = NotificationService.list_notifications(unread_only=unread_only, type_filter=type_filter)
    return ResponseEnvelope(
        success=True,
        data=notifs,
        meta=ResponseMeta(request_id=req_id),
    )


@router.get(
    "/unread-count",
    response_model=ResponseEnvelope[Dict[str, int]],
    summary="Get count of unread notifications",
)
async def get_unread_count(
    req_id: str = Depends(get_request_id),
):
    """Get total count of unread notifications."""
    count = NotificationService.get_unread_count()
    return ResponseEnvelope(
        success=True,
        data={"unread_count": count},
        meta=ResponseMeta(request_id=req_id),
    )


@router.patch(
    "/{notification_id}/read",
    response_model=ResponseEnvelope[Dict[str, Any]],
    summary="Mark single notification as read",
)
async def mark_notification_read(
    notification_id: str = Path(..., description="Notification ID"),
    req_id: str = Depends(get_request_id),
):
    """Mark a notification as read."""
    success = NotificationService.mark_as_read(notification_id)
    return ResponseEnvelope(
        success=success,
        data={"id": notification_id, "is_read": True},
        meta=ResponseMeta(request_id=req_id),
    )


@router.post(
    "/mark-all-read",
    response_model=ResponseEnvelope[Dict[str, Any]],
    summary="Mark all notifications as read",
)
async def mark_all_notifications_read(
    req_id: str = Depends(get_request_id),
):
    """Mark all notifications as read."""
    count = NotificationService.mark_all_as_read()
    return ResponseEnvelope(
        success=True,
        data={"marked_count": count},
        meta=ResponseMeta(request_id=req_id),
    )
