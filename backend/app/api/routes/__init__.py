"""API v1 routes module assembling all sub-routers."""

from fastapi import APIRouter

from backend.app.api.routes.admin import router as admin_router
from backend.app.api.routes.auth import router as auth_router
from backend.app.api.routes.certification import router as certification_router
from backend.app.api.routes.chat import router as chat_router
from backend.app.api.routes.clauses import router as clauses_router
from backend.app.api.routes.conversations import router as conversations_router
from backend.app.api.routes.documents import router as documents_router
from backend.app.api.routes.evaluation import router as evaluation_router
from backend.app.api.routes.feedback import router as feedback_router
from backend.app.api.routes.health import router as health_router
from backend.app.api.routes.laboratories import router as laboratories_router
from backend.app.api.routes.search import router as search_router
from backend.app.api.routes.standards import router as standards_router
from backend.app.api.routes.bis_services import router as bis_services_router
from backend.app.api.routes.applications import router as applications_router
from backend.app.api.routes.compliance import router as compliance_router
from backend.app.api.routes.faqs import router as faqs_router
from backend.app.api.routes.notifications import router as notifications_router
from backend.app.api.routes.multimodal import router as multimodal_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(chat_router)
api_router.include_router(conversations_router)
api_router.include_router(feedback_router)
api_router.include_router(search_router)
api_router.include_router(standards_router)
api_router.include_router(clauses_router)
api_router.include_router(documents_router)
api_router.include_router(laboratories_router)
api_router.include_router(certification_router)
api_router.include_router(evaluation_router)
api_router.include_router(bis_services_router)
api_router.include_router(applications_router)
api_router.include_router(compliance_router)
api_router.include_router(faqs_router)
api_router.include_router(notifications_router)
api_router.include_router(multimodal_router)
api_router.include_router(admin_router)
api_router.include_router(health_router)
