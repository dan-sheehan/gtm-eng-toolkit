#!/usr/bin/env python3
"""Seed databases with sample data for demo purposes."""

import sys


def main():
    print("Seeding sample data...")
    print("\nPrompts are loaded from markdown files in apps/prompts/data/ — no seeding needed.")
    print("Playbook and sales tools generate data on-the-fly via Claude CLI.")
    print("Done! Run './hub start' to launch the apps.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
