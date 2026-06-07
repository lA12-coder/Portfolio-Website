import React, { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { Database, FileText, LayoutDashboard, Loader2, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getLoginUrl } from '@/const';
import ContactSubmissionsTab from '@/components/admin/ContactSubmissionsTab';
import TestimonialsTab from '@/components/admin/TestimonialsTab';
import ChatLogsTab from '@/components/admin/ChatLogsTab';
import RagKnowledgeBaseTab from '@/components/admin/RagKnowledgeBaseTab';
import ContentManagementTab from '@/components/admin/ContentManagementTab';
import BlogManagementTab from '@/components/admin/BlogManagementTab';
import ThemeToggle from '@/components/ThemeToggle';

export default function AdminDashboard() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('submissions');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Sign In</h1>
            <p className="text-muted-foreground">
              Sign in with the Google account listed in OWNER_EMAIL to access the admin dashboard.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              onClick={() => {
                window.location.href = getLoginUrl();
              }}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <LogIn size={18} className="mr-2" />
              Sign in with Google
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="border-white/20"
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground">
              You do not have permission to access this page. Only administrators can view the admin dashboard.
            </p>
          </div>
          <Button
            onClick={() => navigate('/')}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-white/10 bg-white/5 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-accent/30 bg-accent/15 text-accent">
              <LayoutDashboard size={22} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Welcome, {user?.name || 'Administrator'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-white/20 hover:bg-white/5"
            >
              <LogOut size={18} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 border border-white/10 bg-white/5 p-1 md:grid-cols-6 mb-8">
            <TabsTrigger value="submissions">Contact Submissions</TabsTrigger>
            <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
            <TabsTrigger value="chatlogs">Chat Logs</TabsTrigger>
            <TabsTrigger value="ragbase">RAG Knowledge Base</TabsTrigger>
            <TabsTrigger value="content">
              <Database size={15} className="mr-1" />
              Content
            </TabsTrigger>
            <TabsTrigger value="blog">
              <FileText size={15} className="mr-1" />
              Blog
            </TabsTrigger>
          </TabsList>

          <TabsContent value="submissions" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Contact Form Submissions</h2>
              <p className="text-muted-foreground">
                View and manage all contact form submissions from visitors.
              </p>
            </div>
            <ContactSubmissionsTab />
          </TabsContent>

          <TabsContent value="testimonials" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Testimonials & Feedback</h2>
              <p className="text-muted-foreground">
                Review and approve pending testimonials before they appear on the portfolio.
              </p>
            </div>
            <TestimonialsTab />
          </TabsContent>

          <TabsContent value="chatlogs" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Chat Logs</h2>
              <p className="text-muted-foreground">
                View all RAG chat assistant interactions and visitor questions.
              </p>
            </div>
            <ChatLogsTab />
          </TabsContent>

          <TabsContent value="ragbase" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">RAG Knowledge Base</h2>
              <p className="text-muted-foreground">
                Upload and manage resume content chunks for the RAG system.
              </p>
            </div>
            <RagKnowledgeBaseTab />
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Portfolio Content</h2>
              <p className="text-muted-foreground">
                Create, update, and remove projects, testimonials, and skills shown across the portfolio.
              </p>
            </div>
            <ContentManagementTab />
          </TabsContent>

          <TabsContent value="blog" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Technical Blog</h2>
              <p className="text-muted-foreground">
                Write MDX-style posts, manage drafts, and publish articles shown on the portfolio.
              </p>
            </div>
            <BlogManagementTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
