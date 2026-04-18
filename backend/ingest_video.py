"""Video ingestion module.

Responsible for taking the claimant's video walkthrough and extracting:
- Sampled keyframes (at `KEYFRAME_FPS`) saved to disk as images.
- An audio track transcribed into time-aligned narration chunks
  (windowed by `NARRATION_CHUNK_SEC`).

Outputs `KeyFrame` and `NarrationChunk` objects for downstream stages.
"""

# TODO: Implement video keyframe extraction (ffmpeg) + audio transcription (Groq Whisper).
