import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'Tic Toc Xpoint'
const SITE_URL = 'https://tictoc-xpoint.vercel.app'
const DEFAULT_OG_IMAGE = '/logo.jpg'

export default function Seo({ title, description, ogImage, noindex }) {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
  const pageDesc = description || 'Premium phone accessories and wearable medals from Tic Toc Xpoint.'
  const image = ogImage || DEFAULT_OG_IMAGE

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDesc} />
      <link rel="canonical" href={SITE_URL} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDesc} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={SITE_URL} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDesc} />
      <meta name="twitter:image" content={image} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  )
}
