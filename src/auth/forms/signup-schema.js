import { z } from 'zod';

export const getSignupSchema = () => {
  return z
    .object({
      email: z
        .string()
        .email({ message: 'Please enter a valid email address.' })
        .min(1, { message: 'Email is required.' }),
      password: z
        .string()
        .min(6, { message: 'Password must be at least 6 characters.' })
        .regex(/[A-Z]/, {
          message: 'Password must contain at least one uppercase letter.',
        })
        .regex(/[0-9]/, {
          message: 'Password must contain at least one number.',
        }),
      confirmPassword: z
        .string()
        .min(1, { message: 'Please confirm your password.' }),
        name: z.string().min(1, { message: 'Name is required.' }),
      // lastName: z.string().min(1, { message: 'Last name is required.' }),
      businessType: z.string().nonempty("Business type is required"),
      businessStructure: z.string().nonempty("Business structure is required"),
      businessName: z.string().nonempty("Legal business name is required"),
      vendorName: z.string().nonempty("Vendor name is required"),
      contact: z.string().nonempty("Contact  is required"),
      dateOfBirth: z.string().nonempty("Date Of Birth  is required"),
      jobTitle: z.string().nonempty("Job title is required"),
      kycDocument: z.any().optional(),
      businessLicense: z.any().optional(),
      vatNumber: z.any().optional(),
      referenceId: z.any().optional(),
      // businessLicense: z.any().refine(file => !!file, "Business license is required"),
      doingBusinessAs: z.string().nonempty("Doing business as is required"),
      // avgMonthlyRevenue: z.string().nonempty("Average monthly revenue is required"),
      avgMonthlyRevenue: z
      .string()
      .nonempty("Average monthly revenue is required")
      .regex(/^\d+$/, { message: "Average monthly revenue must be a number" }),
      supportMembers: z
        .string()
        .nonempty("Support members is required")
        .regex(/^\d+$/, { message: "Support members must be a number" }),
        responseTime: z
        .string()
        .nonempty("Response time is required")
        .regex(/^\d+$/, { message: "Response time must be a number" }),
      // responseTime: z.string().nonempty("Response time is required"),
      // vatNumber: z.string().nonempty("VAT number is required"),
      businessWebsite: z.string().nonempty("Business website is required"),
      country: z.string().nonempty("Country is required"),
      city: z.string().nonempty("City is required"),
      postalCode: z.string().nonempty("Postal code is required"),
      address: z.string().nonempty("Address is required"),
      // Step 2
      // referenceId: z.string().nonempty("Reference ID is required"),
      // terms: z.literal(true, { errorMap: () => ({ message: "You must accept the terms" }) }),
      
      terms: z.boolean().refine((val) => val === true, {
        message: 'You must agree to the terms and conditions.',
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    });
};
