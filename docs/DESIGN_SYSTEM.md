# Design System

## Direction

Calm, modern, credible, and friendly. Avoid both government-form stiffness and childish classroom decoration.

## Visual principles

- Light surfaces with indigo/blue primary and emerald status accents.
- Rounded cards, restrained shadows, visible borders.
- Large readable typography and generous spacing.
- One primary CTA per screen.
- Charts only when they answer a teacher decision.

## Tokens

```css
--background: #f7f8fc;
--surface: #ffffff;
--surface-subtle: #f1f4f9;
--text: #172033;
--text-muted: #667085;
--primary: #4f46e5;
--primary-strong: #3730a3;
--success: #067647;
--warning: #b54708;
--danger: #b42318;
--border: #e4e7ec;
--focus: #7c3aed;
```

## Typography

Use system/Geist-style sans serif. Base text 16 px. Avoid body text below 14 px. Numbers and statuses must remain readable on older phones.

## Layout

- Mobile: 16 px page padding, bottom nav, sticky action when editing.
- Tablet: 24 px padding, optional compact sidebar.
- Desktop: 256 px sidebar and content max width 1280 px.
- Forms: one column by default; two columns only for clearly paired short fields.

## Components

- App shell and responsive navigation.
- Page header with title, context, and one primary action.
- Quick action cards.
- Status badge with text + icon, never color alone.
- Mobile data cards as alternative to wide tables.
- Empty state with one clear next step.
- Offline banner and pending-sync badge.
- Confirm dialogs only for destructive/irreversible actions.

## Interaction

- Touch target minimum 44×44 px.
- Hover is enhancement, not a requirement.
- Motion 120–220 ms and disabled/reduced when requested.
- Autosave drafts with explicit status; never imply server save when only local.
- Destructive actions require clear consequences.

## Reference patterns, not copies

- Linear: hierarchy and command clarity.
- Notion: calm editable surfaces.
- shadcn/ui/Radix: accessible primitives.
- Modern teacher dashboards: sidebar + today-focused quick actions.

Use references for patterns only; create original visual composition and branding.
