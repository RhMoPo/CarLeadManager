import { logger } from '../utils/logger';

interface OGPreview {
  title?: string;
  description?: string;
  image?: string;
}

class OGScraper {
  async scrape(url: string, timeout = 5000): Promise<OGPreview> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      const result = this.parseOGTags(html, url);
      
      if (result.image) {
        logger.info('Successfully extracted image', { url, image: result.image });
      } else {
        logger.warn('No image found in HTML', { url });
      }
      
      return result;
    } catch (error) {
      logger.warn('OG scraping failed', { url, error: error instanceof Error ? error.message : 'Unknown error' });
      return {};
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private parseOGTags(html: string, baseUrl: string): OGPreview {
    const result: OGPreview = {};

    // Try multiple image sources in order of preference
    const imageSources = [
      // Open Graph image
      /<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i,
      // Twitter card image
      /<meta[^>]*name="twitter:image"[^>]*content="([^"]*)"[^>]*>/i,
      // Facebook specific image
      /<meta[^>]*property="og:image:url"[^>]*content="([^"]*)"[^>]*>/i,
      // Generic meta image
      /<meta[^>]*name="image"[^>]*content="([^"]*)"[^>]*>/i,
      // Look for common car listing site patterns
      /<img[^>]*class="[^"]*hero[^"]*"[^>]*src="([^"]*)"[^>]*>/i,
      /<img[^>]*class="[^"]*main[^"]*"[^>]*src="([^"]*)"[^>]*>/i,
      /<img[^>]*class="[^"]*primary[^"]*"[^>]*src="([^"]*)"[^>]*>/i,
      /<img[^>]*class="[^"]*featured[^"]*"[^>]*src="([^"]*)"[^>]*>/i,
      // First img tag that looks substantial
      /<img[^>]*src="([^"]+\.(jpg|jpeg|png|webp)[^"]*)"[^>]*>/i,
    ];

    // Try to find an image from any of these sources
    for (const regex of imageSources) {
      const match = html.match(regex);
      if (match && match[1] && this.isValidImageUrl(match[1])) {
        result.image = this.normalizeUrl(match[1], baseUrl);
        break;
      }
    }

    // Parse title and description
    const ogTitle = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i);
    const ogDescription = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i);
    const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const metaDescription = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);

    result.title = ogTitle?.[1] || titleTag?.[1] || '';
    result.description = ogDescription?.[1] || metaDescription?.[1] || '';

    return result;
  }

  private isValidImageUrl(url: string): boolean {
    if (!url || url.length < 10) return false;
    
    // Check if it's a reasonable image URL
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|$)/i;
    const hasImageExtension = imageExtensions.test(url);
    
    // Allow URLs that don't have extension but look like image URLs
    const looksLikeImage = url.includes('image') || url.includes('photo') || url.includes('pic');
    
    // Reject obviously bad URLs
    const isBadUrl = url.includes('favicon') || 
                     (url.includes('logo') && url.includes('small')) ||
                     (url.includes('thumb') && url.includes('tiny')) ||
                     url.includes('avatar') ||
                     (url.includes('icon') && url.length < 50);
    
    return (hasImageExtension || looksLikeImage) && !isBadUrl;
  }

  private normalizeUrl(url: string, baseUrl: string): string {
    // Handle relative URLs by making them absolute
    if (url.startsWith('//')) {
      return 'https:' + url;
    }
    if (url.startsWith('/')) {
      try {
        const base = new URL(baseUrl);
        return base.origin + url;
      } catch {
        return url;
      }
    }
    return url;
  }
}

export const ogScraper = new OGScraper();
