import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Shield, 
  Apple, 
  ChevronDown,
  FileText,
  User,
  Building
} from "lucide-react";

export default function PaymentCardInfo() {
  const [cardData, setCardData] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    saveCard: false,
  });

  const [showSellerDetails, setShowSellerDetails] = useState(false);

  const handleInputChange = (field, value) => {
    setCardData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const months = [
    "01", "02", "03", "04", "05", "06", 
    "07", "08", "09", "10", "11", "12"
  ];

  const years = Array.from({ length: 10 }, (_, i) => 
    (new Date().getFullYear() + i).toString()
  );

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (value) => {
    const formatted = formatCardNumber(value);
    handleInputChange("cardNumber", formatted);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10">
      <Card className="w-full max-w-6xl">
        <CardContent className="p-8">
          {/* Header */}
          <div className="border-b border-border mb-8 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-foreground font-medium">
                    TESTER ACCOUNT
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Payment Details */}
            <div className="space-y-6">
              {/* Navigation Tabs */}
              <div className="flex items-center space-x-8 border-b border-border">
                <div className="relative">
                  <button className="text-foreground font-medium pb-2">
                    Customer Info
                  </button>
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-500"></div>
                </div>
                <div className="relative">
                  <button className="text-muted-foreground font-medium pb-2">
                    Payment Details
                  </button>
                </div>
              </div>

              {/* Express Checkout Buttons */}
              <div className="space-y-4">
                <Button 
                  className="w-full bg-black text-white hover:bg-gray-800 h-12 text-base font-medium"
                >
                  <Apple className="w-5 h-5 mr-2" />
                  Buy with Apple Pay
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-gray-300 text-black hover:bg-gray-50 h-12 text-base font-medium"
                >
                  <div className="flex items-center mr-2">
                    <span className="text-blue-600 font-bold text-lg">G</span>
                    <span className="text-blue-600 font-medium ml-1">Pay</span>
                  </div>
                  Buy with G Pay
                </Button>
              </div>

              {/* Test Mode Warning */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-black text-sm leading-relaxed">
                  This is a test mode transaction. No funds will be debited from any card/account or paid to the merchant account. Only the pre-defined test cards can be used to obtain an authorisation response, any live card will decline.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 text-sm font-medium">
                    Your payment is secured with 256-bit encryption
                  </span>
                </div>
              </div>

              {/* Credit Card Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-foreground font-medium mb-2">
                    Card number
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Card number"
                      value={cardData.cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
                      maxLength={19}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-foreground font-medium mb-2">
                      Expiry month
                    </label>
                    <Select
                      value={cardData.expiryMonth}
                      onValueChange={(value) => handleInputChange("expiryMonth", value)}
                    >
                      <SelectTrigger className="bg-card border-border text-foreground">
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-foreground font-medium mb-2">
                      Expiry year
                    </label>
                    <Select
                      value={cardData.expiryYear}
                      onValueChange={(value) => handleInputChange("expiryYear", value)}
                    >
                      <SelectTrigger className="bg-card border-border text-foreground">
                        <SelectValue placeholder="YYYY" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-foreground font-medium mb-2">
                      Security code
                    </label>
                    <Input
                      placeholder="CVV"
                      value={cardData.cvv}
                      onChange={(e) => handleInputChange("cvv", e.target.value)}
                      className="bg-card border-border text-foreground placeholder:text-muted-foreground"
                      maxLength={4}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="saveCard"
                    checked={cardData.saveCard}
                    onCheckedChange={(checked) => handleInputChange("saveCard", checked)}
                    className="border-border"
                  />
                  <label htmlFor="saveCard" className="text-sm text-foreground">
                    Save card for future payments
                  </label>
                </div>
              </div>

              {/* Accepted Cards */}
              <div className="pt-4">
                <h3 className="text-foreground font-medium mb-3">WE ACCEPT</h3>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">VISA</span>
                  </div>
                  <div className="w-12 h-8 bg-red-600 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">MC</span>
                  </div>
                  <div className="w-12 h-8 bg-blue-800 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">AMEX</span>
                  </div>
                  <div className="w-12 h-8 bg-orange-600 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">DISC</span>
                  </div>
                  <div className="w-12 h-8 bg-green-600 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">UP</span>
                  </div>
                  <div className="w-12 h-8 bg-red-700 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">JCB</span>
                  </div>
                  <div className="w-12 h-8 bg-gray-700 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">DC</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  Order Summary
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">test</span>
                    <span className="text-foreground">$0.10</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Tax</span>
                    <span className="text-foreground">$0.01</span>
                  </div>
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-foreground font-semibold">
                        Total
                      </span>
                      <span className="text-foreground font-semibold">
                        $0.11
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* View Seller Details */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div
                  className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
                  onClick={() => setShowSellerDetails(!showSellerDetails)}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-yellow-500" />
                    <span className="text-foreground font-medium">
                      View Seller Details
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-yellow-500 transition-transform ${
                    showSellerDetails ? 'rotate-180' : ''
                  }`} />
                </div>

                {showSellerDetails && (
                  <div className="mt-4 pt-4 border-t border-border animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground text-sm">
                          Seller Name:
                        </span>
                        <span className="text-foreground font-medium">
                          Test Seller
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground text-sm">
                          Vendor Name:
                        </span>
                        <span className="text-foreground">
                          Test Vendor
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground text-sm">
                          Contact:
                        </span>
                        <span className="text-foreground">
                          test@example.com
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 