# Customer copy and development provenance

The customer interface should describe the item, its useful attributes and the action available now. Do not display implementation notes, image-generation prompts, watermark production details, source-file provenance, “branded visualization” explanations, placeholder specification promises, internal milestones or backend plans in catalog banners, cards, product descriptions or editorial articles.

Technical asset history remains in PRODUCT-ASSETS.md and source-assets/original-products. The original catalog copy removed in this pass is retained in catalog-provenance.json in this directory. Generated assets remain marked internally with visualization: true; preview products keep price: null and zero sellable stock. Cleaning copy must not turn a concept into confirmed inventory or claim tested thermal performance, material, size or electrical specifications without evidence.

Keep concise information necessary for an informed action: unknown price, availability, purchase disabled, a saved order/proposal has not been sent, and where personal data is stored. Do not describe a local draft as an accepted order or submitted proposal. Put detailed data-handling information on the privacy page, not in every shopping section.

Customer product copy and actual variant colors are maintained in src/data/product-presentation.json. scripts/apply-product-presentation.mjs applies it after either catalog import, preventing old production notes from resurfacing. Preserve product IDs, variant IDs, real supplier identity, original photos, stock checks and existing saved favorites.

Variant colors are explicit six-digit hex values, never guessed at runtime from text labels. The selected button uses that color, a contrasting foreground, a checkmark and aria-pressed. Unselected, focus, hover and reduced-motion states must stay usable independently of color perception.
