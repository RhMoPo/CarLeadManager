import { logger } from '../utils/logger';

interface OGPreview {
  title?: string;
  description?: string;
  image?: string;
}

class OGScraper {
  async scrape(url: string, timeout = 2000): Promise<OGPreview> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CarLeadBot/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      return this.parseOGTags(html);
    } catch (error) {
      logger.warn('OG scraping failed', { url, error: error instanceof Error ? error.message : 'Unknown error' });
      return {};
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private parseOGTags(html: string): OGPreview {
    const result: OGPreview = {};

    // Simple regex parsing (could use a proper HTML parser in production)
    const ogTitle = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i);
    const ogDescription = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i);
    const ogImage = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i);

    if (ogTitle) result.title = ogTitle[1];
    if (ogDescription) result.description = ogDescription[1];
    if (ogImage) result.image = ogImage[1];

    return result;
  }
}

export const ogScraper = new OGScraper();
