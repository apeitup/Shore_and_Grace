# Shore & Grace

React holding page for Shore & Grace, implemented from the supplied desktop, tablet, and mobile Figma designs.

## Local development

```bash
npm install
npm run dev
```

Create a `.env.local` from `.env.example` to connect the social profiles and launch-notification form. Until `VITE_SIGNUP_ENDPOINT` is configured, the form remains in preview mode and clearly tells visitors that signup is not yet available.

## Production build

```bash
npm run build
```

The current app deliberately renders only the holding page. Future public routes and shop functionality can be introduced behind the same React entry point when they are ready to launch.
