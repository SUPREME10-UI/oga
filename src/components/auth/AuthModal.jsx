import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Hammer, CheckCircle, Upload, AlertCircle } from "lucide-react";

function AuthModal({ isOpen, onClose, initialTab = "login" }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [accountType, setAccountType] = useState("hirer");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phoneNumber: "",
    location: "",
    profession: "",
    experience: "",
    bio: "",
    confirmPassword: "",
    photo: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [authError, setAuthError] = useState("");

  const { login, signup, resetPassword, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setAuthError("Please fill in both email and password fields.");
      return;
    }
    setIsLoading(true);
    setAuthError("");
    try {
      const userData = await login(formData.email, formData.password);
      onClose();
      navigate(userData && userData.type ? `/dashboard/${userData.type}` : "/dashboard");
    } catch (error) {
      console.error("Error during login:", error);
      let errorMessage = "Failed to sign in. ";
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        errorMessage = "Invalid email or password. Please try again.";
      } else {
        errorMessage += error.message;
      }
      setAuthError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setAuthError("Passwords do not match");
      return;
    }
    if (accountType === "labourer") {
      if (!formData.profession || !formData.experience || !formData.bio) {
        setAuthError("Please fill in all labourer details.");
        return;
      }
    }
    if (!formData.photo) {
      setAuthError("Please upload a profile photo.");
      return;
    }
    const profileData = {
      name: formData.fullName,
      phoneNumber: formData.phoneNumber,
      location: formData.location,
      profession: formData.profession,
      experience: formData.experience,
      bio: formData.bio,
      photo: formData.photo,
      type: accountType,
      rating: "New",
      reviewCount: 0,
    };
    setIsLoading(true);
    setAuthError("");
    try {
      const userData = await signup(formData.email, formData.password, profileData);
      setNewUserName(formData.fullName);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        navigate(`/dashboard/${userData.type}`);
      }, 3000);
    } catch (error) {
      console.error("Error during signup:", error);
      let errorMessage = "Failed to create account. ";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "An account with this email already exists.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters.";
      } else {
        errorMessage += error.message;
      }
      setAuthError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setIsLoading(true);
    setAuthError("");
    try {
      const profileData = { type: accountType, rating: "New", reviewCount: 0 };
      let userData;
      if (provider === "google") {
        userData = await signInWithGoogle(profileData);
      }
      if (userData) {
        if (userData.isNewUser || !userData.name) {
          setNewUserName(userData.name || "User");
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            onClose();
            navigate(`/dashboard/${userData.type || accountType}`);
          }, 3000);
        } else {
          onClose();
          navigate(`/dashboard/${userData.type || accountType}`);
        }
      }
    } catch (error) {
      console.error(`${provider} login error:`, error);
      let errorMessage = `Failed to sign in with ${provider}. `;
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-in popup was closed before completing. Please try again.";
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = "Sign-in request was cancelled. Only one popup can be open at a time.";
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "Sign-in popup was blocked by your browser. Please allow popups for this site.";
      } else {
        errorMessage += error.message;
      }
      setAuthError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setAuthError("Please enter your email address.");
      return;
    }
    setIsLoading(true);
    try {
      await resetPassword(formData.email);
      setActiveTab("email-sent");
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-white border-0 shadow-2xl">
        <div className="grid md:grid-cols-5 h-full max-h-[90vh]">
          {/* Left Branding - visible only on md+ */}
          <div className="hidden md:flex flex-col col-span-2 craft-gradient p-8 text-white">
            <div className="flex items-center gap-2 mb-8">
              <Hammer className="w-6 h-6" />
              <span className="font-serif font-bold text-xl">OgaHub</span>
            </div>
            <h2 className="text-3xl font-serif font-bold mb-4">Connect. Work. Grow.</h2>
            <p className="text-white/80 mb-10 leading-relaxed text-sm">
              Join thousands of skilled labourers and hirers building the future together.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-5 h-5 text-white/90" />
                <span>Verified Professionals</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-5 h-5 text-white/90" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-5 h-5 text-white/90" />
                <span>Fast & Reliable Matching</span>
              </div>
            </div>
          </div>

          {/* Right Forms */}
          <div className="col-span-3 overflow-y-auto w-full p-6 sm:p-10 scrollbar-hide">
            {showSuccess ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-10">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <DialogTitle className="text-2xl font-serif font-bold">
                  Welcome, {newUserName.split(" ")[0]}!
                </DialogTitle>
                <DialogDescription>
                  Your account as a <span className="font-semibold capitalize">{accountType}</span> has been created successfully.
                  Redirecting to your dashboard...
                </DialogDescription>
              </div>
            ) : activeTab === "email-sent" ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-10">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-primary" />
                </div>
                <DialogTitle className="text-2xl font-serif font-bold">Check Your Email</DialogTitle>
                <DialogDescription className="max-w-xs">
                  We've sent a password reset link to <br />
                  <span className="font-semibold text-foreground">{formData.email}</span>
                </DialogDescription>
                <Button variant="outline" className="mt-4" onClick={() => setActiveTab("login")}>
                  Back to Login
                </Button>
              </div>
            ) : activeTab === "forgot-password" ? (
              <div className="py-6">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-serif font-bold">Reset Password</DialogTitle>
                  <DialogDescription>
                    Enter your email and we'll send you a link to reset your password.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  {authError && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                  <div className="text-center mt-4">
                    <Button variant="link" onClick={() => setActiveTab("login")}>
                      Back to Login
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                {authError && (
                  <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <TabsContent value="login">
                  <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl font-serif font-bold">Welcome Back</DialogTitle>
                    <DialogDescription>Sign in to continue to your account.</DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto text-xs"
                        onClick={() => setActiveTab("forgot-password")}
                      >
                        Forgot password?
                      </Button>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Signing In..." : "Sign In"}
                    </Button>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleSocialLogin("google")}
                      disabled={isLoading}
                    >
                      <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4 mr-2" />
                      Google
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl font-serif font-bold">Create Account</DialogTitle>
                    <DialogDescription>Join Oga and start connecting today.</DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-3 mb-6">
                      <Label>I am a</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div
                          className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center text-center transition-colors ${
                            accountType === "hirer"
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => setAccountType("hirer")}
                        >
                          <div className="font-semibold">Hirer</div>
                          <div className="text-xs mt-1 text-muted-foreground">I want to hire skilled workers</div>
                        </div>
                        <div
                          className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center text-center transition-colors ${
                            accountType === "labourer"
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => setAccountType("labourer")}
                        >
                          <div className="font-semibold">Labourer</div>
                          <div className="text-xs mt-1 text-muted-foreground">I am a skilled labourer</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="photo">Profile Photo *</Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                        <input
                          type="file"
                          id="photo"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          required={activeTab === "signup"}
                        />
                        <Label htmlFor="photo" className="cursor-pointer flex flex-col items-center gap-2">
                          {formData.photo ? (
                            <img src={formData.photo} alt="Preview" className="w-16 h-16 rounded-full object-cover" />
                          ) : (
                            <>
                              <Upload className="w-6 h-6 text-muted-foreground" />
                              <span className="text-sm text-foreground">Click to upload photo</span>
                            </>
                          )}
                        </Label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input id="fullName" value={formData.fullName} onChange={handleInputChange} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone *</Label>
                        <Input id="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleInputChange} required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" value={formData.email} onChange={handleInputChange} required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input id="location" value={formData.location} onChange={handleInputChange} placeholder="City, Region" required />
                    </div>

                    {accountType === "labourer" && (
                      <div className="space-y-4 pt-2 border-t border-border mt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="profession">Profession *</Label>
                            <select
                              id="profession"
                              value={formData.profession}
                              onChange={handleInputChange}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                              required
                            >
                              <option value="">Select profession</option>
                              <option value="Carpenter">Carpenter</option>
                              <option value="Electrician">Electrician</option>
                              <option value="Plumber">Plumber</option>
                              <option value="Painter">Painter</option>
                              <option value="Mason">Mason</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="experience">Experience *</Label>
                            <select
                              id="experience"
                              value={formData.experience}
                              onChange={handleInputChange}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                              required
                            >
                              <option value="">Select experience</option>
                              <option value="0-1">Less than 1 year</option>
                              <option value="1-3">1 - 3 years</option>
                              <option value="3-5">3 - 5 years</option>
                              <option value="5+">5+ years</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio *</Label>
                          <Textarea id="bio" value={formData.bio} onChange={handleInputChange} placeholder="Briefly describe your skills..." required />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input id="password" type="password" value={formData.password} onChange={handleInputChange} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} required />
                      </div>
                    </div>

                    <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-muted-foreground">Or sign up with</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleSocialLogin("google")}
                      disabled={isLoading}
                    >
                      <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4 mr-2" />
                      Google
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AuthModal;
