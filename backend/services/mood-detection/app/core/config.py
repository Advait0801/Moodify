import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings(BaseSettings):
    SERVICE_NAME: str = "mood-detection-service"
    HOST: str = "0.0.0.0"
    PORT: int = 8001
    MODEL_PATH: str = "./models/mood_mobilenetv2.onnx"
    MODEL_INPUT_SIZE: int = 224
    MODEL_INPUT_CHANNELS: int = 3
    MAX_IMAGE_SIZE_MB: int = 10
    MAX_IMAGE_DIMENSION: int = 2048
    FACE_DETECTION_CONFIDENCE: float = 0.5
    MIN_FACE_SIZE: int = 48

    EMOTION_LABELS: List[str] = [
        "angry",
        "disgust",
        "fear",
        "happy",
        "neutral",
        "sad",
        "surprise"
    ]

    class Config:
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()