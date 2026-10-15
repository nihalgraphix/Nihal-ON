# Admin Gallery Section & Upload Modal Rebuild

Rebuild the admin gallery section and upload popup modal to match the sleek minimal aesthetic of the reference image (`image.png`), featuring a masonry layout, dual tab local file & Drive URL media upload, and instant category tags.

## User Review & Critical Decisions

> [!IMPORTANT]
> - **Confirmed Choice 1**: Masonry style layout with automatic height fitting for the gallery grid.
> - **Confirmed Choice 2**: Dual tab upload popup supporting both Local Drag & Drop and Drive URL linking.
> - **Confirmed Choice 3**: Instant category tags (Cinematic Reels, Photography, UI/UX Design, Motion Graphics, Branding, 3D Concepts).

## 1. Overview & Core Concept

- **What It Does**: Provides administrators with a high-end media studio to curate, upload, organize, and inspect portfolio media (images and cinematic reels) with a minimal popup matching the user's reference design.
- **Key Value**: Streamlined asset ingestion via local file selection or direct Drive URL, paired with a gorgeous masonry preview grid and instant category filters.

## 2. User Experience & Visual Design

- **Upload Modal (`GalleryUploadModal.tsx`)**:
  - Dark sleek modal background (`#090a10`) with glowing icon badge (`VIDEO MASTER UPLOAD`), subtitle, and circular close button `(X)`.
  - Segmented pill toggle: `From Gallery` vs `Drive URL`.
  - Dashed dropzone (`border-2 border-dashed border-white/15 bg-[#070912]`) with glowing media icon badge.
  - Clean form fields for **Title**, **Category** dropdown, and optional description.
- **Admin Gallery View (`AdminDashboard.tsx`)**:
  - Masonry grid layout with automatic height fitting and responsive column counts.
  - Interactive top search bar and instant category filter tabs.
  - Card hover actions for preview (lightbox), editing, and deletion.

## 3. Key Product Decisions & Trade-Offs

- **Masonry Layout**: Chosen for organic aesthetic display of mixed aspect-ratio media (square, portrait, landscape, cinematic).
- **Dual-Tab Upload**: Accommodates both direct local file drops (with auto image/video dimensions) and external Google Drive URLs.

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│               Admin Dashboard (gallery tab)            │
├───────────────────┬────────────────────────────────────┤
│ Search & Filters  │ Primary "+ Upload Master Asset"    │
└─────────┬─────────┴─────────────────┬──────────────────┘
          │                           │
          ▼                           ▼
┌───────────────────┐       ┌────────────────────────────┐
│ Masonry Grid View │       │ GalleryUploadModal         │
│ (Dynamic heights) │       │ - Tabs: Local / Drive URL  │
└─────────┬─────────┘       │ - Dropzone & Metadata      │
          │                 └─────────────┬──────────────┘
          ▼                               │
┌─────────────────────────────────────────▼──────────────┐
│                  Firestore & Local State               │
└────────────────────────────────────────────────────────┘
```
