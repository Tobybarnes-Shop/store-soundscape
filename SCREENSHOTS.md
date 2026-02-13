# Screenshot Automation Guide

## Overview

Store Soundscape includes automated screenshot scripts to capture visual history of each version across all themes and modes.

## Quick Start

### Option 1: Full Release Process (Recommended)
```bash
npm run release:screenshot
```

This will:
1. Build the production app
2. Start a local server
3. Take screenshots of all 4 themes × 2 modes = 8 screenshots
4. Save them in `screenshots/v{version}-{timestamp}/`

### Option 2: Screenshot Existing Build
```bash
npm run build
npm run screenshot:auto
```

## Screenshot Output

Each screenshot session creates a versioned directory:

```
screenshots/
└── v3.0-1770942264210/
    ├── README.md                  # Summary of this version
    ├── default/
    │   ├── light.png
    │   └── dark.png
    ├── medieval/
    │   ├── light.png
    │   └── dark.png
    ├── riddim/
    │   ├── light.png
    │   └── dark.png
    └── vaporwave/
        ├── light.png
        └── dark.png
```

## Manual Screenshot Process

If automated screenshots fail, take them manually:

1. **Start the app:**
   ```bash
   npm run dev
   ```

2. **Open http://localhost:3000**

3. **For each theme (DEF, MED, RID, VAP):**
   - Click the theme button
   - Take screenshot in light mode
   - Click mode switch
   - Take screenshot in dark mode

4. **Save to:** `screenshots/v{version}-{timestamp}/{theme}/{mode}.png`

## Available Scripts

- `npm run screenshot` - Basic screenshot tool (requires manual theme switching)
- `npm run screenshot:auto` - Automated screenshots with version history
- `npm run screenshot:history` - Dev server screenshots (may have HMR issues)
- `npm run screenshot:prod` - Production build screenshots
- `npm run release:screenshot` - **Full build + screenshot workflow**

## Troubleshooting

### "No build found"
Run `npm run build` first.

### "Server not responding"
The server needs a few seconds to start. Wait 5 seconds after seeing "Server ready" then try again.

### "Page keeps reloading"
This happens with the dev server's Fast Refresh. Use `npm run release:screenshot` instead which uses the production build.

### "Could not find button"
Increase wait times in the script or take screenshots manually.

## Best Practices

1. **Take screenshots before each release**
2. **Use consistent viewport size** (1920×1080)
3. **Keep screenshot history** - Don't delete old versions
4. **Document changes** in each version's README.md

## Version Tracking

Screenshots are automatically versioned from package.json. To update:

1. Update version in `package.json`
2. Run `npm run release:screenshot`
3. Commit screenshots with release

## Future Enhancements

- CI/CD integration for automatic screenshots
- Visual regression testing
- Side-by-side version comparisons
- Animated GIFs of theme transitions
