"use client";

import { useState, useRef, useEffect } from "react";

interface CameraCaptureProps {
  onCapture: (file: File | null) => void;
  onError?: (message: string) => void;
}

export function CameraCapture({ onCapture, onError }: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let currentStream: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user", width: 640, height: 480 } })
      .then((s) => {
        currentStream = s;
        setStream(s);
        setError(null);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch((err) => {
        const msg = err.name === "NotAllowedError"
          ? "Camera access denied. Please allow camera permission."
          : "Could not access camera.";
        setError(msg);
        onError?.(msg);
      });
    return () => {
      currentStream?.getTracks().forEach((t) => t.stop());
    };
  }, [onError]);

  function capture() {
    const video = videoRef.current;
    if (!video || !stream || video.readyState !== 4) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
        setCapturedImage(canvas.toDataURL("image/jpeg"));
        stream.getTracks().forEach((t) => t.stop());
        setStream(null);
        onCapture(file);
      },
      "image/jpeg",
      0.9
    );
  }

  function reset() {
    setCapturedImage(null);
    onCapture(null);
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user", width: 640, height: 480 } })
      .then((s) => {
        setStream(s);
        setError(null);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch((err) => {
        const msg = err.name === "NotAllowedError"
          ? "Camera access denied."
          : "Could not access camera.";
        setError(msg);
      });
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-surface border border-border">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (capturedImage) {
    return (
      <div className="space-y-3">
        <img
          src={capturedImage}
          alt="Captured"
          className="w-full max-h-64 object-contain rounded-lg border border-border"
        />
        <button
          type="button"
          onClick={reset}
          className="text-sm text-secondary hover:opacity-80"
        >
          Retake photo
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative rounded-lg overflow-hidden border border-border bg-surface aspect-video max-h-64">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      </div>
      <button
        type="button"
        onClick={capture}
        className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
      >
        Capture photo
      </button>
    </div>
  );
}
