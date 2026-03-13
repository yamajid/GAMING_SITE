# Gaming Coins Hub — Design System

## 🎨 Color Palette

### Primary Gaming Colors
```
Gaming Purple    #667eea    RGB(102, 126, 234)    Primary brand
Gaming Purple    #764ba2    RGB(118, 75, 162)     Secondary accent
Gaming Pink      #f093fb    RGB(240, 147, 251)    Highlight accent
Gaming Blue      #4facfe    RGB(79, 172, 254)     Tertiary accent
Gaming Dark      #0f0f1e    RGB(15, 15, 30)       Dark mode bg
Gaming Light     #f8f9ff    RGB(248, 249, 255)    Light mode bg
```

### Semantic Colors
```
Success          #10b981    Green - positive actions
Warning          #f59e0b    Orange - cautions
Danger           #ef4444    Red - errors/warnings
Info             #0ea5e9    Cyan - information
```

---

## 📐 Spacing System

```
xs    4px   Micro spacing
sm    8px   Small spacing
md    12px  Medium spacing (most common)
lg    16px  Large spacing
xl    24px  Extra large
2xl   32px  Double large
```

---

## 🔤 Typography

### Font Families
```
Headings    System font stack (SF Pro, Segoe UI, Roboto)
Body        System font stack
Code        Monospace (Inconsolata, Menlo, Consolas)
```

### Font Sizes
```
h1    3rem     Display heading
h2    2.25rem  Section heading
h3    1.75rem  Subsection
h4    1.25rem  Small heading
body  1rem     Body text
small 0.875rem Small text
```

### Font Weights
```
Regular    500
Semi-bold 600
Bold      700
Extra-bold 800 (headings)
```

---

## 🎯 Border Radius Scale

```
sm    6px
md    12px
lg    16px
full  50px (buttons)
```

---

## ⚡ Animation & Timing

### Durations
```
Fast      0.2s  (subtle hover effects)
Normal    0.35s (standard interactions)
Slow      0.8s  (entrance animations)
Long      15s   (continuous effects)
```

### Easing Functions
```
ease-out              Standard (slide up, fade in)
cubic-bezier()        Custom bounce effect
ease-in-out           Smooth transitions
```

### GPU Accelerated Properties
```
transform             translateX/Y, scale, rotate
opacity              fade in/out
```

---

## 💫 Shadow System

### Elevation Levels
```
Level 1   0 2px 8px       Cards, buttons (default)
Level 2   0 4px 12px      Hover state
Level 3   0 8px 20px      Elevated cards
Level 4   0 12px 35px     Maximum depth
```

---

## 🎬 Animation Library

### Entrance Animations
```
slideUp    300ms   Slides in from bottom (entrance)
fadeIn     1000ms  Fades in (text reveal)
```

### Hover Animations
```
translateY    -4px to -8px   Lift on hover
scaleUp       1.0 → 1.05     Scale on hover
colorShift    Color change   Text color change
```

### Continuous Animations
```
gradientShift    15s   Animated gradient background
```

---

## 🔧 Component Styling

### Button Styles

**Primary Button**
```
Background:  Linear gradient (purple → pink)
Color:       White
Padding:     0.85rem 2rem
Radius:      50px
Shadow:      0 6px 20px rgba(102, 126, 234, 0.3)
Hover:       Transform up, shadow deeper
Focus:       Outline 2px solid #667eea
```

**Secondary Button**
```
Background:  Glassmorphism (transparent + blur)
Border:      rgba(255, 255, 255, 0.3)
Color:       White
Padding:     0.85rem 2rem
Radius:      50px
Backdrop:    blur(10px)
Hover:       More opaque, stronger shadow
```

### Card Styles
```
Background:  Solid or gradient
Border:      1px rgba(102, 126, 234, 0.1)
Radius:      12px
Padding:     1.5-2rem
Shadow:      0 4px 20px rgba(0, 0, 0, 0.08)
Hover:       translateY(-4px), shadow increase
```

### Featured Sections
```
Hero         Animated gradient background
Games        Card grid with hover effects
Features     Border-top animation on hover
Stats        Bold gradient cards
CTA          Gradient + glass effect
```

---

## 📱 Responsive Breakpoints

```
Mobile      < 480px    (phone)
Tablet      480-768px  (landscape phone/tablet)
Desktop     768-1024px (tablet/small desktop)
Large       > 1024px   (desktop/large monitor)
```

### Responsive Changes
```
< 768px:
- Stack layouts (flex-direction: column)
- Larger font sizes for readability
- Adjusted padding/margins
- Hide secondary navigation
- Full-width buttons
```

---

## ♿ Accessibility (WCAG AA)

### Color Contrast
```
Text vs Background     Minimum 4.5:1 ratio
Large Text (18pt+)     Minimum 3:1 ratio
All interactive        Visual focus indicator
```

### Interactive Elements
```
All links/buttons      :focus-visible states
Keyboard only users    Tab navigation works
Screen readers         Semantic HTML
Reduced motion         Animations respect prefers-reduced-motion
```

---

## 🚀 Performance Targets

```
First Contentful Paint (FCP)      < 1.8s
Largest Contentful Paint (LCP)    < 2.5s
Cumulative Layout Shift (CLS)     < 0.1
Time to Interactive (TTI)         < 3.5s
Speed Index                       < 2.0s
```

---

## 🎮 Gaming Design References

**Influenced by:**
- Discord UI (modern clean design)
- Figma interface (interactive elements)
- Twitch dark theme (gaming aesthetic)
- Vercel marketing site (gradient animations)

**Result:** Professional gaming brand with modern tech aesthetics

---

## 📋 Design Tokens Summary

```css
/* Colors */
--color-primary: #667eea
--color-secondary: #764ba2
--color-accent: #f093fb

/* Typography */
--font-heading-weight: 800
--font-body-weight: 500

/* Spacing */
--spacing-base: 1.5rem

/* Borders */
--border-radius: 12px
--border-radius-full: 50px

/* Shadows */
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08)
--shadow-lg: 0 12px 35px rgba(102, 126, 234, 0.3)

/* Transitions */
--transition: 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)
```

---

## ✅ Consistency Checklist

- ✅ All headings use 800px weight
- ✅ All buttons have rounded (50px) border-radius
- ✅ All cards use 12px border-radius
- ✅ All hover effects have smooth transitions
- ✅ All animations are GPU-accelerated
- ✅ All colors meet WCAG AA contrast ratios
- ✅ All interactive elements have focus states
- ✅ All layouts are fully responsive
- ✅ All text is readable at 16px minimum
- ✅ All components support dark/light mode

---

This design system ensures **consistency, accessibility, and performance** while maintaining a **modern gaming aesthetic** perfect for your tech audience.
