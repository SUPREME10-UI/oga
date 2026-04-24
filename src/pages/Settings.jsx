import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { 
    Tabs, 
    TabsContent, 
    TabsList, 
    TabsTrigger 
} from "@/components/ui/tabs";
import { 
    User, 
    ShieldCheck, 
    Bell, 
    Camera, 
    Save, 
    RotateCcw,
    CheckCircle2,
    AlertCircle,
    UserCircle2,
    ShieldAlert,
    Lock,
    Phone,
    MapPin,
    Hash,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";

function Settings() {
    const { user, updateUser } = useAuth();
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        location: '',
        bio: '',
        type: 'hirer',
        settings: {
            twoFactorEnabled: false,
            notifications: {
                email: true,
                jobAlerts: true
            }
        }
    });

    const [avatarPreview, setAvatarPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [passwordState, setPasswordState] = useState({ current: '', newPass: '', confirm: '' });
    const fileRef = useRef(null);

    // Initialize form from user
    useEffect(() => {
        if (!user) return;
        setForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            location: user.location || '',
            bio: user.bio || '',
            type: user.type || 'hirer',
            settings: {
                twoFactorEnabled: user.settings?.twoFactorEnabled || false,
                notifications: {
                    email: user.settings?.notifications?.email ?? true,
                    jobAlerts: user.settings?.notifications?.jobAlerts ?? true
                }
            }
        });
        setAvatarPreview(user.photo || null);
    }, [user]);

    const handleAvatarClick = () => {
        if (fileRef.current) fileRef.current.click();
    };

    const handleAvatarChange = async (e) => {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = () => setAvatarPreview(reader.result);
        reader.readAsDataURL(f);
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        if (!form.name.trim()) {
            setMessage({ type: 'error', text: 'Name is required.' });
            setSaving(false);
            return;
        }

        const updates = {
            ...form,
            photo: avatarPreview || '',
        };

        try {
            await updateUser(updates);
            setMessage({ type: 'success', text: 'Profile settings saved successfully.' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to save settings.' });
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        setMessage(null);
        if (!passwordState.newPass || passwordState.newPass.length < 6) {
            setMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
            return;
        }
        if (passwordState.newPass !== passwordState.confirm) {
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }

        try {
            await updateUser({ password: passwordState.newPass });
            setMessage({ type: 'success', text: 'Password updated successfully.' });
            setPasswordState({ current: '', newPass: '', confirm: '' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update password.' });
        }
    };

    const handleReset = () => {
        if (!user) return;
        setForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            location: user.location || '',
            bio: user.bio || '',
            type: user.type || 'hirer',
            settings: {
                twoFactorEnabled: user.settings?.twoFactorEnabled || false,
                notifications: {
                    email: user.settings?.notifications?.email ?? true,
                    jobAlerts: user.settings?.notifications?.jobAlerts ?? true
                }
            }
        });
        setAvatarPreview(user.photo || null);
        setMessage({ type: 'info', text: 'Changes reverted to last saved state.' });
    };

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold font-serif">Account Harmony</h2>
                    <p className="text-muted-foreground text-sm">Fine-tune your professional presence and app behavior</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleReset} className="rounded-full h-10 px-6">
                        <RotateCcw className="w-4 h-4 mr-2" /> Reset
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={saving} className="rounded-full shadow-lg h-10 px-8">
                        {saving ? (
                            <span className="flex items-center"><RotateCcw className="w-4 h-4 mr-2 animate-spin" /> Saving...</span>
                        ) : (
                            <span className="flex items-center"><Save className="w-4 h-4 mr-2" /> Save Changes</span>
                        )}
                    </Button>
                </div>
            </div>

            {message && (
                <div className={cn(
                    "p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 border shadow-sm",
                    message.type === 'success' ? "bg-green-50 text-green-700 border-green-100" : 
                    message.type === 'error' ? "bg-red-50 text-red-700 border-red-100" :
                    "bg-blue-50 text-blue-700 border-blue-100"
                )}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="text-sm font-medium">{message.text}</span>
                </div>
            )}

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="bg-slate-100/50 p-1 rounded-2xl mb-8 border border-slate-200/50 inline-flex">
                    <TabsTrigger value="profile" className="rounded-xl px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary gap-2">
                        <User className="w-4 h-4" /> Profile
                    </TabsTrigger>
                    <TabsTrigger value="security" className="rounded-xl px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary gap-2">
                        <ShieldCheck className="w-4 h-4" /> Security
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="rounded-xl px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary gap-2">
                        <Bell className="w-4 h-4" /> Alerts
                    </TabsTrigger>
                    {user?.type !== 'admin' && (
                        <TabsTrigger value="developer" className="rounded-xl px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary gap-2 text-destructive data-[state=active]:text-destructive">
                            <ShieldAlert className="w-4 h-4" /> Developer
                        </TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                    <Card className="border-none shadow-sm bg-white overflow-hidden p-8">
                        <div className="flex flex-col md:flex-row gap-12">
                            <div className="flex flex-col items-center gap-4 text-center">
                                <div 
                                    className="relative w-32 h-32 rounded-full border-4 border-slate-50 bg-slate-100 shadow-xl cursor-pointer group overflow-hidden transition-all hover:scale-105"
                                    onClick={handleAvatarClick}
                                >
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-primary/20">
                                            <UserCircle2 className="w-16 h-16" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">Avatar Photo</h4>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">PNG or JPG, max 5MB</p>
                                </div>
                                <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                            </div>

                            <div className="flex-1 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-slate-500">Full Public Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                                            <Input 
                                                id="name" 
                                                className="pl-10 h-12 bg-slate-50 border-slate-100 focus:bg-white transition-all rounded-xl"
                                                value={form.name} 
                                                onChange={(e) => setForm({...form, name: e.target.value})} 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-500">Contact Email</Label>
                                        <div className="relative">
                                            <Bell className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                                            <Input 
                                                id="email" 
                                                type="email" 
                                                className="pl-10 h-12 bg-slate-50 border-slate-100 focus:bg-white transition-all rounded-xl"
                                                value={form.email} 
                                                onChange={(e) => setForm({...form, email: e.target.value})} 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-slate-500">Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                                            <Input 
                                                id="phone" 
                                                className="pl-10 h-12 bg-slate-50 border-slate-100 focus:bg-white transition-all rounded-xl"
                                                value={form.phone} 
                                                onChange={(e) => setForm({...form, phone: e.target.value})} 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="location" className="text-xs font-bold uppercase tracking-widest text-slate-500">Preferred Location</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                                            <Input 
                                                id="location" 
                                                className="pl-10 h-12 bg-slate-50 border-slate-100 focus:bg-white transition-all rounded-xl"
                                                value={form.location} 
                                                onChange={(e) => setForm({...form, location: e.target.value})} 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Professional Bio</Label>
                                    <Textarea 
                                        rows={4} 
                                        className="bg-slate-50 border-slate-100 focus:bg-white transition-all rounded-2xl resize-none"
                                        placeholder="Tell potential clients about your expertise..."
                                        value={form.bio}
                                        onChange={(e) => setForm({...form, bio: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">I am joining as a:</Label>
                                    <Select 
                                        value={form.type} 
                                        onValueChange={(v) => setForm({...form, type: v})}
                                    >
                                        <SelectTrigger className="h-12 bg-slate-50 border-slate-100 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-slate-100">
                                            <SelectItem value="hirer">Home Owner / Business (Hirer)</SelectItem>
                                            <SelectItem value="labourer">Skilled Artisan (Labourer)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                    <Card className="border-none shadow-sm bg-white p-8 space-y-8">
                        <div>
                            <h3 className="text-lg font-bold font-serif mb-1">Update Security Credentials</h3>
                            <p className="text-muted-foreground text-sm">Keep your account safe with a strong, updated password</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Current Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                                    <Input 
                                        type="password" 
                                        className="pl-10 h-12 bg-slate-50 border-slate-100 rounded-xl" 
                                        value={passwordState.current}
                                        onChange={(e) => setPasswordState({...passwordState, current: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="hidden md:block"></div>
                            
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">New Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                                    <Input 
                                        type="password" 
                                        className="pl-10 h-12 bg-slate-50 border-slate-100 rounded-xl" 
                                        value={passwordState.newPass}
                                        onChange={(e) => setPasswordState({...passwordState, newPass: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Confirm Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                                    <Input 
                                        type="password" 
                                        className="pl-10 h-12 bg-slate-50 border-slate-100 rounded-xl" 
                                        value={passwordState.confirm}
                                        onChange={(e) => setPasswordState({...passwordState, confirm: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" className="rounded-full px-8" onClick={handleChangePassword}>
                            Update Gateway Secret
                        </Button>

                        <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                            <div>
                                <h4 className="font-bold flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-primary" /> Two-Factor Shield
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1">Add an extra layer of security to your account logins</p>
                            </div>
                            <Switch 
                                checked={form.settings?.twoFactorEnabled || false} 
                                onCheckedChange={(c) => setForm({
                                    ...form, 
                                    settings: { ...(form.settings || {}), twoFactorEnabled: c }
                                })} 
                            />
                        </div>
                    </Card>
                </TabsContent>

                {user?.type !== 'admin' && (
                    <TabsContent value="developer" className="space-y-6">
                        <Card className="border-none shadow-sm bg-white p-8">
                            <div>
                                <h3 className="text-lg font-bold font-serif mb-1 text-destructive">Developer Settings</h3>
                                <p className="text-muted-foreground text-sm">Testing features and advanced options</p>
                            </div>
                            <div className="mt-8 flex items-center justify-between p-4 rounded-2xl bg-red-50 border border-red-100">
                                <div>
                                    <h4 className="font-bold flex items-center gap-2 text-destructive">
                                        <ShieldAlert className="w-5 h-5" /> Developer Access
                                    </h4>
                                    <p className="text-xs text-red-700/80 mt-1">Temporarily promote this account to Administrator</p>
                                </div>
                                <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={async () => {
                                        if(window.confirm('Promote this account to Admin?')) {
                                            await updateUser({ type: 'admin' });
                                            window.location.href = '/dashboard/admin';
                                        }
                                    }}
                                >
                                    Promote to Admin
                                </Button>
                            </div>
                        </Card>
                    </TabsContent>
                )}

                <TabsContent value="notifications" className="space-y-6">
                    <Card className="border-none shadow-sm bg-white p-8">
                        <div>
                            <h3 className="text-lg font-bold font-serif mb-1">Alert Preferences</h3>
                            <p className="text-muted-foreground text-sm">Control how and when we reach out to you</p>
                        </div>
                        <div className="mt-8 space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm">Email Digest</h4>
                                        <p className="text-xs text-muted-foreground">Receive weekly summaries of your activity</p>
                                    </div>
                                </div>
                                <Switch 
                                    checked={form.settings?.notifications?.email ?? true} 
                                    onCheckedChange={(c) => setForm({
                                        ...form, 
                                        settings: { 
                                            ...form.settings, 
                                            notifications: { ...(form.settings?.notifications || {}), email: c }
                                        }
                                    })} 
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                                        <Search className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm">Real-time Job Alerts</h4>
                                        <p className="text-xs text-muted-foreground">Instant notifications for new gig matches</p>
                                    </div>
                                </div>
                                <Switch 
                                    checked={form.settings?.notifications?.jobAlerts ?? true} 
                                    onCheckedChange={(c) => setForm({
                                        ...form, 
                                        settings: { 
                                            ...form.settings, 
                                            notifications: { ...(form.settings?.notifications || {}), jobAlerts: c }
                                        }
                                    })} 
                                />
                            </div>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default Settings;