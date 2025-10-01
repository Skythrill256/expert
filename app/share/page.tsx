"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import PageLayout from "@/components/PageLayout";
import { Share2, Link2, X, Copy, Check, Clock, Eye, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ShareLink = {
  id: string;
  token: string;
  expiresAt: Date | null;
  revoked: boolean;
  accessCount: number;
  createdAt: Date;
  lastAccessedAt: Date | null;
};

export default function SharePage() {
  const [mounted, setMounted] = useState(false);
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState("");
  const [copiedToken, setCopiedToken] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchLinks();
    }
  }, [mounted]);

  const fetchLinks = async () => {
    try {
      const response = await fetch("/api/share");
      if (response.ok) {
        const data = await response.json();
        setLinks(data.links);
      }
    } catch (error) {
      console.error("Error fetching share links:", error);
    } finally {
      setLoading(false);
    }
  };

  const createShareLink = async () => {
    setCreating(true);
    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          expiresInDays: expiresInDays ? parseInt(expiresInDays) : null 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Share link created successfully!");
        copyToClipboard(data.shareUrl, data.token);
        setExpiresInDays("");
        fetchLinks();
      } else {
        toast.error("Failed to create share link");
      }
    } catch (error) {
      console.error("Error creating share link:", error);
      toast.error("Failed to create share link");
    } finally {
      setCreating(false);
    }
  };

  const revokeLink = async (linkId: string) => {
    try {
      const response = await fetch("/api/share", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId }),
      });

      if (response.ok) {
        toast.success("Link revoked successfully");
        fetchLinks();
      } else {
        toast.error("Failed to revoke link");
      }
    } catch (error) {
      console.error("Error revoking link:", error);
      toast.error("Failed to revoke link");
    }
  };

  const copyToClipboard = async (url: string, token: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedToken(token);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopiedToken(""), 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast.error("Failed to copy link");
    }
  };

  const getShareUrl = (token: string) => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/shared/${token}`;
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen gradient-mesh">
        <Sidebar />
        <PageLayout>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading...</p>
            </div>
          </div>
        </PageLayout>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-mesh">
      <Sidebar />
      
      <PageLayout>
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Share2 className="w-8 h-8" />
            Share with Doctor
          </h1>
          <p className="text-muted-foreground">
            Create secure, revocable links to share your health data with medical professionals
          </p>
        </div>

        {/* Create New Link */}
        <div className="glass-card rounded-2xl p-6 mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold mb-4">Create New Share Link</h2>
          <p className="text-muted-foreground mb-6">
            Generate a secure link that shows your last 30 days of data without revealing your identity.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label className="mb-2 block">Expires in (days)</Label>
              <Input
                type="number"
                placeholder="Leave empty for no expiration"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value)}
                className="glass"
                min="1"
                max="365"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={createShareLink} 
                disabled={creating}
                size="lg"
                className="w-full sm:w-auto"
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 mr-2" />
                    Generate Link
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Existing Links */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Your Share Links</h2>
          
          {links.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <Share2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No share links yet</h3>
              <p className="text-muted-foreground">
                Create your first link to share your data with a doctor
              </p>
            </div>
          ) : (
            links.map((link) => {
              const shareUrl = getShareUrl(link.token);
              const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();
              const isActive = !link.revoked && !isExpired;

              return (
                <div
                  key={link.id}
                  className={cn(
                    "glass-card rounded-2xl p-6 transition-all",
                    !isActive && "opacity-60"
                  )}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant={isActive ? "default" : "secondary"}>
                          {link.revoked ? "Revoked" : isExpired ? "Expired" : "Active"}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Eye className="w-4 h-4" />
                          <span>{link.accessCount} views</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Input
                          value={shareUrl}
                          readOnly
                          className="glass font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(shareUrl, link.token)}
                          className="shrink-0"
                        >
                          {copiedToken === link.token ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Created {new Date(link.createdAt).toLocaleDateString()}
                        </div>
                        {link.expiresAt && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Expires {new Date(link.expiresAt).toLocaleDateString()}
                          </div>
                        )}
                        {link.lastAccessedAt && (
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            Last accessed {new Date(link.lastAccessedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    {isActive && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => revokeLink(link.id)}
                        className="lg:shrink-0"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Revoke
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 glass-card rounded-2xl p-6 border-l-4 border-primary">
          <h3 className="font-semibold mb-2 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Privacy & Security</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Shared links do not reveal your name or personal information</li>
            <li>• Only shows last 30 days of reports and lifestyle data</li>
            <li>• You can revoke access at any time</li>
            <li>• Set expiration dates for automatic link expiry</li>
            <li>• Track how many times your link has been accessed</li>
          </ul>
        </div>
      </PageLayout>
    </div>
  );
}
