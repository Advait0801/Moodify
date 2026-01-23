from pyexpat import model
from fastapi import FastAPI
from contextlib import asynccontextmanager
import logging
from app.core.config import settings
from app.core.model_loader import ModelLoader
from app.services.inference import InferenceService
from app.api.routes import router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

model_loader: ModelLoader = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model_loader
    logger.info("Starting Mood Detection Service")
    logger.info(f"Loading ONNX model from: {settings.MODEL_PATH}")

    try:
        model_loader = ModelLoader(settings.MODEL_PATH)
        model_loader.load_model()
        logger.info("Model loaded successfully")

        app.state.model_loader = model_loader
        app.state.inference_service = InferenceService(model_loader)
    except Exception as e:
        logger.error(f"Failed to load model: {str(e)}")
        raise

    yield
    logger.info("Shutting down Mood Detection Service...")


app = FastAPI(
    title="Mood Detection Service",
    description="Emotion detection from images using ONNX model",
    version="1.0.0",
    lifespan=lifespan
)

app.include_router(router)