#!/bin/sh

# Shared by the pre-commit and pre-push hooks. Sourced, not run.
# run_step "<name>" "<how to fix>" <command...> runs the command and, when it fails, prints which step failed and how to
# fix it, then aborts the Git operation.

HOOK_NAME=${HOOK_NAME:-hook}

run_step() {
  step_name=$1
  step_fix=$2
  shift 2
  if "$@"; then
    return 0
  fi
  {
    echo ""
    echo "======================================================================"
    echo "  git $HOOK_NAME stopped: the \"$step_name\" check failed (see the output above)."
    echo ""
    echo "  How to fix:"
    echo "    $step_fix"
    echo ""
    echo "  The hook checks the files on disk, so uncommitted changes count too."
    if [ -n "$(git status --porcelain)" ]; then
      echo "  You have uncommitted changes; they may be the cause:"
      git status --short | sed 's/^/      /'
    fi
    echo ""
    echo "  Then run \"npm run check\" to confirm every check passes, and try again."
    echo "======================================================================"
    echo ""
  } >&2
  exit 1
}
