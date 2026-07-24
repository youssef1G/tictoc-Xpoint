import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'Tic Toc Xpoint'
const SITE_URL = 'https://tictoc-xpoint.vercel.app'
const DEFAULT_OG_IMAGE = '/logo.jpg'

function jsonLd(...args) {
  return args.map(item => (
    <script type="application/ld+json">{JSON.stringify(item)}</script>
  ))
}

export default function Seo({ title, description, ogImage, noindex, product }) {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
  const pageDesc = description || 'Premium phone accessories and wearable medals from Tic Toc Xpoint.'
  const image = ogImage || DEFAULT_OG_IMAGE

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'Premium phone accessories and handmade Turkish medals.',
  }

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.jpg`,
  }

  const productSchema = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || pageDesc,
    image: product.images?.[0] ? (product.images[0].startsWith('http') ? product.images[0] : `${SITE_URL}/images/${product.images[0]}`) : DEFAULT_OG_IMAGE,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'EGP',
      availability: product.stock === 0 ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
    },
  } : null

  const schemas = productSchema
    ? [websiteSchema, orgSchema, productSchema]
    : [websiteSchema, orgSchema]

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDesc} />
      <link rel="canonical" href={SITE_URL} />

      <meta property="og:type" content={product ? 'product' : 'website'} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDesc} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={SITE_URL} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDesc} />
      <meta name="twitter:image" content={image} />

      <link rel="alternate" href={SITE_URL} hrefLang="x-default" />
      <link rel="alternate" href={`${SITE_URL}/?lang=en`} hrefLang="en" />
      <link rel="alternate" href={`${SITE_URL}/?lang=ar`} hrefLang="ar" />

      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {jsonLd(...schemas)}
    </Helmet>
  )
}
