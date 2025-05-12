"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import styles from '@/styles/home.module.css'
import { auth } from '@/firebase/clientApp'
import { onAuthStateChanged, signOut } from 'firebase/auth'

// Import the original article components
import { getArticle, Article as ArticleType } from '@/services/articleService'
import RenderArticle from '@/components/RenderArticle'

// Author mapping from homepage for consistency
const authorMapping: {[key: string]: string} = {
  "84b2f82c-1e93-498a-983e-3b30a8379e63": "Samuel Green",
  "user_002": "Alex Martinez",
  "kristen-lee-id": "Kristen Lee",
  "alex-wen-id": "Alex Wen",
  "hannah-cole-id": "Hannah Cole"
};

export default function ArticlePage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [article, setArticle] = useState<ArticleType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  
  useEffect(() => {
    // Check Firebase authentication status
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    
    // Fetch article data
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        if (!slug) return;
        
        const articleData = await getArticle(slug);
        setArticle(articleData);
        
        // Set tags for the right sidebar
        if (articleData && articleData.tags) {
          setTags(articleData.tags);
        }
      } catch (error) {
        setError('Failed to load article');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
    
    // Clean up the auth listener on unmount
    return () => unsubscribe();
  }, [slug]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      // Error handling for logout
    }
  };

  return (
    <div className={styles['three-column-layout']}>
      {/* LEFT SIDEBAR - Same as homepage */}
      <aside className={`${styles['left-sidebar']} ${isSidebarCollapsed ? styles['collapsed'] : ''}`}>
        <div className={styles['sidebar-header']}>
          <div className={styles.logo}>Journalite</div>
          <button 
            className={styles['toggle-button']} 
            onClick={toggleSidebar}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? "→" : "←"}
          </button>
        </div>
        
        <nav className={styles['vertical-nav']}>
          {isAuthenticated ? (
            // Navigation for authenticated users
            <>
              <Link href="/" className={`${styles['nav-link']} ${styles['nav-home']}`}>
                <span className={styles['nav-icon']}>•</span>
                <span className={styles['nav-text']}>Home</span>
              </Link>
              <Link href="/my-thoughts" className={`${styles['nav-link']} ${styles['nav-thoughts']}`}>
                <span className={styles['nav-icon']}>•</span>
                <span className={styles['nav-text']}>My Thoughts</span>
              </Link>
              <Link href="/explore" className={`${styles['nav-link']} ${styles['nav-explore']}`}>
                <span className={styles['nav-icon']}>•</span>
                <span className={styles['nav-text']}>Explore</span>
              </Link>
              <Link href="/profile" className={`${styles['nav-link']} ${styles['nav-profile']}`}>
                <span className={styles['nav-icon']}>•</span>
                <span className={styles['nav-text']}>My Profile</span>
              </Link>
              <Link href="/settings" className={`${styles['nav-link']} ${styles['nav-settings']}`}>
                <span className={styles['nav-icon']}>•</span>
                <span className={styles['nav-text']}>Settings</span>
              </Link>
              <button 
                onClick={handleLogout}
                className={`${styles['nav-link']} ${styles['nav-logout']}`}
              >
                <span className={styles['nav-icon']}>•</span>
                <span className={styles['nav-text']}>Log out</span>
              </button>
            </>
          ) : (
            // Navigation for non-authenticated users
            <>
              <Link href="/" className={`${styles['nav-link']} ${styles['nav-home']}`}>
                <span className={styles['nav-icon']}>•</span>
                <span className={styles['nav-text']}>Home</span>
              </Link>
              <Link href="/login" className={`${styles['nav-link']} ${styles['nav-login']}`}>
                <span className={styles['nav-icon']}>•</span>
                <span className={styles['nav-text']}>Login</span>
              </Link>
              <Link href="/learn" className={`${styles['nav-link']} ${styles['nav-learn']}`}>
                <span className={styles['nav-icon']}>•</span>
                <span className={styles['nav-text']}>Learn More</span>
              </Link>
              <Link href="/plans" className={`${styles['nav-link']} ${styles['nav-plans']}`}>
                <span className={styles['nav-icon']}>•</span>
                <span className={styles['nav-text']}>Plans</span>
              </Link>
            </>
          )}
        </nav>
      </aside>

      {/* CENTER COLUMN - Use the original RenderArticle component */}
      <main className={styles['center-column']}>
        {isLoading ? (
          <div className={styles['loading']}>Loading article...</div>
        ) : error ? (
          <div className={styles['loading']}>Error: {error}</div>
        ) : article ? (
          <RenderArticle article={article} />
        ) : (
          <div className={styles['loading']}>Article not found</div>
        )}
      </main>

      {/* RIGHT SIDEBAR - Same structure as homepage */}
      <aside className={styles['right-sidebar']}>
        <h2 className={styles['sidebar-heading']}>Related Tags</h2>
        <div className={styles['tag-list']}>
          {tags.map(tag => (
            <Link key={tag} href={`/tag/${tag.toLowerCase()}`} className={styles['trending-tag']}>
              # {tag}
            </Link>
          ))}
        </div>
        <Link href="/write" className={styles['write-button']}>
          Write
        </Link>
      </aside>
    </div>
  );
} 