from fastapi import APIRouter, File, UploadFile, HTTPException, Request
from fastapi.responses import JSONResponse
from typing import Dict
import logging
from app.services.inference import InferenceService
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.SERVICE_NAME
    }

@router.post("/infer/mood")
async def infer_mood(file: UploadFile = File(...), request: Request = None):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        image_bytes = await file.read()
    except Exception as e:
        logger.error(f"Failed to read file: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to read file")

    max_size_bytes = settings.MAX_IMAGE_SIZE_MB * 1024 * 1024
    if len(image_bytes) > max_size_bytes:
        raise HTTPException(status_code=400, detail=f"Image size exceed limit of {settings.MAX_IMAGE_SIZE_MB}MB")

    if request is None:
        raise HTTPException(status_code=500, detail="Request object not available")
    inference_service: InferenceService = request.app.state.inference_service

    try:
        result = inference_service.infer_emotion(image_bytes)
        return JSONResponse(content=result, status_code=200)
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Inference error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during inference")