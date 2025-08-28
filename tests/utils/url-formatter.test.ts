import { describe, it, expect } from 'vitest';

// URL formatting utility function (based on your existing implementation)
function formatSourceUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    let domain = urlObj.hostname.replace('www.', '').replace('m.', '');
    
    // Domain-specific formatting
    const formatMap: Record<string, string> = {
      'facebook.com': 'Facebook Marketplace',
      'autotrader.co.uk': 'AutoTrader UK',
      'cars.co.uk': 'Cars.co.uk',
      'pistonheads.com': 'PistonHeads',
      'ebay.co.uk': 'eBay Motors',
      'gumtree.com': 'Gumtree',
      'spareroom.co.uk': 'SpareRoom',
    };
    
    if (formatMap[domain]) {
      return formatMap[domain];
    }
    
    // For unknown domains, capitalize first letter of domain name
    const domainName = domain.split('.')[0];
    return domainName.charAt(0).toUpperCase() + domainName.slice(1);
  } catch {
    // For invalid URLs, try to extract domain-like part and format it
    const parts = url.split('://');
    if (parts.length > 1) {
      const domainPart = parts[1].split('/')[0].split('.')[0];
      return domainPart.charAt(0).toUpperCase() + domainPart.slice(1);
    }
    return url;
  }
}

describe('URL Formatter', () => {
  it('should format Facebook Marketplace URLs', () => {
    const urls = [
      'https://www.facebook.com/marketplace/item/123456789/',
      'https://facebook.com/marketplace/item/987654321/',
      'https://m.facebook.com/marketplace/item/456789123/',
    ];

    urls.forEach(url => {
      expect(formatSourceUrl(url)).toBe('Facebook Marketplace');
    });
  });

  it('should format AutoTrader URLs', () => {
    const urls = [
      'https://www.autotrader.co.uk/car-details/123456789',
      'https://autotrader.co.uk/classified/advert/987654321',
    ];

    urls.forEach(url => {
      expect(formatSourceUrl(url)).toBe('AutoTrader UK');
    });
  });

  it('should format other known car sites', () => {
    const testCases = [
      { url: 'https://www.cars.co.uk/car-for-sale/123', expected: 'Cars.co.uk' },
      { url: 'https://pistonheads.com/classifieds/used-cars/456', expected: 'PistonHeads' },
      { url: 'https://www.ebay.co.uk/itm/789', expected: 'eBay Motors' },
      { url: 'https://gumtree.com/cars/london/012', expected: 'Gumtree' },
    ];

    testCases.forEach(({ url, expected }) => {
      expect(formatSourceUrl(url)).toBe(expected);
    });
  });

  it('should handle unknown domains gracefully', () => {
    const testCases = [
      { url: 'https://www.somecarsite.com/listing/123', expected: 'Somecarsite' },
      { url: 'https://newcardealer.co.uk/cars/456', expected: 'Newcardealer' },
      { url: 'https://localmotors.net/car/789', expected: 'Localmotors' },
    ];

    testCases.forEach(({ url, expected }) => {
      expect(formatSourceUrl(url)).toBe(expected);
    });
  });

  it('should handle invalid URLs by returning original string or formatted version', () => {
    const testCases = [
      { input: 'not-a-url', expected: 'not-a-url' },
      { input: 'ftp://invalid-protocol.com', expected: 'Invalid-protocol' }, // FTP URLs get formatted
      { input: 'just-text', expected: 'just-text' },
      { input: '', expected: '' },
    ];

    testCases.forEach(({ input, expected }) => {
      expect(formatSourceUrl(input)).toBe(expected);
    });
  });

  it('should remove www prefix consistently', () => {
    const testCases = [
      { 
        url: 'https://www.facebook.com/marketplace/item/123',
        expected: 'Facebook Marketplace'
      },
      { 
        url: 'https://facebook.com/marketplace/item/123',
        expected: 'Facebook Marketplace'
      },
    ];

    testCases.forEach(({ url, expected }) => {
      expect(formatSourceUrl(url)).toBe(expected);
    });
  });
});