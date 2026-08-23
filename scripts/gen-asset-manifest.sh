#!/usr/bin/env bash
#
# gen-asset-manifest.sh
#
# Regenerates ONLY the auto-generated table (path, size, sha256, last-modified) inside
# docs/ASSET_MANIFEST.md, between the <!-- BEGIN GENERATED --> / <!-- END GENERATED -->
# markers. Everything else in that file — hand-written purpose notes, pivot conventions,
# the platform-target caveat, etc. — is left untouched.
#
# Usage:
#   ./scripts/gen-asset-manifest.sh
#
# (No stdout redirection needed — the script edits docs/ASSET_MANIFEST.md in place.)
#
# Adjust ASSET_DIRS below to match your project layout. These are relative to the repo root.

set -euo pipefail

MANIFEST_FILE="docs/ASSET_MANIFEST.md"
BEGIN_MARKER="<!-- BEGIN GENERATED: scripts/gen-asset-manifest.sh writes only between these two markers -->"
END_MARKER="<!-- END GENERATED -->"

ASSET_DIRS=(
  "public/solarsystem/models"
  "public/tarot"
)

if [ ! -f "$MANIFEST_FILE" ]; then
  echo "error: $MANIFEST_FILE not found. Run this from the repo root." >&2
  exit 1
fi

if ! grep -qF "$BEGIN_MARKER" "$MANIFEST_FILE"; then
  echo "error: BEGIN marker not found in $MANIFEST_FILE. Add it before running this script." >&2
  exit 1
fi

# Build the generated block content
generated=$(
  echo "$BEGIN_MARKER"
  echo
  echo "_Auto-generated $(date -u +"%Y-%m-%dT%H:%M:%SZ"). Do not edit this section by hand —_"
  echo "_re-run \`scripts/gen-asset-manifest.sh\` instead. Everything outside these markers is preserved._"
  echo

  for dir in "${ASSET_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
      echo "_(directory not found: $dir — skipping)_"
      echo
      continue
    fi

    echo "### \`$dir\`"
    echo
    echo "| File | Size | SHA-256 | Last Modified |"
    echo "|---|---|---|---|"

    find "$dir" -maxdepth 1 -type f | sort | while read -r f; do
      name=$(basename "$f")
      size=$(du -h "$f" | cut -f1)
      hash=$(sha256sum "$f" | cut -d' ' -f1 | cut -c1-12)
      mtime=$(date -u -r "$f" +"%Y-%m-%d" 2>/dev/null || echo "unknown")
      echo "| \`$name\` | $size | \`${hash}…\` | $mtime |"
    done
    echo
  done

  echo "$END_MARKER"
)

# Replace only the marked block, in place, preserving everything else in the file
awk -v begin="$BEGIN_MARKER" -v end="$END_MARKER" -v repl="$generated" '
  $0 == begin { print repl; skipping=1; next }
  $0 == end   { skipping=0; next }
  !skipping   { print }
' "$MANIFEST_FILE" > "${MANIFEST_FILE}.tmp"

mv "${MANIFEST_FILE}.tmp" "$MANIFEST_FILE"

echo "Updated generated section in $MANIFEST_FILE"
