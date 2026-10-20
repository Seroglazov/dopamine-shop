/** Original Figma masks/textures and SVGs; root geometry and vector paths are preserved. */
const shapes = {
  star: { src: '/assets/figma/cool-star-gradient.webp', width: 324.802, height: 324.802, node: '1:133' },
  spark: { src: '/assets/figma/cool-spark-gradient.webp', width: 107, height: 107, node: '2:12' },
  flower: { src: '/assets/figma/brutalist-flower.svg', width: 426, height: 426, node: '26:45758' },
  orbit: { src: '/assets/figma/brutalist-orbit.svg', width: 389.6, height: 389.6, node: '26:45766' },
} as const;
export function FigmaShape({ kind, className = '', priority = false }: { kind: keyof typeof shapes; className?: string; priority?: boolean }) {
  const shape = shapes[kind];
  const gradient = kind === 'star' || kind === 'spark';
  const imageSize = kind === 'star' ? 384 : kind === 'spark' ? 256 : shape.width;
  return <span className={`figma-shape figma-${kind} ${className}`} data-figma-node={shape.node} aria-hidden="true"><span className={`figma-shape-native ${gradient ? 'figma-masked' : ''}`}><img src={shape.src} alt="" width={imageSize} height={gradient ? imageSize : shape.height} loading={priority ? 'eager' : 'lazy'} decoding="async" draggable={false} />{gradient && <span className="figma-shape-light" />}</span></span>;
}
