import numpy as np
import cv2
import logging
from typing import Dict, Optional, Tuple
from app.core.model_loader import ModelLoader
from app.core.config import settings

logger = logging.getLogger(__name__)

class InferenceService:
    def __init__(self, model_loader: ModelLoader):
        self.model_loader = model_loader
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

    def detect_face(self, image: np.ndarray):
        try:
            faces = self.face_cascade.detectMultiScale(
                image,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(settings.MIN_FACE_SIZE, settings.MIN_FACE_SIZE)
            )

            if len(faces) == 0:
                return None
            
            largest_face = max(faces, key=lambda x: x[2] * x[3])
            x, y, w, h = largest_face

            logger.info(f"Face Detected: x={x}, y={y}, w={w}, h={h}")
            return (x, y, w, h)
        except Exception as e:
            logger.error(f"Face detection failed: {str(e)}")
            return None
        
    def preprocess_image(self, image_bytes: bytes):
        try:
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if image is None:
                raise ValueError("Failed to decode image")
            
            height, width = image.shape[:2]
            if height > settings.MAX_IMAGE_DIMENSION or width > settings.MAX_IMAGE_DIMENSION:
                scale = min(
                    settings.MAX_IMAGE_DIMENSION / height,
                    settings.MAX_IMAGE_DIMENSION / width, 
                )
                new_width = int(width * scale)
                new_height = int(height * scale)
                image = cv2.resize(image, (new_width, new_height))
                logger.info(f"Resized image to {new_width}x{new_height}")

            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            face_info = self.detect_face(gray)
            if face_info is None:
                logger.warning("No face detected, using center crop")
                
                h, w = image.shape[:2]
                cx, cy = w // 2, h // 2
                crop_size = min(h, w)
                x = max(0, cx - crop_size // 2)
                y = max(0, cy - crop_size // 2)
                face_roi = image[y:y + crop_size, x:x + crop_size]
            else:
                x, y, w, h = face_info
                padding = int(min(w, h) * 0.2)
                x = max(0, x - padding)
                y = max(0, y - padding)
                w = min(image.shape[1] - x, w + 2 * padding)
                h = min(image.shape[0] - y, h + 2 * padding)
                face_roi = image[y:y + h, x:x + w]

            face_roi = cv2.resize(
                face_roi,
                (settings.MODEL_INPUT_SIZE, settings.MODEL_INPUT_SIZE)
            )
            face_roi = cv2.cvtColor(face_roi, cv2.COLOR_BGR2RGB)
            face_roi = face_roi.astype(np.float32) / 255.0

            mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
            std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
            face_roi = (face_roi - mean) / std
            face_roi = face_roi.transpose(2, 0, 1)
            face_roi = np.expand_dims(face_roi, axis=0)
            # Ensure float32 dtype (not float64)
            face_roi = face_roi.astype(np.float32)
            return face_roi, face_info
        except Exception as e:
            logger.error(f"Image preprocessing failed: {str(e)}")
            raise ValueError(f"Image preprocessing error: {str(e)}")
        
    def infer_emotion(self, image_bytes: bytes):
        try:
            preprocessed_image, face_info = self.preprocess_image(image_bytes)
            predictions = self.model_loader.predict(preprocessed_image)
            probabilities = self._softmax(predictions[0])

            emotion_idx = int(np.argmax(probabilities))
            predicted_emotion = settings.EMOTION_LABELS[emotion_idx]
            confidence = float(probabilities[emotion_idx])
            emotion_probs = {
                emotion: float(prob)
                for emotion, prob in zip(settings.EMOTION_LABELS, probabilities)
            } 

            result = {
                "predicted_emotion": predicted_emotion,
                "confidence": confidence,
                "emotion_probabilities": emotion_probs,
                "face_detected": face_info is not None
            }  

            if face_info:
                result["face_info"] = {
                    "x": int(face_info[0]),
                    "y": int(face_info[1]),
                    "width": int(face_info[2]),
                    "height": int(face_info[3])
                }
        
            logger.info(
                f"Inference complete: {predicted_emotion} "
                f"(confidence: {confidence:.3f})"
            )
            return result
        except Exception as e:
            logger.error(f"Inference failed: {str(e)}")
            raise
        
    @staticmethod
    def _softmax(x: np.ndarray):
        exp_x = np.exp(x - np.max(x))
        return exp_x / exp_x.sum()