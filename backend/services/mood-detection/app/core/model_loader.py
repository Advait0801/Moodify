import onnxruntime as ort
import numpy as np
import logging
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class ModelLoader:
    def __init__(self, model_path: str):
        self.model_path = model_path
        self.session: Optional[ort.InferenceSession] = None
        self.input_name: Optional[str] = None
        self.output_name: Optional[str] = None

    def load_model(self):
        try:
            sess_options = ort.SessionOptions()
            sess_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL

            providers = ['CPUExecutionProvider']
            logger.info(f"Loading ONNX model from {self.model_path}")
            self.session = ort.InferenceSession(
                self.model_path,
                sess_options=sess_options,
                providers=providers
            )

            self.input_name = self.session.get_inputs()[0].name
            self.output_name = self.session.get_outputs()[0].name

            input_shape = self.session.get_inputs()[0].shape
            logger.info(f"Model loaded successfully. Input shape: {input_shape}")
            logger.info(f"Input name: {self.input_name}, Output name: {self.output_name}")
        except Exception as e:
            logger.error(f"Failed to load ONNX model: {str(e)}")
            raise RuntimeError(f"Model loading failed: {str(e)}")

    def predict(self, preprocessed_image: np.ndarray):
        if self.session is None:
            raise RuntimeError("Model not loaded. Call load_model() first.")

        try:
            outputs = self.session.run(
                [self.output_name],
                {self.input_name: preprocessed_image}
            )

            return outputs[0]
        except Exception as e:
            logger.error(f"Inference failed: {str(e)}")
            raise RuntimeError(f"Inference error: {str(e)}")