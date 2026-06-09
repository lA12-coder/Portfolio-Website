import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { GlobalApiLoader, SplashScreen } from "./components/AppLoaders";
import ErrorBoundary from "./components/ErrorBoundary";
import FloatingChatWidget from "./components/FloatingChatWidget";
import { ThemeProvider } from "./contexts/ThemeContext";

const Home = lazy(() => import("./pages/Home"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const BlogListPage = lazy(() => import("@/pages/BlogListPage"));
const BlogPostPage = lazy(() => import("@/pages/BlogPostPage"));

function RouteLoader() {
  return (
    <div className="min-h-screen px-6 py-20 md:px-12">
      <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
      <div className="mt-8 h-80 max-w-4xl animate-pulse rounded-lg border border-white/10 bg-white/5" />
    </div>
  );
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"}>{() => <Home page="home" />}</Route>
      <Route path={"/about"}>{() => <Home page="about" />}</Route>
      <Route path={"/experience"}>{() => <Home page="experience" />}</Route>
      <Route path={"/contact"}>{() => <Home page="contact" />}</Route>
      <Route path={"/blog"} component={BlogListPage} />
      <Route path={"/blog/:slug"} component={BlogPostPage} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        switchable
      >
        <TooltipProvider>
          <SplashScreen />
          <GlobalApiLoader />
          <Toaster />
          <Suspense fallback={<RouteLoader />}>
            <Router />
          </Suspense>
          <FloatingChatWidget />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
