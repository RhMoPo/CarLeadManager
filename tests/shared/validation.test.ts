import { describe, it, expect } from 'vitest';
import { z } from 'zod';

describe('Data Validation', () => {
  describe('Lead Validation', () => {
    const leadSchema = z.object({
      make: z.string().min(1, 'Make is required'),
      model: z.string().min(1, 'Model is required'),
      year: z.number()
        .min(1900, 'Year must be after 1900')
        .max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
      mileage: z.number().min(0, 'Mileage cannot be negative'),
      askingPrice: z.string().regex(/^\d+(\.\d{2})?$/, 'Invalid price format'),
      sourceUrl: z.string().url('Must be a valid URL'),
      sellerContact: z.string().min(1, 'Seller contact is required'),
    });

    it('should validate correct lead data', () => {
      const validLead = {
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        mileage: 50000,
        askingPrice: '25000.00',
        sourceUrl: 'https://autotrader.com/listing/123',
        sellerContact: '555-123-4567',
      };

      const result = leadSchema.safeParse(validLead);
      expect(result.success).toBe(true);
    });

    it('should reject invalid lead data', () => {
      const invalidLeads = [
        {
          make: '', // Empty make
          model: 'Camry',
          year: 2020,
          mileage: 50000,
          askingPrice: '25000.00',
          sourceUrl: 'https://autotrader.com/listing/123',
          sellerContact: '555-123-4567',
        },
        {
          make: 'Toyota',
          model: 'Camry',
          year: 1800, // Year too old
          mileage: 50000,
          askingPrice: '25000.00',
          sourceUrl: 'https://autotrader.com/listing/123',
          sellerContact: '555-123-4567',
        },
        {
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          mileage: -1000, // Negative mileage
          askingPrice: '25000.00',
          sourceUrl: 'https://autotrader.com/listing/123',
          sellerContact: '555-123-4567',
        },
        {
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          mileage: 50000,
          askingPrice: 'invalid-price', // Invalid price format
          sourceUrl: 'https://autotrader.com/listing/123',
          sellerContact: '555-123-4567',
        },
        {
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          mileage: 50000,
          askingPrice: '25000.00',
          sourceUrl: 'not-a-url', // Invalid URL
          sellerContact: '555-123-4567',
        },
      ];

      invalidLeads.forEach(lead => {
        const result = leadSchema.safeParse(lead);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('User Validation', () => {
    const userSchema = z.object({
      email: z.string().email('Invalid email format'),
      role: z.enum(['SUPERADMIN', 'VA'], { 
        errorMap: () => ({ message: 'Role must be SUPERADMIN or VA' }) 
      }),
    });

    it('should validate correct user data', () => {
      const validUsers = [
        { email: 'admin@company.com', role: 'SUPERADMIN' as const },
        { email: 'va@company.com', role: 'VA' as const },
      ];

      validUsers.forEach(user => {
        const result = userSchema.safeParse(user);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid user data', () => {
      const invalidUsers = [
        { email: 'invalid-email', role: 'SUPERADMIN' as const },
        { email: 'valid@email.com', role: 'INVALID_ROLE' },
      ];

      invalidUsers.forEach(user => {
        const result = userSchema.safeParse(user);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Commission Validation', () => {
    const commissionSchema = z.object({
      percentage: z.number()
        .min(0, 'Commission cannot be negative')
        .max(1, 'Commission cannot exceed 100%'),
    });

    it('should validate commission percentages', () => {
      const validCommissions = [
        { percentage: 0.05 }, // 5%
        { percentage: 0.10 }, // 10%
        { percentage: 0.15 }, // 15%
        { percentage: 0.20 }, // 20%
      ];

      validCommissions.forEach(commission => {
        const result = commissionSchema.safeParse(commission);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid commission percentages', () => {
      const invalidCommissions = [
        { percentage: -0.05 }, // Negative
        { percentage: 1.05 },  // Over 100%
        { percentage: 2.0 },   // Way over 100%
      ];

      invalidCommissions.forEach(commission => {
        const result = commissionSchema.safeParse(commission);
        expect(result.success).toBe(false);
      });
    });
  });
});