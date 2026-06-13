from fastapi import APIRouter

from app.api.v1 import auth, comments, pins, users

router = APIRouter()
router.include_router(auth.router)
router.include_router(users.router)
router.include_router(pins.router)
router.include_router(comments.router)
