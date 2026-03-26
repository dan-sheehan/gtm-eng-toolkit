#!/bin/bash
# GTM Signal Dashboard – fetch signals via Claude CLI with MCP tools
# Usage: ./fetch.sh            (run manually)
#        crontab: 0 6 * * *    (daily at 6 AM)
#
# MCP tool names include UUIDs that are specific to your Claude Code
# installation. If tool calls fail, run `claude mcp list` to find the
# correct server names, then update the --allowedTools below.

set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
PROMPT_FILE="$DIR/prompt.md"
OUTPUT_DIR="$HOME/.morning-brief"

mkdir -p "$OUTPUT_DIR"

# Source shell profile so `claude` is in PATH (needed for cron)
if [ -f "$HOME/.zprofile" ]; then
  source "$HOME/.zprofile" 2>/dev/null || true
fi
if [ -f "$HOME/.zshrc" ]; then
  source "$HOME/.zshrc" 2>/dev/null || true
elif [ -f "$HOME/.bashrc" ]; then
  source "$HOME/.bashrc" 2>/dev/null || true
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting GTM signal fetch..."

# Allow running from within an existing Claude Code session
unset CLAUDECODE 2>/dev/null || true

# Replace TODAY placeholder in prompt with actual date
PROMPT="$(sed "s/{{TODAY}}/$(date '+%Y-%m-%d')/g" "$PROMPT_FILE")"

# Run Claude with MCP tools to gather GTM signals.
# The tool names use UUIDs from your MCP connector configuration.
# To find your UUIDs, run: claude mcp list
# Then update the mcp__<UUID>__<tool> entries below if needed.
claude -p "$PROMPT" \
  --output-format text \
  --allowedTools \
    'Write' \
    'mcp__f7914d85-5afe-4d0d-85f1-c2725f696b95__gmail_search_messages' \
    'mcp__f7914d85-5afe-4d0d-85f1-c2725f696b95__gmail_read_message' \
    'mcp__392b5de9-d7fd-475a-bdcf-365c638ea9a8__gcal_list_events' \
    'mcp__0b6ef9f0-ac6f-4e14-bf9c-39efca243793__notion-search' \
    'mcp__0b6ef9f0-ac6f-4e14-bf9c-39efca243793__notion-fetch' \
  2>&1 || {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: claude command failed (exit $?)"
    exit 1
  }

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Signal fetch complete."
