/* Shared native JavaScript settings. No installation or build step.
 * Add reviewed HTTPS video sources here before publishing video.
 * An empty sources array keeps demo buttons hidden.
 * Local preview provides existing local videos without changing this file.
 */
window.PORTFOLIO_CONFIG = {
  "media": {
    "digital-decay": {
      "title": "Digital Decay — prototype walkthrough",
      "poster": "assets/digital-decay/archive-1920.jpg",
      "sources": [],
      "version": "v1",
      "duration": "2:49",
      "updated": "2026-11-11",
      "transcript": "The walkthrough opens the photo wall, inspects a memory’s surviving state, reviews recorded evidence and simulated AI inferences, corrects assessments, compares related memories, pauses decay for 30 days, and explores protection and membership limits. Changing an assessment affects future risk and timing; lost image content is not restored."
    },
    "ai-robotic-arm": null
  },
  "projectDrafts": {
    "ai-robotic-arm": {
      "title": "AI Robotic Arm Interactive Game",
      "summary": "A Unity UR3 simulation exploring how object labels, obstacles and game rules influence a robot’s decisions and simulated pick-and-place.",
      "status": "Simulation prototype",
      "screenshots": [],
      "video": null,
      "sections": [
        "Project overview",
        "Interaction and level rules",
        "Implementation record",
        "Testing and revisions",
        "Outcomes and reflection"
      ]
    }
  }
};
