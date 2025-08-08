import { useRef, useState } from 'react';
import { useAuth } from '@/auth/context/auth-context';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { tr } from 'framer-motion/client';
import {
  AlertCircle,
  BriefcaseBusiness,
  Check,
  Eye,
  EyeOff,
  HandHelping,
  LoaderCircleIcon,
  PersonStanding,
  Truck,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Stepper } from '../../components/ui/stepper';
import { ApiConfig } from '../context/EndPoints';
import { getSignupSchema } from '../forms/signup-schema';
import { CountryFlag } from './CountryFlag';
import { useTheme } from 'next-themes';

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [step, setStep] = useState(0); // 0: Personal, 1: Business, 2: Terms
  const fileInputRef = useRef();
  const { theme } = useTheme();

  const form = useForm({
    resolver: zodResolver(getSignupSchema()),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      //   lastName: '',
      vendorName: '',
      jobTitle: '',
      dateOfBirth: '',
      contact: '',
      kycDocument: null,
      terms: false,
      // Remove old business fields, add new ones for step 1
      businessType: '',
      businessStructure: '',
      businessName: '',
      businessLicense: null,
      doingBusinessAs: '',
      avgMonthlyRevenue: '',
      supportMembers: '',
      responseTime: '',
      vatNumber: '',
      businessWebsite: '',
      country: '',
      city: '',
      postalCode: '',
      address: '',
      referenceId: '',
    },
  });

  async function onSubmit(values) {
    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('name', values.name); // "Test name"
      formData.append('email', values.email); // "test5698231@gmail.com"
      formData.append('password', values.password); // "123456789"
      formData.append('password_confirmation', values.confirmPassword); // "123456789"
      formData.append('business_type', values.businessType); // "test"
      formData.append('business_name', values.businessName); // "test"
      formData.append('vendor_name', values.vendorName); // "test"
      formData.append('website', values.businessWebsite); // "test.com"
      formData.append('contact', values.contact); // "01403368205"
      formData.append('job_title', values.jobTitle); // "test"
      formData.append('date_of_birth', values.dateOfBirth); // "1997-07-08"
      formData.append('country', values.country); // "Bangladesh"
      formData.append('city', values.city); // "dhaka"
      formData.append('postal_code', values.postalCode); // "1205"
      formData.append('address', values.address); // "Mirpur"
      formData.append('business_structure', values.businessStructure); // "Test test"
      formData.append('business_as', values.doingBusinessAs); // "Test"
      formData.append('monthly_revenue', values.avgMonthlyRevenue); // "120"
      formData.append('support_members', values.supportMembers); // "120"
      formData.append('usual_response_time', values.responseTime); // "10"
      formData.append('vat_number', values.vatNumber); // "1256389"
      formData.append('reference_id', values.referenceId ?? ''); // Optional field

      // Append file inputs only if present
      if (values.kycDocument) {
        formData.append('kyc', values.kycDocument); // File object
      }

      if (values.businessLicense) {
        formData.append('business_license', values.businessLicense); // File object
      }

      // Axios request
      const response = await axios.post(
        'https://apipayment.sellhub.net/api/seller/register',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        },
      );

      if (response?.data?.status === true) {
        toast.success('Registration successful. Please verify your email.');
        setSuccessMessage('Registration successful. Please verify your email.');
        navigate('/auth/register-otp', {
          state: { email: values.email ?? response?.data?.otp_email },
        });
      } else {
        console.log("sdgsdgdsagsd",response);
        toast.error(response?.data?.errors[0] || "Registration failed. Please try again.")
        // setError(
        //   response?.data?.errors[0] || 'Registration failed. Please try again.',
        // );
      }
    } catch (err) {
      console.log("sdgsadgadsgsadgsafassfafas",err);
      setError(
        err.response?.data?.errors ||
          err.message ||
          'An unexpected error occurred during registration. Please try again.',
      );
    } finally {
      setIsProcessing(false);
    }
  }

  // async function onSubmit(values) {
  //   setIsProcessing(true);
  //   setError(null);

  //   try {
  //     const formData = new FormData();
  //     formData.append('name', values.name);
  //     formData.append('email', values.email);
  //     formData.append('password', values.password);
  //     formData.append('password_confirmation', values.confirmPassword);
  //     formData.append('business_type', values.businessType);
  //     formData.append('business_name', values.businessName);
  //     formData.append('vendor_name', values.vendorName);
  //     formData.append('website', values.businessWebsite);
  //     formData.append('contact', values.contact);
  //     formData.append('job_title', values.jobTitle);
  //     formData.append('date_of_birth', values.dateOfBirth);
  //     formData.append('country', values.country);
  //     formData.append('city', values.city);
  //     formData.append('postal_code', values.postalCode);
  //     formData.append('address', values.address);
  //     formData.append('business_structure', values.businessStructure);
  //     formData.append('business_as', values.doingBusinessAs);
  //     formData.append('monthly_revenue', values.avgMonthlyRevenue);
  //     formData.append('support_members', values.supportMembers);
  //     formData.append('usual_response_time', values.responseTime);
  //     formData.append('vat_number', values.vatNumber);
  //     formData.append('reference_id', values.referenceId);

  //     // Only append files if they exist
  //     if (values.kycDocument) {
  //       formData.append('kyc', values.kycDocument);
  //     }
  //     if (values.businessLicense) {
  //       formData.append('business_license', values.businessLicense);
  //     }

  //     // Send the request
  //     const response = await axios.post('https://apipayment.sellhub.net/api/seller/register', formData, {
  //       headers: {
  //         'Content-Type': 'multipart/form-data',
  //       },
  //       withCredentials: true,
  //     });

  //     if (response?.status === true) {
  //       toast.success('Registration successful. Please verify your email.');
  //       setSuccessMessage('Registration successful. Please verify your email.');
  //       navigate('/auth/register-otp', { state: { email: values.email ?? response?.otp_email } });
  //     }
  //   } catch (err) {
  //     setError(
  //       err.response?.data?.message ||
  //         err.message ||
  //         'An unexpected error occurred during registration. Please try again.',
  //     );
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // }

  // Stepper UI
  const steps = [
    { label: (<><span>Personal<br/>Information</span></>), icon: PersonStanding },
    { label: 'Business', icon: BriefcaseBusiness },
    { label: 'Terms', icon: HandHelping },
    // { label: 'Ordered', icon: Check },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10">
      <Card className="w-full max-w-[800px]">
        <div className="pt-8 flex items-center justify-center">
        {theme === 'dark' ? (
            <img
              src={toAbsoluteUrl('/media/app/default-logo-dark.png')}
              className="h-[48px] max-w-none"
              alt="Dark Logo"
            />
          ) : (
            <img
              src={toAbsoluteUrl('/media/app/sellhublogoblack.png')}
              className="h-[48px] max-w-none"
              alt="Light Logo"
            />
          )}

         
        </div>

        <CardContent className="p-6 sm:p-8">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="block w-full space-y-5"
              encType="multipart/form-data"
            >
              {/* Stepper */}
              <div className="flex flex-col items-center mb-6 w-full">
                <div className="flex flex-row items-start justify-between w-full max-w-lg mx-auto">
                  {steps.map((s, idx) => {
                    const Icon = s.icon;
                    const isCompleted = idx < step;
                    const isActive = idx === step;
                    const isUpcoming = idx > step;
                    return (
                      <>
                        <div
                          key={s.label}
                          className="flex flex-col items-center flex-1 min-w-0"
                        >
                          <div
                            className={`rounded-full w-10 h-10 flex items-center justify-center font-bold border-2 transition-colors duration-200 
                              ${isCompleted ? 'bg-[#d8bd0e] border-[#d8bd0e] text-white' : ''}
                              ${isActive ? 'bg-white border-[##d8bd0e] text-[#d8bd0e]' : ''}
                              ${isUpcoming ? 'bg-white border-gray-300 text-gray-400' : ''}
                              relative mx-auto`}
                          >
                            {isCompleted ? (
                              <Check className="w-6 h-6 text-white" />
                            ) : (
                              <Icon
                                className={`w-6 h-6 ${isActive ? 'text-[#000]' : isUpcoming ? 'text-gray-400' : 'text-white'}`}
                              />
                            )}
                          </div>
                          <span
                            className={`mt-3 text-xs 
    ${isActive ? 'font-bold text-[#d8bd0e]' : isCompleted ? 'text-[#d8bd0e]' : 'text-gray-500'}
    whitespace-nowrap sm:whitespace-normal text-[8px] sm:text-xs text-center`}
                          >
                            {s.label}
                          </span>
                          {/* <span
                            className={`mt-3 text-xs whitespace-nowrap ${isActive ? 'font-bold text-[#d8bd0e]' : isCompleted ? 'text-[#d8bd0e]' : 'text-gray-500'}`}
                          >
                            {s.label}
                          </span> */}
                        </div>
                        {idx < steps.length - 1 && (
                          <div
                            className={`h-0.5 flex-1 mx-2 mt-5 rounded-full transition-colors duration-200 self-center 
                              ${idx < step ? 'bg-[#d8bd0e]' : 'bg-gray-300'}`}
                            style={{ minWidth: 32 }}
                          />
                        )}
                      </>
                    );
                  })}
                </div>
              </div>

              {/* Alerts */}
              {error && (
                <Alert
                  variant="destructive"
                  appearance="light"
                  onClose={() => setError(null)}
                >
                  <AlertIcon>
                    <AlertCircle />
                  </AlertIcon>
                  <AlertTitle>{error}</AlertTitle>
                </Alert>
              )}
              {successMessage && (
                <Alert
                  appearance="light"
                  onClose={() => setSuccessMessage(null)}
                >
                  <AlertIcon>
                    <Check />
                  </AlertIcon>
                  <AlertTitle>{successMessage}</AlertTitle>
                </Alert>
              )}

              {/* Step 1: Personal Info */}
              {step === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your email address"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password *</FormLabel>
                        <div className="relative">
                          <Input
                            placeholder="Create a password"
                            type={passwordVisible ? 'text' : 'password'}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            mode="icon"
                            onClick={() => setPasswordVisible(!passwordVisible)}
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          >
                            {passwordVisible ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password Confirmation *</FormLabel>
                        <div className="relative">
                          <Input
                            placeholder="Confirm your password"
                            type={confirmPasswordVisible ? 'text' : 'password'}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            mode="icon"
                            onClick={() =>
                              setConfirmPasswordVisible(!confirmPasswordVisible)
                            }
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          >
                            {confirmPasswordVisible ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vendorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vendor Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Your business name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jobTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your position in the company"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="mm/dd/yyyy"
                            type="date"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact *</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="kycDocument"
                    render={({ field: { onChange, ...rest } }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>KYC Document</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="application/pdf,image/*"
                            ref={fileInputRef}
                            onChange={(e) => {
                              const file =
                                e.target.files && e.target.files.length > 0
                                  ? e.target.files[0]
                                  : null;
                              onChange(file);
                            }}
                            // {...rest}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 2: Business */}
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business type *</FormLabel>
                        <FormControl>
                          <select
                            className="form-select w-full bg-transparent border rounded px-3 py-2"
                            {...field}
                          >
                            <option value="">--Select--</option>
                            <option value="individual">Individual</option>
                            <option value="company">Company</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="businessStructure"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business structure *</FormLabel>
                        <FormControl>
                          <select
                            className="form-select w-full bg-transparent border rounded px-3 py-2"
                            {...field}
                          >
                            <option value="">--Select--</option>
                            <option value="sale">Sale Partnership</option>
                            <option value="partnership">Partnership</option>
                            <option value="corporation">Corporation</option>
                            <option value="other">Other</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Legal business name * </FormLabel>
                        <FormControl>
                          <Input placeholder="Business name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="businessLicense"
                    render={({ field: { onChange, ...rest } }) => (
                      <FormItem>
                        <FormLabel>Business license</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="application/pdf,image/*"
                            ref={fileInputRef}
                            onChange={(e) => {
                              const file =
                                e.target.files && e.target.files.length > 0
                                  ? e.target.files[0]
                                  : null;
                              onChange(file);
                            }}
                            // {...rest}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="doingBusinessAs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Doing business as (public name) *</FormLabel>
                        <FormControl>
                          <Input placeholder="XXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="avgMonthlyRevenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Average monthly revenue *</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <span className="mr-2">$</span>
                            <Input type="number" placeholder="xxx" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="supportMembers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Support members *</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="xxx" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="responseTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usual response time *</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <Input  type="number" placeholder="In minutes" {...field} />
                            <span className="ml-2">minutes</span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vatNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>VAT number</FormLabel>
                        <FormControl>
                          <Input placeholder="If any" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="businessWebsite"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business website *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="http://yourwebsite.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country *</FormLabel>
                        <FormControl>
                          <select
                            className="form-select w-full bg-transparent border rounded px-3 py-2"
                            {...field}
                          >
                            <option value="">--Select--</option>
                            {CountryFlag?.map((country) => (
                              <option
                                key={country.phonecode}
                                value={country.name}
                              >
                                {country.name}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country *</FormLabel>
                        <FormControl>
                          <select
                            className="form-select w-full bg-transparent border rounded px-3 py-2"
                            {...field}
                          >
                            <option value="">--Select--</option>
                            <option value="Bangladesh">Bangladesh</option>
                            <option value="India">India</option>
                            <option value="USA">USA</option>
                            <option value="UK">UK</option>
                            <option value="Other">Other</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City *</FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal code *</FormLabel>
                        <FormControl>
                          <Input placeholder="Postal code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address *</FormLabel>
                        <FormControl>
                          <Input placeholder="Address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 3: Terms */}
              {step === 2 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="referenceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reference ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your reference ID"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem className="rounded-md">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mr-2"
                          />
                        </FormControl>
                        <div className="inline-block align-middle">
                          <FormLabel className="font-semibold">
                            I agree to the SellHub Terms of Service and Privacy
                            Policy
                          </FormLabel>
                          <div className="text-xs text-muted-foreground mt-1">
                            By checking this box, you confirm that you have
                            read, understood, and agree to be bound by our terms
                            and conditions. You also acknowledge that you are
                            authorized to represent your business and agree to
                            our data processing practices.
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                {step > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                  >
                    Back
                  </Button>
                )}
                {step < 2 && (
                  <Button
                    type="button"
                    onClick={async () => {
                      let fieldsToValidate = [];
                      if (step === 0) {
                        fieldsToValidate = [
                          "name",
                          "email",
                          "password",
                          "confirmPassword",
                          "vendorName",
                          "jobTitle",
                          "dateOfBirth",
                          "contact"
                        ];
                      } else if (step === 1) {
                        fieldsToValidate = [
                          "businessType",
                          "businessStructure",
                          "businessName",
                          "doingBusinessAs",
                          "avgMonthlyRevenue",
                          "supportMembers",
                          "responseTime",
                          "businessWebsite",
                          "country",
                          "city",
                          "postalCode",
                          "address"
                        ];
                      }
                      const valid = await form.trigger(fieldsToValidate);
                      if (valid) setStep(step + 1);
                    }}
                  >
                    Next
                  </Button>
                )}
                {step === 2 && (
                  <Button
                    type="submit"
                    className=" text-white font-semibold px-8"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <LoaderCircleIcon className="h-4 w-4 animate-spin" />{' '}
                        Submitting...
                      </span>
                    ) : (
                      'Submit'
                    )}
                  </Button>
                )}
              </div>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link
                  to="/auth/signin"
                  className="text-sm font-semibold text-foreground hover:text-primary"
                >
                  Sign In
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
