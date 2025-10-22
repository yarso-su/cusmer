# Customers Manager Web App - Astro and Cloudflare Pages 🚀

Web application frontend for managing customers as an independent contractor. This is the client-side complement to the [backend service](https://github.com/yarso-su/customers-manager-service), forming a complete platform for customer interaction and project management.

The application features a public landing page at the root with full dashboard functionality behind authentication.

## Key Features

- Public landing page with service information
- Secure authentication and session management
- Customer dashboard for project and service tracking
- Real-time support chat with file sharing
- Stripe payment integration
- Invoice viewing and management
- Contract review and signing
- E2E encrypted credentials vault
- Project/service status updates
- Custom notifications system

> [!NOTE]  
> This is no longer an active project. I invite you to read the [LICENSE](https://github.com/yarso-su/customers-manager?tab=MIT-1-ov-file) before using part or all of this project's content. The original repo is still private for security concerns.

> [!WARNING]  
> This repository was designed to be deployed on [Cloudflare Pages](https://pages.cloudflare.com/), but you can easily adapt the configuration to deploy it elsewhere.

## Technologies

### Astro 🌟

This project was built using [Astro](https://astro.build/), a modern web framework focused on content-driven websites with exceptional performance. The combination of static generation with interactive islands makes it perfect for this use case: a landing page with complex authenticated dashboards.

#### Cloudflare Pages

Originally, the application was designed to be deployed on [Cloudflare Pages](https://pages.cloudflare.com/) to leverage their global CDN and edge computing capabilities, achieving minimal latency alongside the [backend service](https://github.com/yarso-su/customers-manager-service) deployed on Fly.io.

### Other

- **React:** For interactive dashboard components.
- **Stripe Elements:** Secure payment forms.
- **TypeScript:** Type safety across the application.
- **Tailwind CSS:** Utility-first styling.

## Known Limitations

This is a custom implementation designed to suit specific requirements, so yeah, there are a lot of areas for improvement.

The project structure could be more organized, especially the component hierarchy and state management patterns. Although in its current state, it works as expected for the intended use case.

> [!WARNING]  
> Before deploying, you **must** update the JSON-LD schema in the `BaseHead.astro` component with your own information, as well as all other meta tags throughout the application. Additionally, update the `robots.txt` with your sitemap URL, the `site.webmanifest` with your site details, and the `astro.config` with your domain configuration.

> [!WARNING]  
> You **must** update the content of the legal files that represent the privacy policies and terms of use with your own legal documents before deploying to production.

> [!NOTE]  
> Remember to remove all existing assets from the project (images, SVGs, icons) and replace them with your own branding materials.

> [!NOTE]  
> The global styles and overall design system used in this application are part of a design language I've developed and used across multiple projects, some of which are still active. Please be aware of this to avoid any plagiarism concerns. Additional details will be included in the LICENSE file.

> [!NOTE]  
> There are comments with an "IMPORTANT" tag that you should check to set some specific hardcoded values in the project.

## Environment Variables

- **API_URL:** Backend service URL (the [monolithic service](https://github.com/yarso-su/customers-manager-service))
- **STRIPE_PUBLISHABLE_KEY:** Stripe publishable key for payment processing

## Project Structure

```
/
├── public/          # Static assets (robots.txt, manifest, etc.)
├── src/
│   ├── components/  # Reusable components
│   ├── layouts/     # Page layouts (including BaseHead)
│   ├── pages/       # File-based routing
│   └── styles/      # Global styles
└── astro.config.mjs # Astro configuration
```

## Getting Started

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Set up environment variables
4. Update all configuration files (see warnings above)
5. Replace assets with your own
6. Run development server: `pnpm dev`

## License

MIT License.
