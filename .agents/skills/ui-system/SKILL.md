---
name: ui-system
description: Implements Teman Guru mobile-first UI components, responsive layouts, states, and visual consistency. Use for pages, components, navigation, forms, or design reviews.
---


# Teman Guru UI System

- Follow `docs/DESIGN_SYSTEM.md`.
- Default page width: `max-w-7xl`; text/forms generally `max-w-2xl`.
- Touch targets at least 44×44 CSS px.
- Use one dominant primary action per screen.
- Data-entry screens must have sticky mobile actions when useful.
- Always implement loading, empty, error, success, disabled, and offline states.
- Avoid tiny charts, low-contrast text, hover-only actions, and horizontal tables on phones.
- On mobile, transform tables into cards or horizontally scroll only when preserving columns is essential.
- Respect `prefers-reduced-motion`.

