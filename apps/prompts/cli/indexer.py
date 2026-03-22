"""Index prompts from markdown files."""

import re
from dataclasses import dataclass
from pathlib import Path

from .config import TEMPLATES_DIR, PROMPT_FILE_PATTERNS


@dataclass
class Prompt:
    """A single prompt extracted from markdown."""
    name: str
    description: str
    tags: list[str]
    variables: list[str]
    body: str
    source_file: str
    type: str = "template"


def parse_markdown_file(file_path: Path, base_dir: Path | None = None) -> list[Prompt]:
    """Extract prompts from a markdown file."""
    content = file_path.read_text(encoding="utf-8")
    prompts = []
    base_dir = base_dir or TEMPLATES_DIR.parent

    # Split by ## headers (level 2 headings are prompts)
    pattern = r"^## (.+?)$(.+?)(?=^## |\n---\n|^---$|\Z)"
    matches = re.findall(pattern, content, re.MULTILINE | re.DOTALL)

    for name, body in matches:
        name = name.strip()
        body = body.strip()

        # Skip if this looks like a section header with sub-items (like prompt_library.md index)
        if body.startswith(">") and "`" in body and len(body.split("\n")) < 5:
            continue

        # Extract description from **Use when:** pattern
        description = ""
        desc_match = re.search(r"\*\*Use when:\*\*\s*(.+?)(?:\n|$)", body)
        if desc_match:
            description = desc_match.group(1).strip()
            body = body.replace(desc_match.group(0), "").strip()

        # Extract tags
        tags = []
        tags_match = re.search(r"^Tags?:\s*(.+?)$", body, re.MULTILINE | re.IGNORECASE)
        if tags_match:
            tags = [t.strip() for t in tags_match.group(1).split(",")]
            body = body.replace(tags_match.group(0), "").strip()

        # Extract declared variables
        variables = []
        vars_match = re.search(r"^Variables?:\s*(.+?)$", body, re.MULTILINE | re.IGNORECASE)
        if vars_match:
            variables = [v.strip() for v in vars_match.group(1).split(",")]
            body = body.replace(vars_match.group(0), "").strip()

        # Extract type (ai-prompt or template)
        prompt_type = "template"
        type_match = re.search(r"^Type:\s*(.+?)$", body, re.MULTILINE | re.IGNORECASE)
        if type_match:
            prompt_type = type_match.group(1).strip().lower()
            body = body.replace(type_match.group(0), "").strip()

        # Also find {{variable}} patterns in body
        body_vars = re.findall(r"\{\{(\w+)\}\}", body)
        for v in body_vars:
            if v not in variables:
                variables.append(v)

        body = body.strip()

        if not body:
            continue

        prompts.append(Prompt(
            name=name,
            description=description,
            tags=tags,
            variables=variables,
            body=body,
            source_file=str(_safe_relative_path(file_path, base_dir)),
            type=prompt_type,
        ))

    return prompts


def index_prompts(templates_dir: Path | None = None) -> list[Prompt]:
    """Index all prompts from the templates directory."""
    templates_dir = templates_dir or TEMPLATES_DIR

    prompts = []
    for pattern in PROMPT_FILE_PATTERNS:
        for file_path in templates_dir.glob(pattern):
            prompts.extend(parse_markdown_file(file_path, base_dir=templates_dir.parent))

    return prompts


def _safe_relative_path(file_path: Path, base_dir: Path) -> Path:
    """Return file_path relative to base_dir, or the original path if unrelated."""
    try:
        return file_path.relative_to(base_dir)
    except ValueError:
        return file_path
