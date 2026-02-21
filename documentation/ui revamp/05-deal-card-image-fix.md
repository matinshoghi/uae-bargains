# 05 - Deal Card Image Fix

**Date:** 2026-02-21

## Problem

Deal card thumbnail images on the home page were getting cropped/cut off. The `object-cover` CSS property was forcing images to fill the entire square container, cutting off parts of product images.

## Changes

### `components/deals/DealCard.tsx`

- Changed image fit from `object-cover` to `object-contain` so the full image is always visible without cropping
- Added `p-1.5` padding inside the image container for breathing room
- Added `bg-muted/40` background to the image container so images with transparency or white backgrounds have a subtle contrast against the card
