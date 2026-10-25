#!/usr/bin/env python3
"""Minimal, private launch-list service for Shore & Grace."""

from __future__ import annotations

import json
import os
import re
import sqlite3
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


DATABASE_PATH = Path(
    os.environ.get(
        "SHORE_SIGNUP_DATABASE",
        "/var/lib/shoreandgrace-signup/subscribers.sqlite3",
    )
)
HOST = os.environ.get("SHORE_SIGNUP_HOST", "127.0.0.1")
PORT = int(os.environ.get("SHORE_SIGNUP_PORT", "8017"))
CONSENT_VERSION = "launch_updates_v1_2026-10-18"
ALLOWED_ORIGINS = {
    "https://shoreandgrace.com",
    "https://www.shoreandgrace.com",
}
EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def normalise_email(value: object) -> str:
    if not isinstance(value, str):
        raise ValueError("Enter a valid email address.")
    email = value.strip().lower()
    if len(email) > 254 or not EMAIL_PATTERN.fullmatch(email):
        raise ValueError("Enter a valid email address.")
    return email


class SubscriberStore:
    def __init__(self, database_path: Path = DATABASE_PATH) -> None:
        self.database_path = database_path

    def initialise(self) -> None:
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        with sqlite3.connect(self.database_path) as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS subscribers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                    consented_at TEXT NOT NULL,
                    consent_version TEXT NOT NULL,
                    source TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'active'
                )
                """
            )

    def add(self, email: str, consent_version: str) -> bool:
        consented_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
        try:
            with sqlite3.connect(self.database_path) as connection:
                connection.execute(
                    """
                    INSERT INTO subscribers
                        (email, consented_at, consent_version, source)
                    VALUES (?, ?, ?, ?)
                    """,
                    (email, consented_at, consent_version, "holding-page"),
                )
        except sqlite3.IntegrityError:
            return False
        return True


STORE = SubscriberStore()


class SignupHandler(BaseHTTPRequestHandler):
    server_version = "ShoreSignup/1.0"

    def do_GET(self) -> None:
        if self.path == "/health":
            self._respond(HTTPStatus.OK, {"status": "ok"})
            return
        self._respond(HTTPStatus.NOT_FOUND, {"error": "Not found."})

    def do_POST(self) -> None:
        if self.path != "/signup":
            self._respond(HTTPStatus.NOT_FOUND, {"error": "Not found."})
            return

        origin = self.headers.get("Origin")
        if origin and origin not in ALLOWED_ORIGINS:
            self._respond(HTTPStatus.FORBIDDEN, {"error": "Origin not allowed."})
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            content_length = 0
        if content_length < 2 or content_length > 4096:
            self._respond(HTTPStatus.BAD_REQUEST, {"error": "Invalid request."})
            return

        try:
            payload = json.loads(self.rfile.read(content_length))
        except (json.JSONDecodeError, UnicodeDecodeError):
            self._respond(HTTPStatus.BAD_REQUEST, {"error": "Invalid request."})
            return

        if payload.get("website"):
            self._respond(HTTPStatus.OK, {"status": "accepted"})
            return
        if payload.get("consent") is not True:
            self._respond(HTTPStatus.BAD_REQUEST, {"error": "Consent is required."})
            return
        if payload.get("consentVersion") != CONSENT_VERSION:
            self._respond(HTTPStatus.BAD_REQUEST, {"error": "Invalid consent version."})
            return

        try:
            email = normalise_email(payload.get("email"))
        except ValueError as error:
            self._respond(HTTPStatus.BAD_REQUEST, {"error": str(error)})
            return

        created = STORE.add(email, CONSENT_VERSION)
        status = HTTPStatus.CREATED if created else HTTPStatus.OK
        self._respond(status, {"status": "subscribed" if created else "already-subscribed"})

    def _respond(self, status: HTTPStatus, payload: dict[str, str]) -> None:
        body = json.dumps(payload, separators=(",", ":")).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format: str, *args: object) -> None:
        return


def main() -> None:
    STORE.initialise()
    server = ThreadingHTTPServer((HOST, PORT), SignupHandler)
    server.serve_forever()


if __name__ == "__main__":
    main()
