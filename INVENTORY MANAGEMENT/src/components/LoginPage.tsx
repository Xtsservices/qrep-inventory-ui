import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Package } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function LoginPage({ onLogin }) {
  const [mobileNumber, setMobileNumber] = useState('');
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = () => {
    if (mobileNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setShowOtpStep(true);
      toast.success('OTP sent successfully!');
    }, 1500);
  };

  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    // Simulate OTP verification
    setTimeout(() => {
      setIsLoading(false);
      if (otp === '123456') {
        toast.success('Login successful!');
        onLogin({
          mobile: mobileNumber,
          name: 'Admin User',
          role: 'Administrator'
        });
      } else {
        toast.error('Invalid OTP. Try 123456');
      }
    }, 1000);
  };

  const handleBack = () => {
    setShowOtpStep(false);
    setOtp('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">InventoryMS</CardTitle>
          <CardDescription>
            {!showOtpStep ? 'Enter your mobile number to login' : 'Verify OTP to continue'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showOtpStep ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
                />
              </div>
              <Button 
                onClick={handleSendOtp} 
                className="w-full"
                disabled={isLoading || mobileNumber.length !== 10}
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="mobile-display">Mobile Number</Label>
                <Input
                  id="mobile-display"
                  type="text"
                  value={mobileNumber}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP (6 digits)</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </div>
              <Button 
                onClick={handleVerifyOtp} 
                className="w-full"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? 'Verifying...' : 'Verify & Login'}
              </Button>
              <Button 
                variant="outline"
                onClick={handleBack} 
                className="w-full"
                disabled={isLoading}
              >
                Back to Mobile Number
              </Button>
            </>
          )}
          
          <div className="text-center text-sm text-muted-foreground">
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="font-medium">Demo Credentials:</p>
              <p>Mobile: Any 10-digit number</p>
              <p>OTP: 123456</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}