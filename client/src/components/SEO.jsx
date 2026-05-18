import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Dynamic SEO Component
 * Inject meta tags and structured data based on current route
 */
const SEO = ({ 
  title, 
  description, 
  image, 
  type = 'website',
  product = null,
  article = null
}) => {
  const location = useLocation();
  const BASE_URL = 'https://sneakerzone.vn';
  const defaultImage = `${BASE_URL}/og-image.jpg`;

  // Update document title
  useEffect(() => {
    const fullTitle = title ? `${title} | SneakerZone` : 'SneakerZone - Cửa Hàng Giày Sneaker Chính Hãng Việt Nam';
    document.title = fullTitle;
  }, [title]);

  // Update meta tags
  useEffect(() => {
    // Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description || 'Chuyên cung cấp giày sneaker chính hãng Nike, Adidas, Jordan, Puma với giá tốt nhất.');
    }

    // Open Graph
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    const ogImage = document.querySelector('meta[property="og:image"]');

    if (ogTitle) ogTitle.setAttribute('content', title || 'SneakerZone');
    if (ogDesc) ogDesc.setAttribute('content', description || 'Chuyên cung cấp giày sneaker chính hãng');
    if (ogUrl) ogUrl.setAttribute('content', `${BASE_URL}${location.pathname}`);
    if (ogImage) ogImage.setAttribute('content', image || defaultImage);

    // Twitter
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    const twitterImage = document.querySelector('meta[name="twitter:image"]');

    if (twitterTitle) twitterTitle.setAttribute('content', title || 'SneakerZone');
    if (twitterDesc) twitterDesc.setAttribute('content', description || 'Chuyên cung cấp giày sneaker chính hãng');
    if (twitterImage) twitterImage.setAttribute('content', image || defaultImage);

  }, [title, description, image, location.pathname]);

  // Product structured data
  const productSchema = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.image || [product.images?.[0]].filter(Boolean),
    "brand": {
      "@type": "Brand",
      "name": product.brand
    },
    "sku": product._id,
    "offers": {
      "@type": "Offer",
      "url": `${BASE_URL}/product/${product._id}`,
      "priceCurrency": "VND",
      "price": product.price,
      "priceValidUntil": new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
      "availability": product.countInStock > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "SneakerZone"
      }
    },
    "aggregateRating": product.rating ? {
      "@type": "AggregateRating",
      "ratingValue": product.rating.average || 0,
      "reviewCount": product.rating.count || 0
    } : undefined
  } : null;

  // Article/Blog structured data
  const articleSchema = article ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.content?.substring(0, 160),
    "image": article.image,
    "author": {
      "@type": "Organization",
      "name": "SneakerZone"
    },
    "publisher": {
      "@type": "Organization",
      "name": "SneakerZone",
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/logo.png`
      }
    },
    "datePublished": article.createdAt,
    "dateModified": article.updatedAt
  } : null;

  // Breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Trang chủ",
        "item": BASE_URL
      },
      ...(type === 'product' ? [{
        "@type": "ListItem",
        "position": 2,
        "name": "Sản phẩm",
        "item": `${BASE_URL}/products`
      }] : []),
      ...(title ? [{
        "@type": "ListItem",
        "position": type === 'product' ? 3 : 2,
        "name": title,
        "item": `${BASE_URL}${location.pathname}`
      }] : [])
    ]
  };

  return (
    <>
      {/* Product Schema */}
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema, null, 0) }}
        />
      )}

      {/* Article Schema */}
      {articleSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema, null, 0) }}
        />
      )}

      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema, null, 0) }}
      />
    </>
  );
};

export default SEO;
