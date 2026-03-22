/**
 * GHOST ADMIN - OWNER-ONLY SECRET ACCESS PANEL
 * Hidden backdoor for intellectual property protection
 * Copyright 2025 - Simpleton Platform
 */

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Eye, FileText, Lock, AlertTriangle, Server } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AdminData {
  security_status: any;
  recent_access: any[];
  suspicious_activity: any[];
  ip_protection: any;
  system_health: any;
}

interface FileData {
  protected_files: any;
  total_protected: number;
  protection_status: string;
}

interface AccessData {
  total_access_attempts: number;
  suspicious_attempts: number;
  top_accessing_ips: any[];
  recent_activity: any[];
  security_alerts: string;
}

export default function GhostAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [secretKey, setSecretKey] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [accessData, setAccessData] = useState<AccessData | null>(null);
  const [ipData, setIpData] = useState<any>(null);
  const { toast } = useToast();

  const handleGhostLogin = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('POST', '/api/admin/ghost-login', {
        secretKey
      });

      setSessionToken(response.sessionToken);
      setIsAuthenticated(true);
      setSecretKey(''); // Clear the secret key from memory
      
      toast({
        title: "👻 Ghost Access Granted",
        description: "Welcome to your secret admin panel",
      });

      // Load all admin data
      await loadAdminData(response.sessionToken);
    } catch (error: any) {
      toast({
        title: "🚫 Access Denied",
        description: "Invalid secret key",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const loadAdminData = async (token: string) => {
    try {
      const headers = { 'X-Admin-Session': token };
      
      const [dashboardRes, filesRes, accessRes, ipRes] = await Promise.all([
        apiRequest('GET', '/api/admin/dashboard', undefined, { headers }),
        apiRequest('GET', '/api/admin/files', undefined, { headers }),
        apiRequest('GET', '/api/admin/access-monitor', undefined, { headers }),
        apiRequest('GET', '/api/admin/ip-protection', undefined, { headers })
      ]);

      setAdminData(dashboardRes.data);
      setFileData(filesRes.data);
      setAccessData(accessRes.data);
      setIpData(ipRes.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-900 border-red-900">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle className="text-red-400">👻 GHOST ACCESS</CardTitle>
            <CardDescription className="text-gray-400">
              Owner-Only Secret Administration Panel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Secret Key</label>
              <Input
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter owner secret key..."
                className="bg-gray-800 border-gray-700 text-white"
                onKeyPress={(e) => e.key === 'Enter' && handleGhostLogin()}
              />
            </div>
            <Button 
              onClick={handleGhostLogin}
              disabled={loading || !secretKey}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Authenticating...' : '🔐 Ghost Login'}
            </Button>
            <div className="text-center text-xs text-gray-500">
              This is a hidden admin panel for IP protection
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-red-400 flex items-center gap-2">
              👻 GHOST ADMIN
              <Badge variant="destructive">OWNER ONLY</Badge>
            </h1>
            <p className="text-gray-400 mt-2">Secret Administration Panel - IP Protection Active</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-400 border-green-400">
              <Shield className="h-3 w-3 mr-1" />
              SECURED
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-gray-900 border-gray-700">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-red-600">
              <Server className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="access" className="data-[state=active]:bg-red-600">
              <Eye className="h-4 w-4 mr-2" />
              Access Monitor
            </TabsTrigger>
            <TabsTrigger value="files" className="data-[state=active]:bg-red-600">
              <FileText className="h-4 w-4 mr-2" />
              File Protection
            </TabsTrigger>
            <TabsTrigger value="ip" className="data-[state=active]:bg-red-600">
              <Lock className="h-4 w-4 mr-2" />
              IP Protection
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {adminData && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-400">Total Access</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {adminData.security_status?.total_access_attempts || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-400">Suspicious Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-400">
                      {adminData.security_status?.suspicious_activity || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-400">Security Level</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={adminData.security_status?.security_level === 'SECURE' ? 'default' : 'destructive'}>
                      {adminData.security_status?.security_level || 'UNKNOWN'}
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-400">Protected Files</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-400">
                      {adminData.ip_protection?.backup_files_protected || '390+'}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {adminData?.system_health && (
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-400">Pricing API</div>
                      <Badge variant="default" className="bg-green-600">
                        {adminData.system_health.revolutionary_api_status}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Marketing Aggregator</div>
                      <Badge variant="default" className="bg-green-600">
                        {adminData.system_health.marketing_aggregator_status}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Infrastructure</div>
                      <Badge variant="default" className="bg-green-600">
                        {adminData.system_health.bulletproof_infrastructure}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Deep Web Penetration</div>
                      <Badge variant="default" className="bg-blue-600">
                        {adminData.system_health.deep_web_penetration}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="access" className="space-y-6">
            {accessData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Access Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Attempts:</span>
                        <span className="text-white">{accessData.total_access_attempts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Suspicious:</span>
                        <span className="text-red-400">{accessData.suspicious_attempts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Security Level:</span>
                        <Badge variant={accessData.security_alerts === 'NORMAL' ? 'default' : 'destructive'}>
                          {accessData.security_alerts}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Top Accessing IPs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {accessData.top_accessing_ips?.slice(0, 5).map(([ip, count], index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-gray-300 font-mono">{ip}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="files" className="space-y-6">
            {fileData && (
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Protected File Structure
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Total Protected: {fileData.total_protected} files | Status: {fileData.protection_status}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(fileData.protected_files || {}).map(([category, files]) => (
                      <div key={category} className="border border-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-white mb-2 capitalize">
                          {category.replace(/_/g, ' ')}
                        </h4>
                        <div className="text-sm text-gray-300">
                          {Array.isArray(files) ? files.length : 0} files protected
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ip" className="space-y-6">
            {ipData && (
              <div className="space-y-6">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Revolutionary Concepts Protection
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {ipData.patent_claims}+ Patent Claims | {ipData.competitive_advantage} Advantage
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-white mb-3">Protected Innovations</h4>
                        <div className="space-y-2">
                          {ipData.revolutionary_concepts?.map((concept: string, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                              <Lock className="h-3 w-3 text-green-400" />
                              <span className="text-sm text-gray-300">{concept}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-3">Protection Status</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Copyright:</span>
                            <Badge variant="default" className="bg-green-600">
                              {ipData.copyright_protection}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Trademark:</span>
                            <Badge variant="default" className="bg-blue-600">
                              {ipData.trademark_protection}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Trade Secrets:</span>
                            <Badge variant="default" className="bg-purple-600">
                              {ipData.trade_secrets}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Backups:</span>
                            <Badge variant="default" className="bg-green-600">
                              {ipData.backup_protection}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <div className="text-xs text-gray-500">
            🔒 Ghost Admin Panel - Maximum Security IP Protection Active
          </div>
        </div>
      </div>
    </div>
  );
}