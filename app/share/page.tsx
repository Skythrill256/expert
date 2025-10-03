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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Share with Doctor
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Create secure, revocable links to share your health data with medical professionals
          </p>
        </div>

        {/* Create New Link */}
        <div className="glass-card rounded-xl md:rounded-2xl p-4 md:p-6 mb-6 md:mb-8 animate-fade-in">
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Create New Share Link</h2>
          <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
            Generate a secure link that shows your last 30 days of data without revealing your identity.
          </p>
          
          <div className="flex flex-col gap-4">
            <div>
              <Label className="mb-2 block text-sm md:text-base">Expires in (days)</Label>
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
            <Button 
              onClick={createShareLink} 
              disabled={creating}
              size="lg"
              className="w-full"
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

        {/* Existing Links */}
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold">Your Share Links</h2>
          
          {links.length === 0 ? (
            <div className="glass-card rounded-xl md:rounded-2xl p-8 md:p-12 text-center">
              <Link2 className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-semibold mb-2">No share links yet</h3>
              <p className="text-sm md:text-base text-muted-foreground">
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
                    "glass-card rounded-xl md:rounded-2xl p-4 md:p-6 transition-all",
                    !isActive && "opacity-60"
                  )}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
                          {link.revoked ? "Revoked" : isExpired ? "Expired" : "Active"}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground">
                          <Eye className="w-3 h-3 md:w-4 md:h-4" />
                          <span>{link.accessCount} views</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <Input
                          value={shareUrl}
                          readOnly
                          className="glass font-mono text-xs md:text-sm flex-1 min-w-0"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(shareUrl, link.token)}
                          className="shrink-0 w-full sm:w-auto"
                        >
                          {copiedToken === link.token ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Link
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs md:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 md:w-4 md:h-4" />
                          <span>Created {new Date(link.createdAt).toLocaleDateString()}</span>
                        </div>
                        {link.expiresAt && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 md:w-4 md:h-4" />
                            <span>Expires {new Date(link.expiresAt).toLocaleDateString()}</span>
                          </div>
                        )}
                        {link.lastAccessedAt && (
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3 md:w-4 md:h-4" />
                            <span>Last accessed {new Date(link.lastAccessedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {isActive && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => revokeLink(link.id)}
                        className="w-full sm:w-auto"
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
        <div className="mt-6 md:mt-8 glass-card rounded-xl md:rounded-2xl p-4 md:p-6 border-l-4 border-primary">
          <h3 className="text-sm md:text-base font-semibold mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" /> 
            Privacy & Security
          </h3>
          <ul className="text-xs md:text-sm text-muted-foreground space-y-2">
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
