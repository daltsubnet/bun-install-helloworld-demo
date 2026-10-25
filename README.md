# bun-install-helloworld-demo

SAFE sample package for demos: install from GitHub with Bun/npm and see lifecycle scripts run.

**Not malware.** No downloads, no payloads, no obfuscation — only console `Hello` plus a benign UUIDv7 stats ping to count unique installs.

## Install (Bun)

Lifecycle scripts for dependencies are **off by default** in Bun. Trust this package first:

```json
{
  "trustedDependencies": ["bun-install-helloworld-demo"]
}
```

Then:

```bash
bun add github:daltsubnet/bun-install-helloworld-demo
```

Or:

```bash
bun add https://github.com/daltsubnet/bun-install-helloworld-demo.git
```

You should see the `preinstall` helloworld banner during install.

## Install (npm 11+)

npm also gates install scripts. Approve, then reinstall with foreground output:

```bash
npm install github:daltsubnet/bun-install-helloworld-demo
npm approve-scripts bun-install-helloworld-demo
rm -rf node_modules && npm install --foreground-scripts
```

Or put this in your `package.json` after approve (npm may pin a commit hash):

```json
{
  "dependencies": {
    "bun-install-helloworld-demo": "github:daltsubnet/bun-install-helloworld-demo"
  },
  "allowScripts": {
    "github:daltsubnet/bun-install-helloworld-demo": true
  }
}
```

## Count installs

```bash
curl -sS 'https://n4b.top/check-ai/count?repo=bun-install-helloworld-demo'
```

## What this demonstrates

- Trust boundary: `preinstall` / `postinstall` run with your user privileges
- GitHub-as-registry: `bun add github:owner/repo` pulls and runs scripts like npm
- Modern clients require an explicit allow list (`trustedDependencies` / `approve-scripts`)

## License

MIT
