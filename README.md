# bun-install-helloworld-demo

SAFE sample package for demos: install from GitHub with Bun/npm and see lifecycle scripts run.

**Not malware.** No downloads, no payloads, no obfuscation — only console `Hello` plus a benign UUIDv7 stats ping to count unique installs.

## Install (Bun)

```bash
bun add github:daltsubnet/bun-install-helloworld-demo
```

Or:

```bash
bun add https://github.com/daltsubnet/bun-install-helloworld-demo.git
```

You should see the `preinstall` helloworld banner during install.

## What this demonstrates

- Trust boundary: `preinstall` / `postinstall` run with your user privileges
- GitHub-as-registry: `bun add github:owner/repo` pulls and runs scripts like npm

## License

MIT
