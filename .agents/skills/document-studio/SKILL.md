---
name: document-studio
description: Designs and implements Teman Guru school documents, templates, PDF/DOCX export, visual signatures, stamps, numbering, verification, and archive safely.
---

# Document Studio

1. Read `docs/DOCUMENT_STUDIO_SPEC.md` and `docs/SECURITY_PRIVACY.md`.
2. Start with one document template and one complete lifecycle.
3. Keep template schemas versioned and Zod-validated.
4. Render final files server-side where private assets are used.
5. Store signature/stamp assets privately; expose only short-lived signed access where necessary.
6. Label image signatures as visual signatures, never certified TTE.
7. Add tests for unresolved variables, authorization, page overflow, and finalization immutability.
8. Verify A4 and F4 in print preview and exported output.
