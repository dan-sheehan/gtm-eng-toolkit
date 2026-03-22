"""Configuration for prompt-cli."""

from pathlib import Path

# Default templates directory (relative to repo root)
# cli/ -> prompts/ -> apps/ -> repo root = 4 levels
REPO_ROOT = Path(__file__).parent.parent.parent.parent
TEMPLATES_DIR = REPO_ROOT / "data" / "prompts"

# File patterns to index
PROMPT_FILE_PATTERNS = ["*.md"]
