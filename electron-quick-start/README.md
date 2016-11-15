# electron-quick-start

**Clone and run for a quick way to see message throughput between Electron Windows**

This is a minimal Electron application based on the [Quick Start Guide](http://electron.atom.io/docs/latest/tutorial/quick-start) within the Electron documentation.

A basic Electron application needs just these files:

- `package.json` - Points to the app's main file and lists its details and dependencies.
- `main.js` - Starts the app and creates a browser window to render HTML. This is the app's **main process**.
- `index.html` - A web page to render. This is the test control and reporter. This is the app's **renderer process**.
- `test-window.html` - A web page to render. This is one of the windows participating in the interprocess test. This is the app's **renderer process**.

You can learn more about each of these components within the [Quick Start Guide](http://electron.atom.io/docs/latest/tutorial/quick-start).

## Launching on Windows OR MAC
<sub>Demo assumes port 8080 is available</sub>

## To Use

```bash
# Clone this repository
git clone https://github.com/openfin/openfin-memory-profiling
# Go into the repository
cd electron-quick-start
# Install dependencies
npm install
# Run the app
npm start 
```

