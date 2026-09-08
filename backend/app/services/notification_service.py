"""Notification Centre Service."""

import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

DEFAULT_NOTIFICATIONS = [
    {
        "id": "notif-1",
        "title": "Technical Review Milestone Reached",
        "message": "Your Application BIS-2026-000123 has progressed to Step 3 (Technical Review). Factory scrutiny scheduled.",
        "type": "APPLICATION",
        "link_url": "/applications",
        "is_read": False,
        "priority": "HIGH",
        "created_at": (datetime.now() - timedelta(hours=2)).strftime("%d %b %Y, %I:%M %p")
    },
    {
        "id": "notif-2",
        "title": "Standard Amendment Notification: IS 1293:2019",
        "message": "BIS Sectional Committee ETD 14 has published Amendment 1 for Plugs and Socket-outlets. Review clause changes.",
        "type": "STANDARD",
        "link_url": "/standards",
        "is_read": False,
        "priority": "NORMAL",
        "created_at": (datetime.now() - timedelta(days=1)).strftime("%d %b %Y, %I:%M %p")
    },
    {
        "id": "notif-3",
        "title": "Mandatory QCO Update: Medical Footwear & Equipment",
        "message": "Ministry of Commerce & Industry notified enforcement of QCO 2026 effective next quarter. Ensure licence readiness.",
        "type": "COMPLIANCE",
        "link_url": "/compliance",
        "is_read": True,
        "priority": "HIGH",
        "created_at": (datetime.now() - timedelta(days=3)).strftime("%d %b %Y, %I:%M %p")
    },
    {
        "id": "notif-4",
        "title": "CRS Registration Grant Notification",
        "message": "Registration Certificate R-84001928 for Lithium-ion Battery packs is available for download.",
        "type": "CERTIFICATE",
        "link_url": "/applications",
        "is_read": True,
        "priority": "NORMAL",
        "created_at": (datetime.now() - timedelta(days=5)).strftime("%d %b %Y, %I:%M %p")
    },
    {
        "id": "notif-5",
        "title": "Welcome to BIS Copilot Assistant",
        "message": "Explore 7,000+ Indian Standards, discover certification schemes, track applications, and consult AI 24x7.",
        "type": "ANNOUNCEMENT",
        "link_url": "/standards",
        "is_read": True,
        "priority": "LOW",
        "created_at": (datetime.now() - timedelta(days=7)).strftime("%d %b %Y, %I:%M %p")
    }
]


class NotificationService:
    """Manages notifications and alerts for users."""

    @classmethod
    def list_notifications(cls, unread_only: bool = False, type_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        """List notifications with optional filters."""
        results = DEFAULT_NOTIFICATIONS
        if unread_only:
            results = [n for n in results if not n["is_read"]]
        if type_filter and type_filter.lower() != "all":
            results = [n for n in results if n["type"].lower() == type_filter.lower()]
        return results

    @classmethod
    def mark_as_read(cls, notif_id: str) -> bool:
        """Mark a notification as read."""
        for n in DEFAULT_NOTIFICATIONS:
            if n["id"] == notif_id:
                n["is_read"] = True
                return True
        return False

    @classmethod
    def mark_all_as_read(cls) -> int:
        """Mark all notifications as read."""
        count = 0
        for n in DEFAULT_NOTIFICATIONS:
            if not n["is_read"]:
                n["is_read"] = True
                count += 1
        return count

    @classmethod
    def get_unread_count(cls) -> int:
        """Count unread notifications."""
        return sum(1 for n in DEFAULT_NOTIFICATIONS if not n["is_read"])
