# Original supplier photographs

Downloaded on 2026-10-21 from the URLs in `manifest.json` at the user's explicit request. The original downloaded bytes are retained in this folder. The source supplier name and link remain visible on each product page. A logo watermark does not imply that the photographed physical product is manufactured by Dopamine or already carries its print.

6 products / 8 photographs: four Printesso switch/socket covers, the VELUR.ME thermochromic blank kit (two cap photos), and the VELUR.ME neon cord (two photos). No supplier prices or availability are imported as Dopamine prices or stock. These await the owner's confirmation.

`node scripts/brand-original-photos.mjs` rasterises only the supplied original Dopamine SVG wordmark, places it in the corner specified in the manifest, and writes a lossless WebP. The photograph is not resized, cropped, retouched, recoloured or regenerated. `verification.json` records the original SHA-256, original/output dimensions, logo bounds, and pixel comparison results. Every output has zero changed pixels outside the logo rectangle.

The catalog renders these photos with `object-fit: contain` and offers the full image in its zoom viewer. No derivative thumbnails or image-generation tools are used for this batch.

After changing the verified assets or source metadata, `node scripts/import-original-products.mjs` idempotently updates the six original product records while preserving other catalog products. Before setting any product active, enter confirmed prices in kopecks and actual inventory, then run catalog validation and the commerce tests.
