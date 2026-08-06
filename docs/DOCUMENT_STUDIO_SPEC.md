# Teman Guru Docs — Functional Specification

## Scope MVP

1. school brand kit
2. document templates
3. dynamic variables
4. A4/F4 preview
5. PDF and DOCX export
6. visual signature and stamp approval
7. letter/SK generator
8. numbering
9. archive and verification page

## Roles

- `school_owner`: manage brand kit, signers, stamp vault, policies
- `school_admin`: templates, numbering, archive
- `approver`: approve/reject/sign allowed document types
- `teacher`: create drafts and submit
- `viewer`: read permitted final documents

## Asset security

- Bucket private.
- Path scoped by `school_id`.
- Signed URL short-lived and generated server-side.
- Teacher cannot fetch original signature/stamp object.
- Final renderer composites assets server-side.
- Every application of signature/stamp records actor, document version, timestamp, and reason.

## Document lifecycle

`draft → submitted → in_review → changes_requested | approved → finalized → archived | revoked`

Finalized document:
- immutable content version
- document number
- SHA-256 hash
- QR link to public-safe verification record
- no private document content on verification page

## Editor constraints

Use a constrained component editor, not unrestricted HTML:
- text block
- heading
- image/logo
- line
- table
- variable field
- page break
- signature block
- stamp block
- QR verification block

Save template as versioned JSON validated by Zod.

## Page settings

- A4, F4/Folio, Letter, Legal, custom
- portrait/landscape
- margins in millimeter
- header/footer first-page rules
- page numbering
- watermark
- repeated table header

## Required templates

- Surat Tugas
- Surat Undangan
- Surat Keterangan
- Surat Pemberitahuan Orang Tua
- Berita Acara
- Notulen
- SK Pembagian Tugas
- SK Panitia
- Sertifikat
- Jurnal Mengajar
- Rekap Presensi
- Rekap Nilai

## Required validation

Before finalization:
- unresolved variables
- missing signer
- duplicate number
- low-resolution logo warning
- overflow/page clipping
- missing approval
- unsigned final document when signature required

## Legal wording

Always label uploaded/drawn signatures as `Tanda tangan visual`. Do not claim certified electronic signature, legal certificate, or PSrE integration.
