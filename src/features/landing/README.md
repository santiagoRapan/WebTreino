# Landing Feature

This feature module handles the public-facing landing page and marketing content.

## Structure

```
landing/
├── components/
│   ├── LandingPage.tsx         # Main landing page wrapper
│   ├── NavigationBar.tsx       # Top navigation bar
│   ├── HeroSection.tsx         # Hero section with CTA
│   ├── FeaturesSection.tsx     # Features showcase
│   ├── Footer.tsx              # Footer with links
│   └── index.ts                # Component barrel exports
├── index.ts                     # Barrel exports
└── README.md                    # This file
```

## Components

### `LandingPage`
Main landing page component that composes all sections.

**Structure:**
- NavigationBar
- HeroSection
- FeaturesSection
- Footer

**Usage:**
```tsx
import { LandingPage } from '@/features/landing'

export default function Page() {
  return <LandingPage />
}
```

### `NavigationBar`
Top navigation bar for the landing page.

**Features:**
- Brand logo and name
- Navigation links (Features, Contact)
- Login and Sign Up buttons
- Responsive design
- Sticky positioning

**Links:**
- Features - Scrolls to features section
- Contact - Scrolls to footer
- Login - `/auth` route
- Sign Up - `/auth?mode=signup` route

### `HeroSection`
Hero section with main value proposition.

**Features:**
- Large headline with brand highlight
- Subtitle describing the platform
- Call-to-action button
- Background decoration
- Responsive typography

**Content:**
- Title: "Transform your Fitness Business"
- Subtitle: Platform description
- CTA: "Start trial" button

### `FeaturesSection`
Showcases the main features of the platform.

**Features:**
- Grid layout of feature cards
- Icon for each feature
- Title and description
- Responsive grid (1/2/3 columns)
- "Coming soon" badges for future features

**Current Features:**
1. **Gestión de Clientes** (Client Management)
   - Manage all clients in one place
   - Detailed profiles
   - Progress tracking

2. **Rutinas Personalizadas** (Custom Routines)
   - Create specific routines for each client
   - Exercise library integration

3. **Agenda Inteligente** (Smart Calendar) - COMING SOON
   - Schedule sessions
   - Automatic reminders
   - Never miss an important appointment

4. **Análisis y Reportes** (Analytics & Reports) - COMING SOON
   - Visualize client progress
   - Detailed charts
   - Performance metrics

5. **Agente de IA** (AI Agent) - COMING SOON
   - Integrated AI agent
   - Help create routines
   - Answer common questions

6. **Acceso Móvil** (Mobile Access) - COMING SOON
   - Manage business from anywhere
   - Optimized mobile app

### `Footer`
Footer section with additional information.

**Features:**
- Copyright information
- Social media links (placeholder)
- Terms and privacy links (placeholder)
- Contact information
- Newsletter signup (placeholder)

## Styling

All components use:
- Tailwind CSS for styling
- Theme variables for colors
- Responsive design breakpoints
- Modern glassmorphism effects
- Gradient accents

## Internationalization

The landing page currently:
- Uses Spanish text (default)
- Ready for i18n integration
- Hard-coded strings can be replaced with translation keys

## Routes

Landing components are used in:
- `/` - Main landing page
- `/about` - About page (if exists)

## SEO Considerations

For better SEO, consider adding:
- Meta tags in layout
- Structured data (JSON-LD)
- Open Graph tags
- Twitter cards
- Sitemap
- robots.txt

## Performance

The landing page:
- Uses static components (no client-side fetching)
- Can be statically generated
- Optimized images recommended
- Lazy loading for images below the fold

## Future Enhancements

- [ ] Add testimonials section
- [ ] Add pricing section
- [ ] Add demo video
- [ ] Add blog/resources section
- [ ] Add FAQ section
- [ ] Add contact form
- [ ] Add newsletter integration
- [ ] Add analytics tracking (Google Analytics, Plausible)
- [ ] Add cookie consent banner
- [ ] Add live chat widget
- [ ] Implement i18n for multi-language support
- [ ] Add animations (Framer Motion)
- [ ] Add social proof (user count, reviews)

## Content Management

Currently, all content is hard-coded. For easier management, consider:
- Content management system (Sanity, Contentful)
- Markdown files in repo
- Admin panel for content updates
- A/B testing different copy

## Accessibility

Ensure:
- Proper heading hierarchy
- Alt text for images
- ARIA labels where needed
- Keyboard navigation
- Color contrast ratios
- Screen reader compatibility

## Notes

- Landing page is public (no authentication required)
- Optimized for conversion (clear CTAs)
- Mobile-first responsive design
- Modern, professional aesthetic
- Fast loading times
- Clear value proposition

