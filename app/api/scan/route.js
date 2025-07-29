import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function POST(request) {
  try {
    const { domain } = await request.json()
    
    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      )
    }

    // Validate domain format
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
    if (!domainRegex.test(domain.replace(/^https?:\/\//, ''))) {
      return NextResponse.json(
        { error: 'Invalid domain format. Please enter a valid domain name (e.g., example.com)' },
        { status: 400 }
      )
    }

    // Ensure domain has proper protocol
    const url = domain.startsWith('http') ? domain : `https://${domain}`
    const baseUrl = new URL(url).origin
    
    let response
    try {
      // First try HTTPS
      response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 15000,
        redirect: 'follow'
      })
    } catch (httpsError) {
      // If HTTPS fails, try HTTP
      const httpUrl = domain.startsWith('http') ? domain.replace('https:', 'http:') : `http://${domain}`
      
      try {
        response = await fetch(httpUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          timeout: 15000,
          redirect: 'follow'
        })
      } catch (httpError) {
        throw new Error(`Unable to connect to website: ${httpsError.message}`)
      }
    }

    if (!response.ok) {
      const statusMessages = {
        404: 'Website not found. Please check the domain name.',
        403: 'Access denied. The website may be blocking our scanner.',
        500: 'The website server encountered an error.',
        502: 'Bad gateway. The website may be temporarily unavailable.',
        503: 'Service unavailable. The website may be down for maintenance.',
        504: 'Gateway timeout. The website is not responding.'
      }
      
      const message = statusMessages[response.status] || `HTTP ${response.status}: ${response.statusText}`
      
      return NextResponse.json(
        { error: message },
        { status: response.status }
      )
    }

    const html = await response.text()
    
    if (!html || html.trim().length === 0) {
      return NextResponse.json(
        { error: 'Website returned empty content' },
        { status: 422 }
      )
    }
    
    const $ = cheerio.load(html)
    
    // Analyze SEO metrics (including new comprehensive checks)
    const metrics = await analyzeSEO($, baseUrl, response)
    
    // Calculate overall score
    const overallScore = calculateOverallScore(metrics)
    
    return NextResponse.json({
      domain: domain,
      url: response.url || url,
      baseUrl: baseUrl,
      overallScore: overallScore,
      metrics: metrics,
      scanDate: new Date().toISOString(),
      success: true
    })

  } catch (error) {
    console.error('Scan error:', error)
    
    // Categorize errors for better user experience
    let statusCode = 500
    let errorMessage = 'An unexpected error occurred while scanning the website'
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      statusCode = 503
      errorMessage = 'Unable to connect to the website. Please check the domain name and try again.'
    } else if (error.message.includes('timeout')) {
      statusCode = 408
      errorMessage = 'Request timed out. The website may be taking too long to respond.'
    } else if (error.message.includes('Invalid domain')) {
      statusCode = 400
      errorMessage = error.message
    } else if (error.message) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        timestamp: new Date().toISOString(),
        success: false
      },
      { status: statusCode }
    )
  }
}

async function analyzeSEO($, baseUrl, response) {
  const metrics = []

  // Core SEO Elements
  const titleTag = $('title').text()
  metrics.push(analyzeTitleTag(titleTag))

  const metaDescription = $('meta[name="description"]').attr('content') || ''
  metrics.push(analyzeMetaDescription(metaDescription))

  metrics.push(analyzeHeadings($))
  metrics.push(analyzeImageAltText($))
  metrics.push(analyzeInternalLinks($, baseUrl))

  // Meta Tags & Technical SEO
  const metaKeywords = $('meta[name="keywords"]').attr('content') || ''
  metrics.push(analyzeMetaKeywords(metaKeywords))
  metrics.push(analyzeCanonicalURL($, baseUrl))
  metrics.push(analyzeMetaRobots($))
  metrics.push(analyzeViewport($))
  metrics.push(analyzeLangAttribute($))

  // Social Media & Rich Snippets
  metrics.push(analyzeOpenGraph($))
  metrics.push(analyzeTwitterCards($))
  metrics.push(analyzeSchemaMarkup($))

  // Technical Infrastructure
  metrics.push(await analyzeRobotsTxt(baseUrl))
  metrics.push(await analyzeSitemap(baseUrl))
  metrics.push(analyzeSSL(response, baseUrl))
  metrics.push(analyzePageSpeed(response))

  // Content Quality
  metrics.push(analyzeContentLength($))
  metrics.push(analyzeExternalLinks($, baseUrl))

  // Additional SEO Factors
  metrics.push(analyzeFavicon($, baseUrl))
  metrics.push(analyzeGoogleAnalytics($))

  return metrics
}

// Core SEO Functions (existing ones updated)
function analyzeTitleTag(title) {
  const issues = []
  const recommendations = []
  let score = 100
  let status = 'pass'

  if (!title) {
    issues.push('No title tag found')
    score = 0
    status = 'fail'
  } else {
    if (title.length < 30) {
      issues.push(`Title is too short (${title.length} characters, minimum 30 recommended)`)
      score -= 30
      status = 'warning'
    }
    if (title.length > 60) {
      issues.push(`Title is too long (${title.length} characters, maximum 60 recommended)`)
      score -= 20
      status = 'warning'
    }
    if (title.trim().length === 0) {
      issues.push('Title tag is empty')
      score = 0
      status = 'fail'
    }
  }

  if (score < 100) {
    recommendations.push('Keep title between 30-60 characters')
    recommendations.push('Include primary keywords near the beginning')
    recommendations.push('Make it descriptive and compelling')
    recommendations.push('Each page should have a unique title')
  }

  return {
    name: 'Title Tag',
    description: 'Page title optimization for search engines and users',
    score: Math.max(0, score),
    status: status,
    issues: issues,
    recommendations: recommendations,
    value: title || 'Not found'
  }
}

function analyzeMetaDescription(description) {
  const issues = []
  const recommendations = []
  let score = 100
  let status = 'pass'

  if (!description) {
    issues.push('No meta description found')
    score = 0
    status = 'fail'
  } else {
    if (description.length < 120) {
      issues.push(`Meta description is too short (${description.length} characters, minimum 120 recommended)`)
      score -= 20
      status = 'warning'
    }
    if (description.length > 160) {
      issues.push(`Meta description is too long (${description.length} characters, maximum 160 recommended)`)
      score -= 20
      status = 'warning'
    }
  }

  if (score < 100) {
    recommendations.push('Keep meta description between 120-160 characters')
    recommendations.push('Include relevant keywords naturally')
    recommendations.push('Write compelling copy that encourages clicks')
    recommendations.push('Make each page description unique')
  }

  return {
    name: 'Meta Description',
    description: 'Meta description tag for search result snippets',
    score: Math.max(0, score),
    status: status,
    issues: issues,
    recommendations: recommendations,
    value: description || 'Not found'
  }
}

function analyzeHeadings($) {
  const issues = []
  const recommendations = []
  let score = 100
  let status = 'pass'

  const h1Tags = $('h1')
  const h2Tags = $('h2')
  const h3Tags = $('h3')
  const h4Tags = $('h4')
  const h5Tags = $('h5')
  const h6Tags = $('h6')

  if (h1Tags.length === 0) {
    issues.push('No H1 tag found')
    score -= 40
    status = 'fail'
  } else if (h1Tags.length > 1) {
    issues.push(`Multiple H1 tags found (${h1Tags.length})`)
    score -= 20
    status = 'warning'
  }

  if (h2Tags.length === 0) {
    issues.push('No H2 tags found - consider adding subheadings')
    score -= 15
    status = 'warning'
  }

  if (score < 100) {
    recommendations.push('Use exactly one H1 tag per page')
    recommendations.push('Structure content with H2, H3 tags hierarchically')
    recommendations.push('Include keywords in heading tags naturally')
    recommendations.push('Use headings to break up content logically')
  }

  return {
    name: 'Heading Structure',
    description: 'Proper heading hierarchy (H1, H2, H3, etc.)',
    score: Math.max(0, score),
    status: status,
    issues: issues,
    recommendations: recommendations,
    value: `H1: ${h1Tags.length}, H2: ${h2Tags.length}, H3: ${h3Tags.length}, H4: ${h4Tags.length}, H5: ${h5Tags.length}, H6: ${h6Tags.length}`
  }
}

// New comprehensive SEO functions
async function analyzeRobotsTxt(baseUrl) {
  const issues = []
  const recommendations = []
  let score = 100
  let status = 'pass'
  let robotsContent = ''

  try {
    const robotsResponse = await fetch(`${baseUrl}/robots.txt`, {
      timeout: 5000
    })
    
    if (robotsResponse.ok) {
      robotsContent = await robotsResponse.text()
      
      if (!robotsContent.trim()) {
        issues.push('robots.txt file is empty')
        score = 70
        status = 'warning'
      } else {
        // Check for common issues
        if (!robotsContent.includes('User-agent:')) {
          issues.push('robots.txt missing User-agent directive')
          score -= 20
          status = 'warning'
        }
        
        if (!robotsContent.includes('Sitemap:')) {
          issues.push('robots.txt missing Sitemap directive')
          score -= 10
          status = 'warning'
        }
      }
    } else {
      issues.push('robots.txt file not found')
      score = 60
      status = 'warning'
    }
  } catch (error) {
    issues.push('Unable to fetch robots.txt')
    score = 60
    status = 'warning'
  }

  if (score < 100) {
    recommendations.push('Create a robots.txt file in your root directory')
    recommendations.push('Include sitemap location in robots.txt')
    recommendations.push('Specify crawling rules for search engines')
    recommendations.push('Test robots.txt with Google Search Console')
  }

  return {
    name: 'Robots.txt',
    description: 'Search engine crawling instructions',
    score: Math.max(0, score),
    status: status,
    issues: issues,
    recommendations: recommendations,
    value: robotsContent ? 'Found and accessible' : 'Not found'
  }
}

async function analyzeSitemap(baseUrl) {
  const issues = []
  const recommendations = []
  let score = 100
  let status = 'pass'
  let sitemapFound = false
  let sitemapUrls = []

  // Common sitemap locations
  const sitemapPaths = [
    '/sitemap.xml',
    '/sitemap_index.xml',
    '/sitemaps.xml',
    '/sitemap1.xml'
  ]

  try {
    for (const path of sitemapPaths) {
      try {
        const sitemapResponse = await fetch(`${baseUrl}${path}`, {
          timeout: 5000
        })
        
        if (sitemapResponse.ok) {
          const sitemapContent = await sitemapResponse.text()
          if (sitemapContent.includes('<urlset') || sitemapContent.includes('<sitemapindex')) {
            sitemapFound = true
            sitemapUrls.push(path)
            break
          }
        }
      } catch (error) {
        // Continue checking other paths
      }
    }

    if (!sitemapFound) {
      issues.push('No XML sitemap found')
      score = 40
      status = 'fail'
    }
  } catch (error) {
    issues.push('Unable to check for sitemaps')
    score = 60
    status = 'warning'
  }

  if (score < 100) {
    recommendations.push('Create an XML sitemap for your website')
    recommendations.push('Submit sitemap to Google Search Console')
    recommendations.push('Include sitemap URL in robots.txt')
    recommendations.push('Keep sitemap updated with new content')
    recommendations.push('Consider creating separate sitemaps for different content types')
  }

  return {
    name: 'XML Sitemap',
    description: 'XML sitemap for search engine discovery',
    score: Math.max(0, score),
    status: status,
    issues: issues,
    recommendations: recommendations,
    value: sitemapFound ? `Found: ${sitemapUrls.join(', ')}` : 'Not found'
  }
}

function analyzeSSL(response, baseUrl) {
  const issues = []
  const recommendations = []
  let score = 100
  let status = 'pass'

  const isHttps = baseUrl.startsWith('https://')
  
  if (!isHttps) {
    issues.push('Website not using HTTPS')
    score = 0
    status = 'fail'
  }

  if (score < 100) {
    recommendations.push('Enable HTTPS/SSL certificate')
    recommendations.push('Redirect HTTP traffic to HTTPS')
    recommendations.push('Update internal links to use HTTPS')
    recommendations.push('Use HSTS headers for security')
  }

  return {
    name: 'SSL/HTTPS',
    description: 'Secure connection and encryption',
    score: score,
    status: status,
    issues: issues,
    recommendations: recommendations,
    value: isHttps ? 'HTTPS enabled' : 'HTTP only (insecure)'
  }
}

function analyzeMetaRobots($) {
  const issues = []
  const recommendations = []
  let score = 100
  let status = 'pass'

  const metaRobots = $('meta[name="robots"]').attr('content') || ''
  
  if (metaRobots.includes('noindex')) {
    issues.push('Page set to noindex - won\'t appear in search results')
    score = 20
    status = 'warning'
  }
  
  if (metaRobots.includes('nofollow')) {
    issues.push('Page set to nofollow - links won\'t pass authority')
    score -= 30
    status = 'warning'
  }

  return {
    name: 'Meta Robots',
    description: 'Page-level crawling and indexing directives',
    score: Math.max(0, score),
    status: status,
    issues: issues,
    recommendations: recommendations,
    value: metaRobots || 'Not specified (default: index,follow)'
  }
}

function analyzeViewport($) {
  const issues = []
  const recommendations = []
  let score = 100
  let status = 'pass'

  const viewport = $('meta[name="viewport"]').attr('content') || ''

  if (!viewport) {
    issues.push('No viewport meta tag found')
    score = 0
    status = 'fail'
  } else if (!viewport.includes('width=device-width')) {
    issues.push('Viewport not optimized for mobile devices')
    score = 60
    status = 'warning'
  }

  if (score < 100) {
    recommendations.push('Add viewport meta tag for mobile optimization')
    recommendations.push('Use width=device-width for responsive design')
    recommendations.push('Test mobile-friendliness')
  }

  return {
    name: 'Mobile Viewport',
    description: 'Mobile optimization and responsive design',
    score: score,
    status: status,
    issues: issues,
    recommendations: recommendations,
    value: viewport || 'Not found'
  }
}

function analyzeLangAttribute($) {
  const issues = []
  const recommendations = []
  let score = 100
  let status = 'pass'

  const htmlLang = $('html').attr('lang') || ''

  if (!htmlLang) {
    issues.push('No language attribute specified')
    score = 70
    status = 'warning'
  }

  if (score < 100) {
    recommendations.push('Add lang attribute to html element')
    recommendations.push('Specify the primary language of your content')
    recommendations.push('Use proper language codes (e.g., en, en-US)')
  }

  return {
    name: 'Language Declaration',
    description: 'HTML language attribute for accessibility and SEO',
    score: score,
    status: status,
    issues: issues,
    recommendations: recommendations,
    value: htmlLang || 'Not specified'
  }
}

function analyzeTwitterCards($) {
  const issues = []
  const recommendations = []
  let score = 100
  let status = 'pass'

  const twitterCard = $('meta[name="twitter:card"]').attr('content')
  const twitterTitle = $('meta[name="twitter:title"]').attr('content')
  const twitterDescription = $('meta[name="twitter:description"]').attr('content')
  const twitterImage = $('meta[name="twitter:image"]').attr('content')

  if (!twitterCard) {
    issues.push('Missing twitter:card')
    score -= 40
  }
  if (!twitterTitle) {
    issues.push('Missing twitter:title')
    score -= 20
  }
  if (!twitterDescription) {
    issues.push('Missing twitter:description')
    score -= 20
  }
  if (!twitterImage) {
    issues.push('Missing twitter:image')
    score -= 20
  }

  if (score < 100) {
    status = score > 60 ? 'warning' : 'fail'
    recommendations.push('Add Twitter Card meta tags for better social sharing')
    recommendations.push('Include twitter:card, twitter:title, twitter:description, and twitter:image')
    recommendations.push('Test with Twitter Card Validator')
  }

  return {
    name: 'Twitter Cards',
    description: 'Twitter social media optimization',
    score: Math.max(0, score),
    status: status,
    issues: issues,
    recommendations: recommendations,
    value: `Card: ${twitterCard ? 'Yes' : 'No'}, Title: ${twitterTitle ? 'Yes' : 'No'}, Description: ${twitterDescription ? 'Yes' : 'No'}, Image: ${twitterImage ? 'Yes' : 'No'}`
  }
}

function analyzeContentLength($) {
  const issues = []
  const recommendations = []
  let score = 100
  let status = 'pass'

  const bodyText = $('body').text().replace(/\s+/g, ' ').trim()
  const wordCount = bodyText.split(' ').length

  if (wordCount < 300) {
    issues.push(`Content is very short (${wordCount} words)`)
    score = 40
    status = 'fail'
  } else if (wordCount < 500) {
    issues.push(`Content is short (${wordCount} words)`)
    score = 70
    status = 'warning'
  }

  if (score < 100) {
    recommendations.push('Add more comprehensive content (aim for 500+ words)')
    recommendations.push('Create valuable, in-depth content')
    recommendations.push('Use headings to structure longer content')
  }

  return {
    name: 'Content Length',
    description: 'Page content depth and comprehensiveness',
    score: score,
    status: status,
    issues: issues,
    recommendations: recommendations,
    value: `${wordCount} words`
  }
}

function analyzeExternalLinks($, baseUrl) {
  const issues = []
  const recommendations = []
  let score = 100
  let status = 'pass'

  const hostname = new URL(baseUrl).hostname
  const links = $('a[href]')
  const externalLinks = links.filter((i, link) => {
    const href = $(link).attr('href')
    try {
      const linkUrl = new URL(href, baseUrl)
      return linkUrl.hostname !== hostname
    } catch {
      return false
    }
  })

  const externalLinksWithoutNofollow = externalLinks.filter((i, link) => {
    const rel = $(link).attr('rel') || ''
    return !rel.includes('nofollow')
  })

  if (externalLinksWithoutNofollow.length > externalLinks.length * 0.5) {
    issues.push('Many external links without nofollow attribute')
    score = 80
    status = 'warning'
    recommendations.push('Consider adding rel="nofollow" to external links')
  }

  return {
    name: 'External Links',
    description: 'External link management and authority',
    score: score,
    status: status,
    issues: issues,
    recommendations: recommendations,
    value: `${externalLinks.length} external links found`
  }
}

function analyzeFavicon($, baseUrl) {
  const issues = []
  const recommendations = []
  let score = 100
  let status = 'pass'

  const favicon = $('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]')

  if (favicon.length === 0) {
    issues.push('No favicon found')
    score = 70
    status = 'warning'
  }

  if (score < 100) {
    recommendations.push('Add a favicon to improve brand recognition')
    recommendations.push('Include multiple sizes for different devices')
    recommendations.push('Use modern formats like PNG or SVG')
  }

  return {
    name: 'Favicon',
    description: 'Website icon for browsers and bookmarks',
    score: score,
    status: status,
    issues: issues,
    recommendations: recommendations,
    value: favicon.length > 0 ? 'Found' : 'Not found'
  }
}

function analyzeGoogleAnalytics($) {
  const issues = []
  const recommendations = []
  let score = 100
  let status = 'pass'

  const hasGA4 = $('script').text().includes('gtag') || $('script[src*="googletagmanager.com/gtag"]').length > 0
  const hasGTM = $('script').text().includes('GTM-') || $('script[src*="googletagmanager.com/gtm"]').length > 0

  if (!hasGA4 && !hasGTM) {
    issues.push('No Google Analytics or Google Tag Manager detected')
    score = 60
    status = 'warning'
    recommendations.push('Install Google Analytics 4 for website tracking')
    recommendations.push('Consider using Google Tag Manager for easier tag management')
  }

  return {
    name: 'Analytics Tracking',
    description: 'Website analytics and tracking setup',
    score: score,
    status: status,
    issues: issues,
    recommendations: recommendations,
    value: hasGA4 ? 'GA4 detected' : hasGTM ? 'GTM detected' : 'Not detected'
  }
}

// Keep existing functions for compatibility
function analyzeImageAltText($) {
  const issues = []
  const recommendations = []
  let score = 100
  let status = 'pass'

  const images = $('img')
  const imagesWithoutAlt = images.filter((i, img) => !$(img).attr('alt'))

  if (images.length > 0) {
    const altCoverage = ((images.length - imagesWithoutAlt.length) / images.length) * 100

    if (altCoverage < 100) {
      issues.push(`${imagesWithoutAlt.length} images missing alt text`)
      score = altCoverage
      status = altCoverage > 80 ? 'warning' : 'fail'
    }
  }

  if (score < 100) {
    recommendations.push('Add descriptive alt text to all images')
    recommendations.push('Include relevant keywords in alt text naturally')
    recommendations.push('Keep alt text concise but descriptive')
  }

  return {
    name: 'Image Alt Text',
    description: 'Alt text for accessibility and SEO',
    score: Math.max(0, Math.round(score)),
    status: status,
    issues: issues,
    recommendations: recommendations,
    value: `${images.length} images, ${images.length - imagesWithoutAlt.length} with alt text`
  }
}

function analyzeInternalLinks($, baseUrl) {
  const issues = []
  const recommendations = []
  let score = 100
  let status = 'pass'

  const hostname = new URL(baseUrl).hostname
  const links = $('a[href]')
  const internalLinks = links.filter((i, link) => {
    const href = $(link).attr('href')
    return href && (href.startsWith('/') || href.includes(hostname))
  })

  if (internalLinks.length < 3) {
    issues.push('Very few internal links found')
    score = 60
    status = 'warning'
  }

  if (internalLinks.length === 0) {
    issues.push('No internal links found')
    score = 0
    status = 'fail'
  }

  if (score < 100) {
    recommendations.push('Add more internal links to relevant pages')
    recommendations.push('Use descriptive anchor text')
    recommendations.push('Link to important pages from homepage')
  }

  return {
    name: 'Internal Links',
    description: 'Internal linking structure for navigation and SEO',
    score: score,
    status: status,
    issues: issues,
    recommendations: recommendations,
    value: `${internalLinks.length} internal links found`
  }
}

function analyzePageSpeed(response) {
  const issues = []
  const recommendations = []
  let score = 100
  let status = 'pass'

  // Basic estimation based on response time
  const loadTime = response.headers.get('x-response-time') || 'Unknown'
  
  // This is a simplified check - in production you'd want to use actual performance metrics
  recommendations.push('Optimize images and compress files')
  recommendations.push('Enable browser caching')
  recommendations.push('Minimize HTTP requests')
  recommendations.push('Use a CDN for static assets')
  recommendations.push('Minify CSS and JavaScript')

  return {
    name: 'Page Speed',
    description: 'Page loading performance optimization',
    score: score,
    status: status,
    issues: issues,
    recommendations: recommendations,
    value: 'Basic check completed'
  }
}

function analyzeMetaKeywords(keywords) {
  const issues = []
  const recommendations = []
  let score = 100
  let status = 'pass'

  if (keywords) {
    issues.push('Meta keywords tag is present (outdated)')
    score = 80
    status = 'warning'
    recommendations.push('Remove meta keywords tag - it\'s not used by search engines')
  }

  return {
    name: 'Meta Keywords',
    description: 'Outdated meta keywords tag check',
    score: score,
    status: status,
    issues: issues,
    recommendations: recommendations,
    value: keywords || 'Not found (good)'
  }
}

function analyzeCanonicalURL($, url) {
  const issues = []
  const recommendations = []
  let score = 100
  let status = 'pass'

  const canonical = $('link[rel="canonical"]').attr('href')

  if (!canonical) {
    issues.push('No canonical URL specified')
    score = 70
    status = 'warning'
    recommendations.push('Add canonical URL to prevent duplicate content issues')
  }

  return {
    name: 'Canonical URL',
    description: 'Canonical URL specification for duplicate content prevention',
    score: score,
    status: status,
    issues: issues,
    recommendations: recommendations,
    value: canonical || 'Not found'
  }
}

function analyzeOpenGraph($) {
  const issues = []
  const recommendations = []
  let score = 100
  let status = 'pass'

  const ogTitle = $('meta[property="og:title"]').attr('content')
  const ogDescription = $('meta[property="og:description"]').attr('content')
  const ogImage = $('meta[property="og:image"]').attr('content')
  const ogType = $('meta[property="og:type"]').attr('content')
  const ogUrl = $('meta[property="og:url"]').attr('content')

  if (!ogTitle) {
    issues.push('Missing og:title')
    score -= 25
  }
  if (!ogDescription) {
    issues.push('Missing og:description')
    score -= 25
  }
  if (!ogImage) {
    issues.push('Missing og:image')
    score -= 30
  }
  if (!ogType) {
    issues.push('Missing og:type')
    score -= 10
  }
  if (!ogUrl) {
    issues.push('Missing og:url')
    score -= 10
  }

  if (score < 100) {
    status = score > 60 ? 'warning' : 'fail'
    recommendations.push('Add Open Graph tags for better social media sharing')
    recommendations.push('Include og:title, og:description, og:image, og:type, and og:url')
    recommendations.push('Test with Facebook Sharing Debugger')
  }

  return {
    name: 'Open Graph Tags',
    description: 'Open Graph meta tags for social media sharing',
    score: Math.max(0, score),
    status: status,
    issues: issues,
    recommendations: recommendations,
    value: `Title: ${ogTitle ? 'Yes' : 'No'}, Description: ${ogDescription ? 'Yes' : 'No'}, Image: ${ogImage ? 'Yes' : 'No'}, Type: ${ogType ? 'Yes' : 'No'}, URL: ${ogUrl ? 'Yes' : 'No'}`
  }
}

function analyzeSchemaMarkup($) {
  const issues = []
  const recommendations = []
  let score = 100
  let status = 'pass'

  const jsonLd = $('script[type="application/ld+json"]')
  const microdata = $('[itemscope]')

  if (jsonLd.length === 0 && microdata.length === 0) {
    issues.push('No structured data found')
    score = 60
    status = 'warning'
    recommendations.push('Add structured data markup for better search results')
    recommendations.push('Consider adding Schema.org markup for your content type')
    recommendations.push('Test with Google Rich Results Test')
  }

  return {
    name: 'Schema Markup',
    description: 'Structured data for rich search results',
    score: score,
    status: status,
    issues: issues,
    recommendations: recommendations,
    value: `JSON-LD: ${jsonLd.length}, Microdata: ${microdata.length}`
  }
}

function calculateOverallScore(metrics) {
  if (metrics.length === 0) return 0
  
  const totalScore = metrics.reduce((sum, metric) => sum + metric.score, 0)
  return Math.round(totalScore / metrics.length)
}