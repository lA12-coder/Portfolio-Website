# Lidet Admassu Portfolio - Comprehensive Development Strategy

## Overview

This document provides detailed implementation strategies, technical approaches, and specific prompts for each feature of the portfolio website. Each feature is broken down into phases with clear objectives, technical requirements, and testing strategies.

---

## PHASE 1: CORE LAYOUT & DESIGN FOUNDATION

### Feature 1.1: Two-Column Sticky Layout with Responsive Design

**Objective:** Establish the foundational layout structure that serves as the container for all other features.

**Technical Requirements:**
- Desktop: Fixed left column (50% width) + scrollable right column (50% width)
- Tablet: Responsive adjustment with left column becoming sticky at top
- Mobile: Single column layout with collapsible navigation
- CSS Grid or Flexbox for layout management
- Smooth scroll behavior across sections

**Implementation Strategy:**

1. **Layout Structure**
   - Use CSS Grid with `grid-template-columns: 1fr 1fr` on desktop
   - Left column: `position: sticky; top: 0; height: 100vh; overflow-y: auto;`
   - Right column: `overflow-y: auto; height: 100vh;`
   - Implement `@media (max-width: 1024px)` breakpoints for tablet/mobile

2. **Component Architecture**
   - Create `PortfolioLayout.tsx` wrapper component
   - Implement responsive breakpoints using Tailwind's `lg:`, `md:`, `sm:` prefixes
   - Use React hooks for managing scroll state and viewport dimensions
   - Implement `useEffect` to track window resize events

3. **Accessibility Considerations**
   - Ensure proper semantic HTML structure
   - Implement skip navigation links
   - Maintain keyboard navigation support
   - Test with screen readers

**Testing Strategy:**
- Vitest unit tests for responsive breakpoint logic
- Visual regression tests at 320px, 768px, 1024px, 1440px viewports
- Manual testing on actual devices (mobile, tablet, desktop)
- Lighthouse accessibility audit (target: 95+)

**Prompt for Implementation:**
```
Create a responsive two-column portfolio layout component that:
1. On desktop (1024px+): Fixed left sidebar (50%) with sticky positioning, scrollable right content (50%)
2. On tablet (768px-1023px): Stack with left column becoming a sticky header
3. On mobile (<768px): Single column with hamburger navigation
4. Implement smooth scroll behavior and proper overflow handling
5. Include proper semantic HTML and ARIA labels
6. Use Tailwind CSS utilities for all styling
7. Ensure 60fps performance with GPU acceleration where needed
```

---

### Feature 1.2: Cursor Spotlight/Glow Effect

**Objective:** Implement an elegant, hardware-accelerated cursor-following radial gradient spotlight that enhances visual appeal without impacting performance.

**Technical Requirements:**
- Hardware-accelerated animations (transform + opacity only)
- Smooth tracking of mouse position
- Radial gradient with orange/amber color palette
- Blur effect for soft appearance
- Performance target: 60fps constant

**Implementation Strategy:**

1. **Effect Mechanism**
   - Use `mousemove` event listener on window
   - Track `clientX` and `clientY` coordinates
   - Update spotlight position using `transform: translate(-50%, -50%)`
   - Apply `blur-3xl` filter with `opacity-20` for soft effect

2. **Performance Optimization**
   - Use `requestAnimationFrame` for smooth updates
   - Implement debouncing if needed (typically not required for mousemove)
   - Use CSS `will-change: transform` for optimization hints
   - Avoid layout recalculations by only updating transform

3. **Visual Design**
   - Radial gradient: `from-amber-400 to-orange-500`
   - Size: 384px diameter (w-96 h-96)
   - Blur: `blur-3xl`
   - Opacity: `opacity-20` (adjustable based on visual preference)
   - Position: `fixed` with `pointer-events-none`

**Testing Strategy:**
- Performance profiling using Chrome DevTools
- Frame rate monitoring (target: consistent 60fps)
- Visual consistency across browsers
- Mobile behavior (disable on touch devices)

**Prompt for Implementation:**
```
Implement a cursor spotlight effect that:
1. Follows the mouse cursor smoothly across the page
2. Uses a radial gradient from amber-400 to orange-500
3. Applies blur-3xl filter for soft glow appearance
4. Updates position using transform (not left/top) for performance
5. Maintains 60fps performance consistently
6. Uses pointer-events-none to avoid interfering with interactions
7. Includes optional disable on mobile/touch devices
8. Applies will-change optimization hints
```

---

### Feature 1.3: Navigation and Branding in Left Column

**Objective:** Create an elegant navigation system integrated into the left sidebar with smooth interactions and clear visual hierarchy.

**Technical Requirements:**
- Sticky navigation with smooth scroll-to-section
- Social media links with hover effects
- Contact information display
- Mobile-responsive hamburger menu
- Active section highlighting

**Implementation Strategy:**

1. **Navigation Structure**
   - Create navigation array with section IDs and labels
   - Implement smooth scroll using `scrollIntoView({ behavior: 'smooth' })`
   - Track active section using `Intersection Observer API`
   - Update active state as user scrolls

2. **Branding Section**
   - Display name with text gradient effect
   - Show professional title/tagline
   - Brief bio or value proposition
   - Profile image or avatar (optional)

3. **Social Links**
   - GitHub, LinkedIn, Email icons
   - Hover effects with color transitions
   - Proper accessibility with aria-labels
   - External link handling with target="_blank"

4. **Contact Information**
   - Email address (clickable mailto link)
   - Phone number (clickable tel link)
   - Location display
   - Responsive text sizing

**Testing Strategy:**
- Vitest tests for scroll-to-section functionality
- Visual tests for active state highlighting
- Accessibility audit for link navigation
- Mobile menu interaction tests

**Prompt for Implementation:**
```
Create a navigation component for the left sidebar that:
1. Displays name, title, and brief bio with text gradient
2. Includes navigation links to About, Portfolio, Experience, Contact sections
3. Implements smooth scroll-to-section on link click
4. Tracks active section using Intersection Observer API
5. Highlights active navigation item
6. Displays social media links (GitHub, LinkedIn, Email) with hover effects
7. Shows contact information (email, phone, location)
8. Includes mobile hamburger menu that collapses navigation
9. All links have proper ARIA labels and keyboard navigation support
```

---

## PHASE 2: HERO SECTION & VISUAL DESIGN

### Feature 2.1: Hero Section with CTA Buttons

**Objective:** Create an impactful hero section that immediately communicates Lidet's value proposition and encourages user engagement.

**Technical Requirements:**
- Large, readable typography hierarchy
- Two CTA buttons: "View My Work" and "Contact Me"
- Responsive text sizing (mobile-first approach)
- Smooth button interactions with hover effects
- Scroll indicator for mobile users

**Implementation Strategy:**

1. **Typography Hierarchy**
   - Main heading: 5xl on desktop, 4xl on mobile
   - Subheading: lg text with muted foreground color
   - Body text: readable line-height (1.6+) with proper contrast
   - Use text gradient for accent words

2. **CTA Button Design**
   - Primary button: Accent background with hover state
   - Secondary button: Outline style with border
   - Smooth transitions (300ms ease-out)
   - Include icons (ArrowRight for primary)
   - Proper focus states for accessibility

3. **Scroll Indicator**
   - Animated chevron or arrow
   - Visible only on mobile/tablet
   - Subtle animation (bounce or fade)
   - Disappears after first scroll

4. **Statistics Section**
   - Display 3 key stats: Years of Experience, Projects, Satisfaction
   - Grid layout with border separator
   - Accent color for numbers

**Testing Strategy:**
- Typography contrast ratio tests (WCAG AA minimum)
- Button accessibility tests (keyboard navigation, screen readers)
- Responsive text sizing tests
- Animation performance tests

**Prompt for Implementation:**
```
Create a hero section component that:
1. Displays a compelling headline with text gradient accent
2. Includes subheading with professional tagline
3. Shows two CTA buttons: "View My Work" (primary) and "Contact Me" (secondary)
4. Implements smooth hover effects on buttons with icon animations
5. Displays 3 key statistics (Years, Projects, Satisfaction) in a grid
6. Includes animated scroll indicator on mobile/tablet
7. Uses responsive typography (5xl/4xl heading, lg body)
8. Maintains proper color contrast ratios (WCAG AA)
9. All interactive elements have proper focus states
10. Smooth scroll-to-section when CTA buttons are clicked
```

---

## PHASE 3: CONTENT SECTIONS

### Feature 3.1: About Section with Skills Progress Bars

**Objective:** Showcase Lidet's background, expertise, and professional development with animated skill indicators.

**Technical Requirements:**
- Animated progress bars for skills
- Smooth animations on scroll into view
- Exact skill percentages: HTML/CSS 95%, JavaScript 90%, React 90%, TypeScript 80%, Django 90%
- Responsive grid layout
- Intersection Observer for animation triggers

**Implementation Strategy:**

1. **Skills Data Structure**
   ```typescript
   const skills = [
     { name: 'HTML/CSS', percentage: 95 },
     { name: 'JavaScript', percentage: 90 },
     { name: 'React', percentage: 90 },
     { name: 'TypeScript', percentage: 80 },
     { name: 'Django', percentage: 90 },
     { name: 'Node.js', percentage: 75 },
   ];
   ```

2. **Progress Bar Animation**
   - Use CSS `@keyframes` for width animation
   - Trigger animation when section enters viewport
   - Duration: 1.2 seconds with ease-out timing
   - Show percentage label during animation

3. **Section Layout**
   - Bio paragraph with proper line-height
   - Skills section with progress bars
   - Experience timeline with border-left accent
   - Education entries with dates
   - Certifications grid

4. **Timeline Design**
   - Vertical timeline with left border accent
   - Company/institution name with dates
   - Role/degree description
   - Bullet points for key achievements

**Testing Strategy:**
- Vitest tests for skill data structure
- Animation timing tests
- Intersection Observer trigger tests
- Responsive layout tests

**Prompt for Implementation:**
```
Create an About section component that:
1. Displays professional bio with proper line-height and contrast
2. Shows animated skill progress bars with exact percentages:
   - HTML/CSS: 95%
   - JavaScript: 90%
   - React: 90%
   - TypeScript: 80%
   - Django: 90%
3. Implements smooth width animations on scroll into view (1.2s ease-out)
4. Displays experience timeline with:
   - INSA internship (2024-2025)
   - Role description and achievements
5. Shows education entries:
   - ASTU Software Engineering (2023-Present)
   - Arsi University Economics (2024-Present)
6. Lists certifications in a responsive grid
7. Uses Intersection Observer API for animation triggers
8. Maintains proper visual hierarchy with typography
9. Responsive layout for mobile/tablet/desktop
```

---

### Feature 3.2: Portfolio/Projects Section with Filterable Grid

**Objective:** Showcase Lidet's projects with filtering capabilities and detailed project cards.

**Technical Requirements:**
- Four projects: Beauty House, Fitness Website, GeezGeeks, Ecommerce API
- Filter tabs: All, Web Development, UI/UX Design, Graphics Design
- Project cards with images, descriptions, tech stacks
- Smooth filter transitions
- Hover effects on project cards

**Implementation Strategy:**

1. **Projects Data Structure**
   ```typescript
   const projects = [
     {
       id: 1,
       title: 'Beauty House',
       description: 'Full-featured appointment management website',
       category: 'Web Development',
       technologies: ['React', 'TypeScript', 'Tailwind CSS'],
       image: '...',
       link: '...',
       github: '...',
     },
     // ... more projects
   ];
   ```

2. **Filter Implementation**
   - Create filter state with useState
   - Filter projects array based on selected category
   - Smooth transitions between filtered views
   - Use Framer Motion or CSS transitions for animations

3. **Project Card Design**
   - Image with gradient overlay
   - Title and description
   - Technology tags/badges
   - Action buttons (View Project, GitHub)
   - Hover effects: scale image, change border color

4. **Responsive Grid**
   - Single column on mobile
   - Two columns on tablet
   - Maintain single column on desktop for better readability

**Testing Strategy:**
- Vitest tests for filter logic
- Component tests for project card rendering
- Snapshot tests for project data
- Visual regression tests for hover states

**Prompt for Implementation:**
```
Create a Portfolio section component that:
1. Displays four projects with exact names:
   - Beauty House
   - Fitness Website
   - GeezGeeks
   - Ecommerce API
2. Implements filter tabs: All, Web Development, UI/UX Design, Graphics Design
3. Filters projects smoothly when tab is clicked
4. Each project card shows:
   - Project image with gradient overlay
   - Title and description
   - Technology stack as badges
   - View Project and GitHub links
5. Implements hover effects:
   - Image scale-up
   - Border color change to accent
   - Background color transition
6. Responsive grid layout (1 col mobile, 1 col desktop for readability)
7. Smooth transitions between filter states
8. All links open in new tabs with proper security attributes
```

---

### Feature 3.3: Testimonials Section with Feedback Form

**Objective:** Display client testimonials and collect new feedback through an integrated form.

**Technical Requirements:**
- Display two testimonials: Sarah Johnson and Hiwot Ayele
- Testimonial cards with star ratings
- Feedback form with validation
- Database persistence
- Owner notification on submission

**Implementation Strategy:**

1. **Testimonials Data**
   ```typescript
   const testimonials = [
     {
       author: 'Sarah Johnson',
       title: 'CEO',
       company: 'TechStart Inc.',
       content: '...',
       rating: 5,
     },
     {
       author: 'Hiwot Ayele',
       title: 'Founder',
       company: 'Elegance Beauty house',
       content: '...',
       rating: 5,
     },
   ];
   ```

2. **Testimonial Card Design**
   - Star rating display
   - Quote text with proper styling
   - Author name, title, company
   - Hover effects and transitions

3. **Feedback Form**
   - Fields: Name, Email, Company, Rating, Feedback
   - Form validation using Zod
   - Star rating selector (interactive)
   - Submit button with loading state
   - Success/error toast notifications

4. **Backend Integration**
   - tRPC mutation: `feedback.submit`
   - Save to `testimonials` table with `isApproved: 0`
   - Trigger `notifyOwner` notification
   - Return success response

**Testing Strategy:**
- Vitest tests for form validation
- Component tests for testimonial rendering
- Integration tests for form submission
- Database persistence tests

**Prompt for Implementation:**
```
Create a Testimonials section component that:
1. Displays two testimonials with exact names:
   - Sarah Johnson (CEO, TechStart Inc.)
   - Hiwot Ayele (Founder, Elegance Beauty house)
2. Shows 5-star ratings with star icons
3. Includes feedback form with fields:
   - Name (required)
   - Email (required, validated)
   - Company/Position (optional)
   - Rating (1-5 stars, interactive selector)
   - Feedback text (required)
4. Implements form validation using Zod
5. Submits form via tRPC mutation (feedback.submit)
6. Shows loading state during submission
7. Displays success/error toast notifications
8. Saves feedback to database with isApproved: 0
9. Triggers owner notification on successful submission
10. Clears form after successful submission
```

---

### Feature 3.4: Contact Section with Form

**Objective:** Provide a clear contact mechanism for visitors to reach out to Lidet.

**Technical Requirements:**
- Contact form with Name, Email, Message fields
- Contact information display (email, phone, location)
- Form validation
- Database persistence
- Owner notification on submission

**Implementation Strategy:**

1. **Contact Information Display**
   - Email with mailto link
   - Phone with tel link
   - Location text
   - Icons for visual hierarchy

2. **Contact Form**
   - Fields: Name, Email, Message
   - Form validation using Zod
   - Submit button with loading state
   - Success/error handling

3. **Backend Integration**
   - tRPC mutation: `contact.submit`
   - Save to `contactSubmissions` table
   - Trigger `notifyOwner` notification
   - Mark as unread by default

4. **Responsive Layout**
   - Two-column on desktop (info + form)
   - Single column on mobile

**Testing Strategy:**
- Vitest tests for form validation
- Integration tests for form submission
- Database persistence tests
- Email validation tests

**Prompt for Implementation:**
```
Create a Contact section component that:
1. Displays contact information:
   - Email: lidetadmassu217@outlook.com (clickable mailto)
   - Phone: +251-931460438 (clickable tel)
   - Location: Addis Ababa, Ethiopia
2. Includes contact form with fields:
   - Name (required)
   - Email (required, validated)
   - Message (required, min 10 characters)
3. Implements form validation using Zod
4. Submits via tRPC mutation (contact.submit)
5. Shows loading state during submission
6. Displays success/error toast notifications
7. Saves to database with isRead: 0
8. Triggers owner notification on submission
9. Two-column layout on desktop, single column on mobile
10. Icons for email, phone, location with hover effects
```

---

## PHASE 4: INTERACTIVE FEATURES

### Feature 4.1: RAG Chat Assistant

**Objective:** Implement a streaming RAG (Retrieval-Augmented Generation) chat system that answers questions about Lidet's background, projects, and skills.

**Technical Requirements:**
- Vector embeddings for resume chunks
- Semantic search over knowledge base
- LLM streaming responses
- Chat history display
- Terminal-themed UI

**Implementation Strategy:**

1. **Knowledge Base Setup**
   - Create resume chunks with metadata
   - Generate embeddings using LLM API
   - Store in `ragKnowledgeBase` table
   - Implement chunking strategy (500 tokens per chunk)

2. **Vector Search**
   - Convert user question to embedding
   - Perform cosine similarity search
   - Retrieve top 3-5 most relevant chunks
   - Construct context for LLM prompt

3. **LLM Integration**
   - Use `invokeLLM` helper from Manus
   - System prompt with defensive instructions
   - Include retrieved context in prompt
   - Stream response character-by-character

4. **Frontend Chat UI**
   - Message list with user/assistant differentiation
   - Input field with send button
   - Loading indicator during response
   - Markdown rendering for responses
   - Chat history persistence (optional)

5. **Backend Procedure**
   ```typescript
   rag: router({
     chat: publicProcedure
       .input(z.object({
         question: z.string().min(1),
         visitorId: z.string(),
       }))
       .mutation(async ({ input }) => {
         // 1. Convert question to embedding
         // 2. Search knowledge base
         // 3. Retrieve top chunks
         // 4. Call LLM with context
         // 5. Stream response
         // 6. Log to chatLogs table
       }),
   })
   ```

**Testing Strategy:**
- Vitest tests for embedding generation
- Integration tests for vector search
- LLM response quality tests
- Chat UI component tests
- End-to-end chat flow tests

**Prompt for Implementation:**
```
Implement a RAG Chat Assistant that:
1. Stores resume/portfolio content as chunks in ragKnowledgeBase table
2. Generates embeddings for each chunk using LLM API
3. On user question:
   a. Converts question to embedding
   b. Performs cosine similarity search for top 3-5 chunks
   c. Constructs context from retrieved chunks
   d. Calls invokeLLM with defensive system prompt
   e. Streams response character-by-character
   f. Logs interaction to chatLogs table
4. Frontend displays:
   - Chat history with user/assistant messages
   - Markdown-rendered responses
   - Loading indicator during response
   - Input field with send button
   - Terminal-themed styling
5. Handles errors gracefully with user-friendly messages
6. Implements visitor tracking using unique visitorId
7. Supports multiple concurrent conversations
```

---

### Feature 4.2: AI Resume Analyzer

**Objective:** Allow recruiters to paste job descriptions and receive AI-powered match analysis against Lidet's resume.

**Technical Requirements:**
- Job description input (drag-drop or paste)
- LLM-based analysis
- Match score calculation (0-100%)
- Matched keywords highlighting
- Skill gap identification
- JSON structured response

**Implementation Strategy:**

1. **Input Handling**
   - Drag-and-drop zone for text files
   - Paste textarea for job descriptions
   - File upload support (PDF, TXT, DOCX)
   - Text extraction and validation

2. **Analysis Logic**
   - Extract skills from job description
   - Compare against Lidet's skill matrix
   - Calculate match percentage
   - Identify matched and missing skills
   - Generate personalized pitch

3. **LLM Integration**
   - Use structured JSON response format
   - System prompt with analysis instructions
   - Include Lidet's resume as context
   - Return: matchScore, matchedKeywords, skillGaps, pitch

4. **Response Display**
   - Match score with visual indicator (progress bar)
   - Matched keywords with checkmarks
   - Missing skills with suggestions
   - AI-generated pitch for recruiter

5. **Backend Procedure**
   ```typescript
   resumeAnalyzer: router({
     analyze: publicProcedure
       .input(z.object({
         jobDescription: z.string().min(100),
         visitorId: z.string(),
       }))
       .mutation(async ({ input }) => {
         // 1. Extract skills from JD
         // 2. Compare with resume
         // 3. Call LLM for analysis
         // 4. Parse structured response
         // 5. Log to resumeAnalyzerLogs
         // 6. Return analysis
       }),
   })
   ```

**Testing Strategy:**
- Vitest tests for skill extraction
- LLM response parsing tests
- Match score calculation tests
- Component tests for analysis display
- End-to-end analyzer flow tests

**Prompt for Implementation:**
```
Implement an AI Resume Analyzer that:
1. Provides drag-drop and paste input for job descriptions
2. Supports file uploads (TXT, PDF, DOCX)
3. On submission:
   a. Extracts text and validates length (min 100 chars)
   b. Calls LLM with structured JSON schema
   c. Includes Lidet's resume as context
   d. Requests analysis with fields:
      - matchScore (0-100)
      - matchedKeywords (array)
      - skillGaps (array)
      - pitch (personalized message)
4. Displays results:
   - Match score with visual progress bar
   - Matched keywords with green checkmarks
   - Skill gaps with suggestions
   - AI-generated pitch
5. Logs analysis to resumeAnalyzerLogs table
6. Handles errors gracefully
7. Shows loading state during analysis
8. Implements visitor tracking
```

---

### Feature 4.3: Weather Widget

**Objective:** Display current weather based on visitor's location and integrate weather state with 3D animations.

**Technical Requirements:**
- Geolocation detection (IP-based or browser API)
- Weather API integration
- Real-time weather display
- 3D mesh color/animation updates based on weather
- Responsive widget design

**Implementation Strategy:**

1. **Geolocation Detection**
   - Use browser Geolocation API (with fallback)
   - IP-based geolocation as fallback
   - Handle permission denial gracefully
   - Cache location for session

2. **Weather API Integration**
   - Use OpenWeatherMap or similar API
   - Fetch current weather data
   - Extract: temperature, condition, icon, humidity
   - Handle API errors and rate limits

3. **Widget Display**
   - Current temperature with icon
   - Weather condition text
   - Location name
   - Humidity/wind speed (optional)
   - Responsive sizing

4. **3D Mesh Integration**
   - Map weather states to color palettes
   - Sunny: Warm orange/yellow
   - Rainy: Cool blue/purple
   - Night: Dark blue/indigo
   - Update mesh color dynamically

5. **Backend Procedure**
   ```typescript
   weather: router({
     getCurrent: publicProcedure
       .input(z.object({
         latitude: z.number(),
         longitude: z.number(),
       }))
       .query(async ({ input }) => {
         // 1. Call weather API
         // 2. Extract relevant data
         // 3. Return weather info
       }),
   })
   ```

**Testing Strategy:**
- Vitest tests for geolocation handling
- Weather API integration tests
- Widget rendering tests
- 3D mesh color update tests
- Error handling tests

**Prompt for Implementation:**
```
Implement a Weather Widget that:
1. Detects visitor location using:
   - Browser Geolocation API (if permitted)
   - IP-based geolocation as fallback
2. Fetches weather data via OpenWeatherMap API
3. Displays:
   - Current temperature
   - Weather condition with icon
   - Location name
   - Humidity and wind speed
4. Updates 3D mesh colors based on weather:
   - Sunny: Warm orange/yellow palette
   - Rainy: Cool blue/purple palette
   - Night: Dark blue/indigo palette
   - Cloudy: Gray/neutral palette
5. Handles errors gracefully:
   - Location permission denied
   - API failures
   - Network issues
6. Caches location for session
7. Shows loading state during fetch
8. Responsive widget sizing
9. Updates mesh animation frequency based on weather
```

---

## PHASE 5: ADMIN PORTAL

### Feature 5.1: Secure Admin Dashboard

**Objective:** Create a protected admin interface for managing portfolio content and viewing submissions.

**Technical Requirements:**
- Manus OAuth authentication
- Role-based access control (admin only)
- Dashboard layout with multiple sections
- Data tables with sorting/filtering
- CRUD operations for content

**Implementation Strategy:**

1. **Authentication & Authorization**
   - Use Manus OAuth for login
   - Check `user.role === 'admin'` on protected routes
   - Redirect unauthorized users to home
   - Session management via cookies

2. **Admin Route Protection**
   - Create `/admin` route
   - Implement `protectedRoute` wrapper
   - Check admin role in route guard
   - Fallback to home page

3. **Dashboard Layout**
   - Sidebar navigation with sections
   - Main content area with data tables
   - Header with user info and logout
   - Responsive design for tablet/mobile

4. **Dashboard Sections**
   - Contact Submissions viewer
   - Pending Testimonials approver
   - Chat Logs viewer
   - RAG Knowledge Base manager
   - Portfolio Projects CRUD

**Testing Strategy:**
- Vitest tests for auth checks
- Component tests for admin routes
- Integration tests for CRUD operations
- E2E tests for admin workflows

**Prompt for Implementation:**
```
Create a secure Admin Dashboard that:
1. Requires Manus OAuth login
2. Checks user.role === 'admin' for access
3. Redirects unauthorized users to home
4. Displays dashboard with sections:
   a. Contact Submissions
      - Table with Name, Email, Message, Date
      - Mark as read/unread
      - Delete functionality
   b. Pending Testimonials
      - Show pending feedback
      - Approve/Reject buttons
      - Preview before approval
   c. Chat Logs
      - Display visitor questions and answers
      - Filter by date range
      - Search functionality
   d. RAG Knowledge Base
      - Upload/paste resume chunks
      - Edit existing chunks
      - Delete chunks
      - View embeddings status
   e. Portfolio Projects
      - CRUD operations
      - Edit project details
      - Upload project images
5. Responsive sidebar navigation
6. User profile section with logout
7. Proper error handling and loading states
```

---

### Feature 5.2: Contact Submissions Manager

**Objective:** Allow admin to view and manage contact form submissions.

**Technical Requirements:**
- Display all submissions in table format
- Mark as read/unread
- Delete submissions
- Sort by date
- Search functionality

**Implementation Strategy:**

1. **Data Display**
   - Fetch submissions via `admin.getContactSubmissions`
   - Display in table with columns: Name, Email, Message, Date, Status
   - Show unread count in sidebar

2. **Interactions**
   - Click row to expand and view full message
   - Mark as read/unread toggle
   - Delete button with confirmation
   - Sort by date (newest first)

3. **Search & Filter**
   - Search by name or email
   - Filter by read/unread status
   - Date range filter (optional)

**Testing Strategy:**
- Vitest tests for data fetching
- Component tests for table rendering
- Integration tests for CRUD operations

**Prompt for Implementation:**
```
Create a Contact Submissions Manager that:
1. Fetches submissions via admin.getContactSubmissions tRPC
2. Displays table with columns:
   - Name
   - Email
   - Message (truncated)
   - Date
   - Status (Read/Unread)
3. Implements interactions:
   - Click row to expand and view full message
   - Mark as read/unread toggle
   - Delete with confirmation dialog
4. Sorting:
   - Default: newest first
   - Sortable by name, email, date
5. Search and filter:
   - Search by name or email
   - Filter by read/unread status
6. Visual indicators:
   - Unread submissions highlighted
   - Hover effects on rows
   - Loading states
7. Pagination for large datasets (optional)
```

---

### Feature 5.3: Testimonials Approval System

**Objective:** Review and approve pending testimonials before they appear on the portfolio.

**Technical Requirements:**
- Display pending testimonials
- Preview before approval
- Approve/Reject functionality
- View approved testimonials
- Manage testimonial display

**Implementation Strategy:**

1. **Pending Testimonials View**
   - Fetch via `admin.getPendingTestimonials`
   - Display cards with author, rating, content
   - Show submission date

2. **Approval Actions**
   - Approve button: calls `admin.approveTestimonial`
   - Reject button: calls `admin.rejectTestimonial` (future)
   - Confirmation dialogs for actions

3. **Approved Testimonials View**
   - Display all approved testimonials
   - Option to unapprove/remove
   - Reorder testimonials (future)

**Testing Strategy:**
- Vitest tests for approval logic
- Component tests for testimonial cards
- Integration tests for approval workflow

**Prompt for Implementation:**
```
Create a Testimonials Approval System that:
1. Displays pending testimonials in card format:
   - Author name, title, company
   - Star rating
   - Full testimonial text
   - Submission date
2. Implements approval workflow:
   - Approve button calls admin.approveTestimonial
   - Reject button (optional)
   - Confirmation dialog before action
3. Shows approved testimonials in separate section:
   - Display all approved testimonials
   - Option to unapprove/remove
   - Reorder functionality (optional)
4. Visual indicators:
   - Pending badge
   - Approved badge
   - Hover effects
5. Loading states and error handling
```

---

### Feature 5.4: RAG Knowledge Base Manager

**Objective:** Allow admin to upload and manage resume chunks for the RAG system.

**Technical Requirements:**
- Upload/paste resume content
- Automatic chunking (500 tokens per chunk)
- Embedding generation
- View existing chunks
- Delete chunks
- Metadata management

**Implementation Strategy:**

1. **Content Upload**
   - Textarea for pasting content
   - File upload support (TXT, PDF)
   - Text extraction and validation
   - Preview before saving

2. **Chunking Strategy**
   - Split by sentences/paragraphs
   - Target 500 tokens per chunk
   - Preserve context with overlaps
   - Generate chunk IDs

3. **Embedding Generation**
   - Call LLM embedding API
   - Store embeddings in database
   - Show progress indicator
   - Handle API failures

4. **Chunk Management**
   - Display existing chunks in table
   - Show chunk content, metadata, embedding status
   - Edit chunk content (regenerate embedding)
   - Delete chunks with confirmation

5. **Backend Integration**
   - Create `admin.uploadRagContent` procedure
   - Implement chunking logic
   - Call embedding API
   - Save to `ragKnowledgeBase` table

**Testing Strategy:**
- Vitest tests for chunking logic
- Embedding generation tests
- Component tests for upload UI
- Integration tests for content management

**Prompt for Implementation:**
```
Create a RAG Knowledge Base Manager that:
1. Provides content upload interface:
   - Textarea for pasting resume content
   - File upload (TXT, PDF)
   - Text extraction and validation
   - Preview before saving
2. Implements automatic chunking:
   - Split by sentences/paragraphs
   - Target 500 tokens per chunk
   - Preserve context with overlaps
   - Generate unique chunk IDs
3. Generates embeddings:
   - Call LLM embedding API
   - Show progress indicator
   - Handle API failures gracefully
   - Store embeddings in database
4. Displays chunk management table:
   - Chunk ID, content preview, metadata
   - Embedding status indicator
   - Edit button (regenerate embedding)
   - Delete button with confirmation
5. Shows statistics:
   - Total chunks
   - Total tokens
   - Last updated date
6. Error handling and validation
```

---

## PHASE 6: WEBGL 3D ANIMATIONS

### Feature 6.1: React Three Fiber 3D Mesh

**Objective:** Implement an elegant 3D animated mesh that responds to cursor movement and scroll acceleration.

**Technical Requirements:**
- React Three Fiber integration
- Custom vertex shader for organic distortion
- Noise-based animation
- Cursor velocity tracking
- Scroll acceleration responsiveness
- Confined to left column
- Performance optimization (60fps)

**Implementation Strategy:**

1. **Setup & Configuration**
   - Install Three.js and React Three Fiber
   - Create Canvas component with proper sizing
   - Configure camera and lighting
   - Implement error boundary

2. **Mesh Creation**
   - Create icosphere or plane geometry
   - Apply custom vertex shader
   - Use Perlin noise for organic motion
   - Implement material with custom shader

3. **Shader Implementation**
   ```glsl
   // Vertex shader
   uniform float uTime;
   uniform float uCursorVelocity;
   uniform float uScrollAccel;
   varying float vNoise;
   
   void main() {
     float noise = snoise(position * 2.0 + uTime * 0.5);
     float distortion = noise * (0.5 + uCursorVelocity * 0.5);
     vec3 newPosition = position + normal * distortion;
     
     gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
     vNoise = noise;
   }
   ```

4. **Interactivity**
   - Track cursor position and velocity
   - Track scroll acceleration
   - Update shader uniforms in real-time
   - Smooth transitions between states

5. **Performance Optimization**
   - Use lower geometry resolution on mobile
   - Implement LOD (Level of Detail)
   - Use `useFrame` hook efficiently
   - Avoid unnecessary re-renders

6. **Weather Integration**
   - Update mesh color based on weather state
   - Adjust animation frequency
   - Change noise scale

**Testing Strategy:**
- Performance profiling (target: 60fps)
- Visual regression tests
- Shader compilation tests
- Interaction responsiveness tests

**Prompt for Implementation:**
```
Implement a React Three Fiber 3D mesh that:
1. Creates an animated icosphere or plane geometry
2. Applies custom vertex shader with:
   - Perlin noise-based distortion
   - Cursor velocity influence
   - Scroll acceleration influence
   - Time-based animation
3. Implements shader uniforms:
   - uTime: animation timeline
   - uCursorVelocity: mouse movement speed
   - uScrollAccel: scroll acceleration
   - uWeatherColor: weather-based color
4. Tracks interactivity:
   - Mouse position and velocity
   - Scroll speed and acceleration
   - Updates shader uniforms smoothly
5. Optimizes performance:
   - Lower resolution on mobile
   - Efficient useFrame implementation
   - Avoid unnecessary re-renders
6. Integrates with weather:
   - Updates mesh color based on weather state
   - Adjusts animation frequency
   - Changes noise scale
7. Maintains 60fps performance consistently
8. Handles errors and fallbacks gracefully
```

---

## PHASE 7: TESTING & OPTIMIZATION

### Feature 7.1: Unit Tests with Vitest

**Objective:** Implement comprehensive unit tests for all features using Vitest.

**Test Coverage Target:** 80%+

**Test Categories:**

1. **Data & Logic Tests**
   - Form validation (Zod schemas)
   - Skill data structure
   - Project filtering logic
   - RAG chunking algorithm
   - Match score calculation

2. **Component Tests**
   - Hero section rendering
   - Navigation functionality
   - Portfolio grid filtering
   - Form submission handling
   - Admin dashboard access control

3. **Integration Tests**
   - Contact form submission flow
   - Feedback form submission flow
   - Admin approval workflow
   - RAG chat interaction
   - Resume analyzer flow

4. **API Tests**
   - tRPC procedure calls
   - Database operations
   - LLM API integration
   - Weather API integration

**Testing Strategy:**
- Use Vitest for unit tests
- Use MSW (Mock Service Worker) for API mocking
- Use React Testing Library for component tests
- Aim for 80%+ coverage
- Run tests in CI/CD pipeline

**Prompt for Implementation:**
```
Create comprehensive Vitest tests that:
1. Unit tests for data/logic:
   - Form validation schemas
   - Skill data structure
   - Project filtering
   - RAG chunking
   - Match score calculation
2. Component tests:
   - Hero section rendering
   - Navigation interactions
   - Portfolio filtering
   - Form submissions
   - Admin dashboard access
3. Integration tests:
   - Contact form submission flow
   - Feedback form submission flow
   - Admin approval workflow
   - RAG chat interaction
4. API tests:
   - tRPC procedure calls
   - Database operations
   - LLM API mocking
5. Achieve 80%+ code coverage
6. Run tests on every commit
```

---

### Feature 7.2: Performance Optimization

**Objective:** Ensure the website meets performance benchmarks across all metrics.

**Performance Targets:**
- Lighthouse: 90+ (Performance, Accessibility, Best Practices, SEO)
- Core Web Vitals: All green
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- Time to Interactive: < 3.5s

**Optimization Strategy:**

1. **Code Splitting**
   - Lazy load WebGL components
   - Code split by route
   - Dynamic imports for heavy features

2. **Image Optimization**
   - Use WebP format with fallbacks
   - Responsive images with srcset
   - Lazy loading for below-fold images
   - Optimize project images

3. **Bundle Optimization**
   - Analyze bundle size with webpack-bundle-analyzer
   - Remove unused dependencies
   - Tree-shake unused code
   - Minify and compress assets

4. **Runtime Performance**
   - Optimize React renders (React.memo, useMemo)
   - Efficient event handlers (debounce, throttle)
   - Avoid layout thrashing
   - Use CSS containment

5. **Caching Strategy**
   - Service Worker for offline support
   - Browser caching headers
   - CDN caching for static assets

**Testing Strategy:**
- Lighthouse audits
- WebPageTest analysis
- Chrome DevTools profiling
- Real-world performance monitoring

**Prompt for Implementation:**
```
Optimize portfolio performance to achieve:
1. Lighthouse scores: 90+ across all metrics
2. Core Web Vitals: All green
3. First Contentful Paint: < 1.5s
4. Largest Contentful Paint: < 2.5s
5. Cumulative Layout Shift: < 0.1

Implement optimizations:
1. Code splitting:
   - Lazy load WebGL components
   - Route-based code splitting
   - Dynamic imports for heavy features
2. Image optimization:
   - WebP format with fallbacks
   - Responsive images with srcset
   - Lazy loading for below-fold images
3. Bundle optimization:
   - Analyze bundle size
   - Remove unused dependencies
   - Tree-shake unused code
4. Runtime performance:
   - Optimize React renders
   - Efficient event handlers
   - Avoid layout thrashing
5. Caching strategy:
   - Service Worker support
   - Browser caching headers
   - CDN caching
```

---

## PHASE 8: DEPLOYMENT & DELIVERY

### Feature 8.1: Final Polish & QA

**Objective:** Ensure the website is production-ready with comprehensive testing and quality assurance.

**QA Checklist:**

1. **Functionality Testing**
   - All forms submit correctly
   - Navigation works smoothly
   - Filtering functions properly
   - Admin dashboard accessible
   - All links work

2. **Cross-Browser Testing**
   - Chrome/Edge (latest)
   - Firefox (latest)
   - Safari (latest)
   - Mobile browsers

3. **Responsive Design**
   - Mobile (320px, 375px, 414px)
   - Tablet (768px, 1024px)
   - Desktop (1440px, 1920px)
   - Orientation changes

4. **Accessibility**
   - WCAG 2.1 AA compliance
   - Keyboard navigation
   - Screen reader testing
   - Color contrast ratios

5. **Security**
   - HTTPS enabled
   - No sensitive data in console
   - XSS prevention
   - CSRF protection
   - SQL injection prevention

6. **SEO**
   - Meta tags
   - Open Graph tags
   - Structured data
   - Sitemap
   - Robots.txt

**Testing Strategy:**
- Manual QA checklist
- Automated testing suite
- Cross-browser testing
- Accessibility audit
- Security scan

**Prompt for Implementation:**
```
Perform final QA and polish:
1. Functionality testing:
   - All forms submit correctly
   - Navigation smooth
   - Filtering works
   - Admin dashboard accessible
   - All links functional
2. Cross-browser testing:
   - Chrome, Firefox, Safari, Edge
   - Latest versions
   - Mobile browsers
3. Responsive design:
   - Mobile: 320px, 375px, 414px
   - Tablet: 768px, 1024px
   - Desktop: 1440px, 1920px
4. Accessibility:
   - WCAG 2.1 AA compliance
   - Keyboard navigation
   - Screen reader testing
   - Color contrast ratios
5. Security:
   - HTTPS enabled
   - No sensitive data exposed
   - XSS prevention
   - CSRF protection
6. SEO:
   - Meta tags
   - Open Graph tags
   - Structured data
   - Sitemap
```

---

## Implementation Timeline

**Week 1-2:** Core Layout & Design (Features 1.1-1.3, 2.1)
**Week 3:** Content Sections (Features 3.1-3.4)
**Week 4:** Interactive Features (Features 4.1-4.3)
**Week 5:** Admin Portal (Features 5.1-5.4)
**Week 6:** WebGL 3D (Feature 6.1)
**Week 7:** Testing & Optimization (Features 7.1-7.2)
**Week 8:** Final Polish & Deployment (Feature 8.1)

---

## Success Metrics

1. **Performance:** Lighthouse 90+, Core Web Vitals all green
2. **Accessibility:** WCAG 2.1 AA compliance
3. **User Engagement:** Contact form submissions, feedback collection
4. **Code Quality:** 80%+ test coverage, zero critical bugs
5. **SEO:** Indexed in search engines, good rankings for target keywords

---

## Notes

- All exact values (names, percentages, dates) must match specifications
- Maintain consistent design language throughout
- Prioritize performance and accessibility
- Implement comprehensive error handling
- Document all code thoroughly
- Follow best practices for React, TypeScript, and Tailwind CSS
