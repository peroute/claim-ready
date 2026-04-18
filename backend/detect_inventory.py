"""Inventory detection module.

Fuses keyframes and narration chunks (via a vision-language model) to
identify damaged items in the walkthrough and emit `InventoryItem`
objects with category, damage description, confidence, and provenance
back to the source frames/narration.
"""

# TODO: Implement multimodal item + damage detection using Gemini.
