#!/usr/bin/env python3
"""Prepare an isolated staging D1 binding using Wrangler credentials from CI.

Never prints credentials, changes production DBs, or exposes public Worker routes.
Only run in an explicitly approved staging deployment job.
"""
import json
import pathlib
import re
import subprocess

DB_NAME = "trinity-dialogue-staging-db"
CONFIG_PATH = pathlib.Path("wrangler.staging.generated.toml")
BASE_PATH = pathlib.Path("wrangler.staging.toml")
UUID = re.compile(r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")


def wrangler(*arguments):
    return subprocess.run(["npx", "--yes", "wrangler@4", *arguments], check=True, text=True, capture_output=True).stdout


def find_db():
    entries = json.loads(wrangler("d1", "list", "--json"))
    if not isinstance(entries, list):
        raise RuntimeError("Wrangler returned an invalid D1 database list")
    exact = [entry for entry in entries if isinstance(entry, dict) and entry.get("name") == DB_NAME]
    if len(exact) > 1:
        raise RuntimeError("Multiple staging D1 databases have the same name")
    return exact[0] if exact else None


def main():
    db = find_db()
    if db is None:
        # Creates only a dedicated new staging database, with EU jurisdiction.
        wrangler("d1", "create", DB_NAME, "--jurisdiction", "eu")
        db = find_db()
    if db is None:
        raise RuntimeError("Staging D1 database was not found after creation")
    database_id = db.get("uuid") or db.get("id")
    if not isinstance(database_id, str) or not UUID.fullmatch(database_id):
        raise RuntimeError("Invalid database identifier returned by Wrangler")
    if CONFIG_PATH.exists():
        raise RuntimeError("Generated configuration already exists; refusing overwrite")
    base = BASE_PATH.read_text(encoding="utf-8")
    binding = (
        "\n[[d1_databases]]\n"
        'binding = "TRINITY_DB"\n'
        f'database_name = "{DB_NAME}"\n'
        f'database_id = "{database_id}"\n'
    )
    CONFIG_PATH.write_text(base + binding, encoding="utf-8")
    print("Dedicated private staging D1 database ready; generated local Wrangler config.")


if __name__ == "__main__":
    main()
