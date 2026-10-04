# Wedding website asset prompts

Generated with the built-in image_gen tool on 3 October 2026. The supplied preferred invitation was used only as a style reference. The approved painting was not regenerated or edited. Web copies are format conversions at original dimensions; the divider preserves genuine alpha transparency.

## Fleuron — accepted

- Original: `asset-review/fleuron-original.png` — 2172 × 724, RGBA.
- Web: `public/assets/fleuron.webp` — 2172 × 724, lossless WebP with alpha, 168,726 bytes.
- Visual check: one symmetrical brown ink ornament, fine horizontal rules, no lettering, real transparent background (alpha range 0–255).

Prompt:

Use case: historical-scene. Asset type: single ornamental raster divider for a wedding invitation website. Primary request: one finely engraved late seventeenth-century English printing ornament, a symmetrical dark walnut-brown horizontal fleuron with a small upright fleur-de-lis at the centre, curling fine leaves extending left and right and very thin tapering horizontal rules beyond. Match the restrained ink flourishes in the supplied invitation STYLE reference. The reference is for the ornament style only; do not reproduce its babies, painting, building, page or lettering. Composition: centered single ornament in a landscape image about 3:1, occupying 75% of width and 45% of height, ample real transparent padding on all sides. Crisp but subtly irregular antique ink engraving, sparse fine lines, warm deep brown (#513720), flat colour. Transparent background required. No paper, no shadows, no frame, no text, no letters, no watermark, no collage, no multiple ornaments. This must work as a discreet web divider at 160–240 pixels wide.

## Laid paper — accepted

- Original: `asset-review/laid-paper-original.png` — 1254 × 1254, RGB.
- Web: `public/assets/laid-paper.webp` — 1254 × 1254, quality 88 WebP, 189,582 bytes.
- Visual check: warm cream, subtle fibres and low contrast; no lettering, ornamental marks, folds or dark edges. Seamlessness is not guaranteed; use at broad scale rather than exposing many repetitions.

Prompt:

Use case: stylized-concept. Asset type: single seamless paper texture for the background of a wedding invitation website. Primary request: a very subtle warm cream sheet of fine lightly aged laid paper, matching the restrained cream stationery background of the supplied invitation STYLE reference, but cleaner and with much less mottling. Fill the entire square image edge to edge with only the paper surface. Even flat scanning illumination, pale buttery ivory base around #f0e4c5 with tiny natural fibres and very faint laid-paper grain. Extremely low contrast so dark brown small typography will be fully readable on top. Seamless/tileable edges. No vignette, no dark or burnt edges, no tears, no creases, no obvious stains, no objects, no borders, no ornaments, no text, no letters, no watermarks. Do not depict the painting, babies, building, invitation layout or anything other than the paper material.

## Picture-frame overlay — rejected

- Review output: `asset-review/picture-frame-rejected.png` — 1536 × 1024.
- Do not use in the website as the requested corner mask. The central aperture is genuinely transparent, but the outer corners are also transparent instead of the opaque cream specified in the prompt. The generated fine double-rule shape cannot hide the painting's square corners. Use ordinary fine rectangular rules as the agreed fallback. The tool display shows dark hazy RGB values under alpha zero; these are not opaque painted areas.

Prompt:

Use case: stylized-concept. Asset type: single transparent picture-frame overlay, not a finished invitation. Reference image role: use ONLY the fine double brown outline and indented stepped corner shape around its large painting as the style reference. Generate one landscape 3:2 frame at 1536x1024, in the same restrained late seventeenth-century dark walnut ink style. The outer rectangular image should contain a very fine double sepia rule around one large shaped transparent aperture: straight top/bottom/left/right sides, with all four corners concavely stepped/inset in the manner of the supplied painting frame. The central opening occupies about 92% of width and 88% of height and MUST be genuinely transparent, completely empty, to allow an existing painting to show through. The narrow perimeter outside the rules and the four concave corner cut-outs should be solid warm cream paper matching #f0e4c5, enough to cover the square corners of the painting underneath. Keep edges crisp, lines fine. One frame only. No fleuron crest, no flowers, no words, no letters, no painting, no people, no building, no photographed page, no shadow, no checkerboard pattern. All central pixels inside the double rule should be transparent alpha, not cream or white. Outer corners should be opaque warm cream. Transparent background required.
