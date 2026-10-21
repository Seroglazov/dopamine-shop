# Figma component provenance

Local components from the design files supplied by the user. Complete design screenshots are reference material only and are not embedded in the website.

| Local assets | Source | Node | Original SVG geometry | Website slot |
|---|---|---|---|---|
| `cool-star-mask.svg` + `cool-star-gradient.webp` | [3D Cool Shapes](https://www.figma.com/design/Ns8wW52qESfafBvGV7RftD/3D-Cool-Shapes--Community-?node-id=1-133) | 1:133 | 324.802 × 324.802 mask | Hero upper-right accent |
| `cool-spark-mask.svg` + `cool-spark-gradient.webp` | [3D Cool Shapes](https://www.figma.com/design/Ns8wW52qESfafBvGV7RftD/3D-Cool-Shapes--Community-?node-id=2-12) | 2:12 | 107 × 107 mask | Hero interaction hint |
| `brutalist-flower.svg` | [Brutalist Shape Elements](https://www.figma.com/design/3WCt84mh70yQfMvMtYSNkl/FREE---Brutalist-Shape-Elements-Mega-Pack--Community-?node-id=26-45758) | 26:45758 / Brutalist 70 | 426 × 426 | Pink manifesto accent |
| `brutalist-orbit.svg` | [Brutalist Shape Elements](https://www.figma.com/design/3WCt84mh70yQfMvMtYSNkl/FREE---Brutalist-Shape-Elements-Mega-Pack--Community-?node-id=26-45766) | 26:45766 / Brutalist 100 | 389.6 × 389.6 | Footer wordmark accent |
| `cool-clover.webp` | [3D Cool Shapes](https://www.figma.com/design/Ns8wW52qESfafBvGV7RftD/3D-Cool-Shapes--Community-?node-id=1-17) | 1:17 | 200 × 200 node export + original SVG mask | Catalog teaser centerpiece |
| `cool-petal.webp` | [3D Cool Shapes](https://www.figma.com/design/Ns8wW52qESfafBvGV7RftD/3D-Cool-Shapes--Community-?node-id=1-8) | 1:8 | 200 × 200 node export + original SVG mask | Cropped room section background |
| `cool-asterisk.webp` | [3D Cool Shapes](https://www.figma.com/design/Ns8wW52qESfafBvGV7RftD/3D-Cool-Shapes--Community-?node-id=1-20) | 1:20 | 200 × 200 node export + original SVG mask | Brand panel and FAQ accents |
| `cool-pillow.webp` | [3D Cool Shapes](https://www.figma.com/design/Ns8wW52qESfafBvGV7RftD/3D-Cool-Shapes--Community-?node-id=1-70) | 1:70 | 200 × 200 node export + original SVG mask | Brand panel and catalog accents |

`get_design_context` and reference screenshots were read for parent frames and individual components. Original SVG paths, fills and root dimensions are unchanged. Cool Shapes use the provided SVG masks, gradient texture fills and inset light treatment. Parent wrappers control uniform responsive scale. The original dark cover background is not carried into the light page.

Source texture fills (2560px) are resampled to 384px/256px WebP for the displayed 104px/40px accents. Full-resolution originals and node exports are retained only in ignored `artifacts/figma-source/`; they are not deployed. Runtime assets are local; temporary Figma URLs are not stored in code.

The remaining original team Community resource links need accessible design/node links before their contents can be read and used.

The four additional Cool Shapes are original node exports from `download_assets`, converted to WebP at their native resolution without changing their composition, color or aspect ratio. Their matching original SVG masks remove the inherited export background at runtime. Their PNG sources remain in ignored `artifacts/figma-source/`. They are decorative (`aria-hidden`, empty alt text, no pointer events), lazy loaded, and uniformly scaled by parent wrappers. Desktop scroll drift reuses the existing GSAP context and cleanup; touch layouts and reduced-motion mode use static placement.
