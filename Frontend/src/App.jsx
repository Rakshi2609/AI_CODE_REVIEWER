import { useState, useEffect, useRef } from 'react'
import "prismjs/themes/prism-tomorrow.css"
import Editor from "react-simple-code-editor"
import prism from "prismjs"
import Markdown from "react-markdown"
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import axios from 'axios'
import './App.css'

function App() {
  const [code, setCode] = useState(`function sum(a, b) {\n  return a + b;\n}`)
  const [review, setReview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme-preference');
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  })
  const [copied, setCopied] = useState(false)
  const [showHome, setShowHome] = useState(true)
  const [showAbout, setShowAbout] = useState(false)
  const [aboutLoading, setAboutLoading] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const reviewOutputRef = useRef(null)

  useEffect(() => { prism.highlightAll() }, [code, review])
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('theme-preference', theme); }, [theme])
  
  // Handle scroll progress for large reviews
  useEffect(() => {
    const handleScroll = () => {
      if (reviewOutputRef.current) {
        const element = reviewOutputRef.current;
        const scrollTop = element.scrollTop;
        const scrollHeight = element.scrollHeight;
        const clientHeight = element.clientHeight;
        const progress = scrollHeight > clientHeight ? (scrollTop / (scrollHeight - clientHeight)) * 100 : 0;
        setScrollProgress(progress);
        
        // Add or remove has-scroll class based on content overflow
        if (scrollHeight > clientHeight) {
          element.classList.add('has-scroll');
        } else {
          element.classList.remove('has-scroll');
        }
      }
    };

    const reviewElement = reviewOutputRef.current;
    if (reviewElement) {
      reviewElement.addEventListener('scroll', handleScroll);
      // Check scroll immediately when review content changes
      handleScroll();
      return () => reviewElement.removeEventListener('scroll', handleScroll);
    }
  }, [review])

  // Check for scrollable content when review changes
  useEffect(() => {
    if (reviewOutputRef.current && review) {
      const element = reviewOutputRef.current;
      setTimeout(() => {
        const scrollHeight = element.scrollHeight;
        const clientHeight = element.clientHeight;
        if (scrollHeight > clientHeight) {
          element.classList.add('has-scroll');
        } else {
          element.classList.remove('has-scroll');
        }
      }, 100); // Small delay to ensure content is rendered
    }
  }, [review])

  async function reviewCode() {
    if (!code.trim()) return
    
    // Check code size before sending
    const codeSize = new Blob([code]).size;
    if (codeSize > 5 * 1024 * 1024) { // 5MB limit
      setError('Code is too large. Please submit smaller code chunks for better review quality.');
      return;
    }
    
    setLoading(true); setError(''); setReview('')
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
      const response = await axios.post(`${apiBaseUrl}/ai/get-review`, { code }, {
        timeout: 300000, // 5 minute timeout
        maxContentLength: 50 * 1024 * 1024, // 50MB response limit
        maxBodyLength: 10 * 1024 * 1024 // 10MB request limit
      })
      
      // Handle new response format
      if (response.data.review) {
        setReview(response.data.review)
        console.log('Review metadata:', response.data.metadata)
      } else {
        // Fallback for old format
        setReview(response.data)
      }
    } catch (e) {
      if (e.code === 'ECONNABORTED') {
        setError('Request timeout. The code might be too complex for analysis. Please try with smaller code chunks.')
      } else {
        setError(e?.response?.data?.message || 'Failed to fetch review. Please try again.')
      }
    } finally { setLoading(false) }
  }

  function toggleTheme() { setTheme(t => t === 'dark' ? 'light' : 'dark') }
  function copyCode() { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1600) }
  function clearCode() { setCode(''); setReview(''); setError(''); }
  function goToWorkspace() { setShowHome(false); setShowAbout(false); }
  function goHome() { setShowHome(true); setShowAbout(false); setAboutLoading(false); clearCode(); }
  function goToAbout() { 
    setAboutLoading(true);
    setShowHome(false); 
    clearCode();
    // Simulate loading time for smooth transition
    setTimeout(() => {
      setShowAbout(true);
      setAboutLoading(false);
    }, 800);
  }

  return (
    <div className={`app-shell ${theme}`}>
      <header className="app-header" role="banner">
        <div className="header-content">
          <div className="brand" onClick={goHome} style={{cursor: 'pointer'}}>
            <span className="logo-gradient">AI Code Review</span>
            <span className="tagline">Instant insights for your snippets</span>
          </div>
          <div className="header-actions">
            {(!showHome || showAbout) && <button className="btn subtle" onClick={goHome}>← Home</button>}
            {!showAbout && <button className="btn subtle" onClick={goToAbout}>About</button>}
            <button className="btn subtle" onClick={toggleTheme} aria-label="Toggle theme">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</button>
          </div>
        </div>
      </header>

      {aboutLoading ? (
        <main className="loading-page" role="main">
          <div className="loading-container">
            <div className="profile-loader">
              <div className="profile-avatar loading-avatar">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1"/>
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" fill="currentColor"/>
                  <circle cx="12" cy="8" r="3" fill="currentColor"/>
                  <path d="M12 14c-3 0-5 1.5-5 3v1h10v-1c0-1.5-2-3-5-3z" fill="currentColor"/>
                </svg>
              </div>
              <div className="loading-text">Loading About...</div>
              <div className="loading-bar">
                <div className="loading-progress"></div>
              </div>
            </div>
          </div>
        </main>
      ) : showAbout ? (
        <main className="about-page" role="main">
          <div className="about-container">
            <div className="about-hero fade-in">
              <div className="profile-section">
                <div className="profile-avatar">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1"/>
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" fill="currentColor"/>
                    <circle cx="12" cy="8" r="3" fill="currentColor"/>
                    <path d="M12 14c-3 0-5 1.5-5 3v1h10v-1c0-1.5-2-3-5-3z" fill="currentColor"/>
                  </svg>
                </div>
                <h1 className="profile-name">Rakshith Ganjimut</h1>
                <p className="profile-title">Full Stack Developer & AI Enthusiast</p>
              </div>
            </div>
            
            <div className="about-content">
              <div className="about-section">
                <h2>About Me</h2>
                <p>
                  I'm a passionate full-stack developer with a keen interest in artificial intelligence and modern web technologies. 
                  I love building innovative solutions that make development workflows more efficient and enjoyable.
                </p>
                <p>
                  This AI Code Review tool represents my vision of combining the power of AI with practical development needs. 
                  It's designed to help developers of all levels improve their code quality and learn best practices in real-time.
                </p>
              </div>
              
              <div className="about-section">
                <h2>Skills & Technologies</h2>
                <div className="skills-grid">
                  <div className="skill-category">
                    <h3>Frontend</h3>
                    <p>React, JavaScript, CSS3, HTML5, Responsive Design</p>
                  </div>
                  <div className="skill-category">
                    <h3>Backend</h3>
                    <p>Node.js, Express, API Development, Database Design</p>
                  </div>
                  <div className="skill-category">
                    <h3>AI/ML</h3>
                    <p>Google Gemini AI, Natural Language Processing, AI Integration</p>
                  </div>
                  <div className="skill-category">
                    <h3>Tools</h3>
                    <p>Git, VS Code, Chrome DevTools, Modern Development Workflow</p>
                  </div>
                </div>
              </div>
              
              <div className="connect-section">
                <h2>Let's Connect</h2>
                <p>I'm always excited to connect with fellow developers and discuss new ideas!</p>
                <div className="social-links">
                  <a href="https://www.linkedin.com/in/rakshith-ganjimut/" target="_blank" rel="noopener noreferrer" className="social-link linkedin">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="2" y="9" width="4" height="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>LinkedIn</span>
                  </a>
                  <a href="https://github.com/Rakshi2609" target="_blank" rel="noopener noreferrer" className="social-link github">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>GitHub</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      ) : showHome ? (
        <main className="home-page" role="main">
          <div className="home-container">
            <div className="hero-section fade-in">
              <div className="hero-badge">No Sign Up Required</div>
              <h1 className="hero-title">Transform Your Code with AI</h1>
              <p className="hero-description">
                Get instant, professional code reviews powered by advanced AI. 
                Improve code quality, catch bugs, and learn best practices - all in seconds.
              </p>
              <button className="btn-hero" onClick={goToWorkspace}>
                Start Reviewing Code
                <span className="hero-arrow">→</span>
              </button>
            </div>
            
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/>
                  </svg>
                </div>
                <h3>Instant Analysis</h3>
                <p>Get detailed code reviews in seconds, not hours. Our AI analyzes your code for bugs, performance issues, and best practices.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1"/>
                    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.2"/>
                    <circle cx="12" cy="12" r="2" fill="currentColor"/>
                  </svg>
                </div>
                <h3>Smart Suggestions</h3>
                <p>Receive actionable improvements with code examples. Learn modern patterns and industry standards effortlessly.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>Privacy First</h3>
                <p>No registration required. Your code is processed securely and never stored. Start reviewing immediately with complete privacy.</p>
              </div>
            </div>

            <div className="stats-section">
              <div className="stat-item">
                <div className="stat-number">0</div>
                <div className="stat-label">Sign Up Required</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">&lt; 5s</div>
                <div className="stat-label">Average Review Time</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">100%</div>
                <div className="stat-label">Privacy Guaranteed</div>
              </div>
            </div>
          </div>
        </main>
      ) : (
        <main className="workspace" role="main">
          <div className="container">
            <section className="panel left" aria-label="Code editor section">
              <div className="panel-header">
                <h2>Source Code</h2>
                <div className="panel-tools">
                  <button className="btn tiny" onClick={clearCode} disabled={!code.trim()}>Clear</button>
                  <button className="btn tiny" onClick={copyCode}>{copied ? 'Copied' : 'Copy'}</button>
                  <button className="btn primary tiny" disabled={loading || !code.trim()} onClick={reviewCode}>{loading ? 'Reviewing...' : 'Review Code'}</button>
                </div>
              </div>
              <div className="editor-wrapper" data-loading={loading}>
                <Editor
                  value={code}
                  onValueChange={setCode}
                  highlight={value => prism.highlight(value, prism.languages.javascript, 'javascript')}
                  padding={14}
                  style={{ fontFamily: '"Fira Code", "Fira Mono", monospace', fontSize: 15, height: '100%', width: '100%' }}
                />
                {loading && <div className="overlay loading-blur"><div className="spinner" /></div>}
              </div>
              {error && <div className="alert error" role="alert">{error}</div>}
            </section>

            <section className="panel right" aria-label="AI review output">
              <div className="panel-header">
                <h2>AI Review</h2>
                <div className="panel-tools small-hint">{loading ? 'Generating...' : review ? 'Complete' : 'Idle'}</div>
              </div>
              {review && (
                <div className="content-stats">
                  <span>Review Length: {review.length.toLocaleString()} characters</span>
                  <span>Scroll Progress: {Math.round(scrollProgress)}%</span>
                </div>
              )}
              {review && (
                <div className="review-progress">
                  <div className="review-progress-bar" style={{ width: `${scrollProgress}%` }}></div>
                </div>
              )}
              <div ref={reviewOutputRef} className="review-output custom-scroll" data-empty={!review && !loading}>
                <div className="review-content">
                  {review && review.length > 5000 && (
                    <div className="large-content-warning">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLineCap="round" strokeLineJoin="round"/>
                      </svg>
                      <span>Large review generated - scroll to read the complete analysis</span>
                    </div>
                  )}
                  {review && (
                    <div className="scroll-indicator">↓ Scroll for more ↓</div>
                  )}
                  {loading && (
                    <div className="skeleton-stack">
                      {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton" />)}
                    </div>
                  )}
                  {!loading && !review && !error && (
                    <div className="placeholder fade-in">
                      Run a review to see AI feedback here.
                      <br/><br/>
                      The scroll bar will appear when content exceeds the container height.
                      <br/><br/>
                      Try submitting some code to test the scroll functionality.
                    </div>
                  )}
                  {!loading && review && (
                    <div className="review-markdown fade-in" key={review.slice(0,40)}>
                      <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </main>
      )}

      <footer className="app-footer" role="contentinfo">
        <div className="footer-content">
          <span>Built with modern web tech</span>
          <span className="sep" />
          <span className="meta">Theme: {theme}</span>
        </div>
      </footer>
    </div>
  )
}

export default App
