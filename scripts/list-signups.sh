#!/usr/bin/env bash

set -euo pipefail

ssh -tt -i "$HOME/.ssh/id_ed25519" troy@66.29.139.124 \
  "sudo python3 -c \"import sqlite3; connection=sqlite3.connect('/var/lib/shoreandgrace-signup/subscribers.sqlite3'); rows=connection.execute('SELECT email, consented_at, status FROM subscribers ORDER BY consented_at').fetchall(); print('COUNT', len(rows)); [print(row[0] + '\\\\t' + row[1] + '\\\\t' + row[2]) for row in rows]\""
