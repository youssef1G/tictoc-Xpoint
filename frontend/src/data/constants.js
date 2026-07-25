export const STORES = [
  {
    slug: 'xpoint',
    name: 'Xpoint',
    subtitle: 'Phone Accessories',
    description: 'Cases, chargers, cables, audio & more — everything your phone needs.',
    color: 'var(--accent)',
  },
  {
    slug: 'tictoc',
    name: 'Tic Toc',
    subtitle: 'The Turkish Medal House',
    description: 'Medals, straps & wearable accessories — style your everyday carry.',
    color: 'var(--brand)',
  },
]

export function getStore(slug) {
  return STORES.find(s => s.slug === slug)
}
