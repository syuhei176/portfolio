# Retro Game Portfolio - syuhei176

A modern portfolio website with a distinctive retro game aesthetic, showcasing game development and graphics projects.

## Design Features

### Aesthetic Direction
- **Retro Gaming Theme**: Pixel art fonts, CRT screen effects, and 8-bit inspired design
- **Color Palette**: Vibrant neon colors (purple, cyan, pink, green, yellow) on dark backgrounds
- **Typography**:
  - Press Start 2P for pixel-perfect headings
  - VT323 for readable body text
- **Animations**: Scanline effects, glowing text, floating elements, and typing animations

### Key Components

#### Hero Section
- Animated typing effect for name reveal
- CRT screen simulation with scanlines
- Glowing neon text effects
- Tech stack badges with pixel aesthetic
- Smooth scroll navigation

#### Project Cards
- Game cartridge inspired design
- Color-coded by project type
- Pixel art placeholders
- Hover effects with depth
- Technology tags in retro style

#### Visual Effects
- Scanline overlay across entire page
- Gradient blob backgrounds
- Pixel-perfect borders
- CRT screen curvature simulation
- Floating animations
- Glow effects on interactive elements

## Technologies Used

- React 19
- React Router 7
- Tailwind CSS 4
- TypeScript
- Cloudflare Workers

## File Structure

```
/Users/syuhei/work/portfolio/
├── app/
│   ├── components/
│   │   ├── Hero.tsx          # Main hero section with typing animation
│   │   └── ProjectCard.tsx   # Reusable project card component
│   ├── routes/
│   │   └── home.tsx          # Main portfolio page
│   ├── app.css              # Global styles and retro animations
│   └── root.tsx             # App root with font loading
```

## Design Decisions

1. **High Quality Level (70+)**: Implemented distinctive retro game aesthetic with:
   - Custom pixel fonts (Press Start 2P, VT323)
   - Bold color palette avoiding generic purple gradients
   - Rich animations and effects
   - CRT screen simulation
   - Scanline overlay

2. **Retro Gaming Theme**:
   - Inspired by 8-bit and 16-bit era games
   - Neon colors reminiscent of arcade cabinets
   - Pixel-perfect typography
   - Game cartridge styled project cards

3. **Interactive Elements**:
   - Typing animation on hero
   - Floating animations on cards
   - Glowing button effects
   - Smooth scroll navigation
   - Hover state transitions

4. **Responsive Design**:
   - Mobile-first approach
   - Breakpoints for tablets and desktop
   - Flexible grid layouts
   - Scalable typography

## Running the Project

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Deploy to Cloudflare
pnpm deploy
```

## Customization

To customize the portfolio:

1. **Update Projects**: Edit the `projects` array in `/Users/syuhei/work/portfolio/app/routes/home.tsx`
2. **Change Colors**: Modify color scheme in `/Users/syuhei/work/portfolio/app/app.css` under `@theme`
3. **Adjust Animations**: Tweak keyframe animations in `/Users/syuhei/work/portfolio/app/app.css`
4. **Update Content**: Modify text in `/Users/syuhei/work/portfolio/app/components/Hero.tsx`

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy
- Sufficient color contrast
- Keyboard navigation support
- Screen reader friendly

---

Built with retro vibes and modern technology.
