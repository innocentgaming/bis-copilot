"""SQLAlchemy Models package for BIS Copilot."""

from backend.app.database.session import Base
from backend.app.models.base import UUIDMixin, TimestampMixin, CreatedTimestampMixin
from backend.app.models.user import User
from backend.app.models.document import Document
from backend.app.models.standard import Standard
from backend.app.models.clause import Clause
from backend.app.models.document_chunk import DocumentChunk
from backend.app.models.product import Product, ProductStandard
from backend.app.models.certification import (
    CertificationScheme,
    StandardCertificationScheme,
    CertificationRequirement,
)
from backend.app.models.laboratory import (
    Laboratory,
    TestRequirement,
    LaboratoryCapability,
)
from backend.app.models.chat import (
    Conversation,
    Message,
    Citation,
    Feedback,
)
from backend.app.models.hallmarking import HallmarkingInfo
from backend.app.models.evaluation import (
    EvaluationQuestion,
    EvaluationRun,
)
from backend.app.models.bis_service import BISService
from backend.app.models.application import Application, ApplicationStatusHistory
from backend.app.models.faq import FAQ
from backend.app.models.notification import Notification
from backend.app.models.compliance import ComplianceRecord

__all__ = [
    "Base",
    "UUIDMixin",
    "TimestampMixin",
    "CreatedTimestampMixin",
    "User",
    "Document",
    "Standard",
    "Clause",
    "DocumentChunk",
    "Product",
    "ProductStandard",
    "CertificationScheme",
    "StandardCertificationScheme",
    "CertificationRequirement",
    "Laboratory",
    "TestRequirement",
    "LaboratoryCapability",
    "Conversation",
    "Message",
    "Citation",
    "Feedback",
    "HallmarkingInfo",
    "EvaluationQuestion",
    "EvaluationRun",
    "BISService",
    "Application",
    "ApplicationStatusHistory",
    "FAQ",
    "Notification",
    "ComplianceRecord",
]
