export const STORES = [
  {
    slug: 'xpoint',
    name: 'Xpoint',
    subtitle: 'Phone Accessories',
    description: 'Cases, chargers, cables, audio & more — everything your phone needs.',
    color: 'var(--brand)',
  },
  {
    slug: 'tictoc',
    name: 'Tic Toc',
    subtitle: 'The Turkish Medal House',
    description: 'Medals, straps & wearable accessories — style your everyday carry.',
    color: 'var(--accent)',
  },
]

export function getStore(slug) {
  return STORES.find(s => s.slug === slug)
}
