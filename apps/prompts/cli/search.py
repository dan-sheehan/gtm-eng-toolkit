"""Search for prompts."""

from .indexer import Prompt


def filter_by_tag(prompts: list[Prompt], tag: str | None) -> list[Prompt]:
    """Filter prompts by tag (case-insensitive substring match)."""
    if not tag:
        return prompts
    tag_lower = tag.lower()
    return [p for p in prompts if any(tag_lower in t.lower() for t in p.tags)]


def search_prompts(
    prompts: list[Prompt],
    query: str,
    limit: int = 10,
) -> list[Prompt]:
    """
    Search prompts by substring match in name, description, or tags.
    Returns prompts sorted alphabetically by name.
    """
    if not query:
        return prompts[:limit]

    query_lower = query.lower()
    results = []

    for prompt in prompts:
        # Check name, description, and tags for substring match
        if (query_lower in prompt.name.lower() or
            query_lower in prompt.description.lower() or
            any(query_lower in tag.lower() for tag in prompt.tags)):
            results.append(prompt)

    # Sort alphabetically by name
    results.sort(key=lambda p: p.name.lower())
    return results[:limit]


def find_prompt_by_name(prompts: list[Prompt], name: str) -> Prompt | None:
    """Find a prompt by name (case-insensitive)."""
    name_lower = name.lower()

    # Exact match first
    for prompt in prompts:
        if prompt.name.lower() == name_lower:
            return prompt

    # Substring match fallback
    for prompt in prompts:
        if name_lower in prompt.name.lower():
            return prompt

    return None
