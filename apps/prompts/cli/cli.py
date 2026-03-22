"""CLI entry point for prompt-cli."""

import click
import pyperclip
from pathlib import Path
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.syntax import Syntax

from .indexer import index_prompts, Prompt
from .search import search_prompts, find_prompt_by_name, filter_by_tag

console = Console()


def substitute_variables(body: str, variables: dict[str, str]) -> str:
    """Replace {{variable}} placeholders with provided values."""
    for key, value in variables.items():
        token = f"{{{{{key}}}}}"
        body = body.replace(token, value)
    return body


def get_missing_variables(prompt: Prompt, provided: dict[str, str]) -> list[str]:
    """Return list of variables that need values."""
    return [v for v in prompt.variables if v not in provided]


@click.group()
@click.version_option(version="0.1.0")
def main():
    """Prompt CLI - Index, search, and run prompts from markdown files."""
    pass


@main.command()
@click.option("--tag", "-t", help="Filter by tag")
def list(tag: str | None):
    """List all available prompts."""
    prompts = filter_by_tag(index_prompts(), tag)

    if not prompts:
        console.print("[yellow]No prompts found.[/yellow]")
        return

    table = Table(title="Available Prompts", show_header=True, header_style="bold cyan")
    table.add_column("Name", style="green")
    table.add_column("Description", style="dim")
    table.add_column("Tags", style="blue")
    table.add_column("Variables", style="magenta")

    for prompt in prompts:
        table.add_row(
            prompt.name,
            prompt.description[:50] + "..." if len(prompt.description) > 50 else prompt.description,
            ", ".join(prompt.tags) if prompt.tags else "-",
            ", ".join(prompt.variables) if prompt.variables else "-",
        )

    console.print(table)
    console.print(f"\n[dim]Total: {len(prompts)} prompts[/dim]")


@main.command()
@click.argument("query")
@click.option("--tag", "-t", help="Filter by tag")
@click.option("--limit", "-l", default=10, help="Max results to show")
def search(query: str, tag: str | None, limit: int):
    """Search prompts by name, description, or tags."""
    prompts = filter_by_tag(index_prompts(), tag)
    results = search_prompts(prompts, query, limit=limit)

    if not results:
        console.print(f"[yellow]No prompts found matching '{query}'[/yellow]")
        return

    table = Table(title=f"Search Results for '{query}'", show_header=True, header_style="bold cyan")
    table.add_column("Name", style="green")
    table.add_column("Description", style="dim")
    table.add_column("Tags", style="blue")

    for prompt in results:
        table.add_row(
            prompt.name,
            prompt.description[:40] + "..." if len(prompt.description) > 40 else prompt.description,
            ", ".join(prompt.tags) if prompt.tags else "-",
        )

    console.print(table)


@main.command()
@click.argument("name")
@click.option("--var", "-v", multiple=True, help="Variable in format name=value")
@click.option("--copy", "output", flag_value="clipboard", default=True, help="Copy to clipboard (default)")
@click.option("--stdout", "output", flag_value="stdout", help="Print to stdout")
@click.option("--file", "-f", "output_file", type=click.Path(), help="Write to file")
def run(name: str, var: tuple[str, ...], output: str, output_file: str | None):
    """Run a prompt with variable substitution."""
    prompt = find_prompt_by_name(index_prompts(), name)

    if not prompt:
        console.print(f"[red]Prompt '{name}' not found.[/red]")
        console.print("[dim]Use 'prompt search' to find available prompts.[/dim]")
        return

    # Parse variables
    variables = {}
    for v in var:
        if "=" not in v:
            console.print(f"[red]Invalid variable format: {v}. Use name=value[/red]")
            return
        key, value = v.split("=", 1)
        variables[key] = value

    # Check for missing variables
    missing = get_missing_variables(prompt, variables)
    if missing:
        console.print(f"[yellow]Prompt requires variables: {', '.join(missing)}[/yellow]")
        for var_name in missing:
            value = click.prompt(f"  {var_name}")
            variables[var_name] = value

    # Substitute and output
    filled = substitute_variables(prompt.body, variables)

    if output_file:
        Path(output_file).write_text(filled, encoding="utf-8")
        console.print(f"[green]✓[/green] Wrote '{prompt.name}' to {output_file}")
    elif output == "stdout":
        console.print(filled)
    else:
        pyperclip.copy(filled)
        console.print(f"[green]✓[/green] Copied '{prompt.name}' to clipboard")
        console.print(Panel(
            Syntax(filled[:500] + ("..." if len(filled) > 500 else ""), "markdown", theme="monokai"),
            title="Preview",
            border_style="dim",
        ))


@main.command()
@click.argument("name")
def show(name: str):
    """Show full details of a prompt."""
    prompt = find_prompt_by_name(index_prompts(), name)

    if not prompt:
        console.print(f"[red]Prompt '{name}' not found.[/red]")
        return

    console.print(Panel(
        f"[bold]{prompt.name}[/bold]\n\n"
        f"[dim]Source:[/dim] {prompt.source_file}\n"
        f"[dim]Description:[/dim] {prompt.description or 'None'}\n"
        f"[dim]Tags:[/dim] {', '.join(prompt.tags) or 'None'}\n"
        f"[dim]Variables:[/dim] {', '.join(prompt.variables) or 'None'}",
        title="Prompt Details",
        border_style="cyan",
    ))

    console.print("\n[bold]Body:[/bold]")
    console.print(Panel(
        Syntax(prompt.body, "markdown", theme="monokai"),
        border_style="dim",
    ))


if __name__ == "__main__":
    main()
