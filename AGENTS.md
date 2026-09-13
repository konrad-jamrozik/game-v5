# Repository agent instructions

Before running an npm script, verify that `node` and `npm` are available with `Get-Command` on Windows or `command -v`
on POSIX systems. Do not discover a missing package manager by attempting the script. Follow the Agent environment setup
in `README.md` when the toolchain is unavailable.

Before declaring repository changes complete, run `npm run check` and report any failures. Do not treat a clean deterministic specification lint as proof of semantic or gameplay correctness.

Use `npm run lint:specs` first when checking specifications or artifact relationships.
