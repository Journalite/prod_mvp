"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from '@/styles/home.module.css'
import { auth } from '../firebase/clientApp'
import { onAuthStateChanged, signOut } from 'firebase/auth'

// Types for our article data based on actual API structure
interface Article {
  _id: string;
  title: string;
  slug: string;
  authorId: string;
  authorName?: string;
  excerpt?: string;
  coverImageUrl?: string;
  tags?: string[];
  content: {
    paragraphId: string;
    text: string;
    likes?: string[];
    comments?: any[];
  }[];
  likes?: string[];
  reposts?: string[];
  comments?: any[];
  viewCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Author mapping for using authorId to display author name
const authorMapping: {[key: string]: string} = {
  "84b2f82c-1e93-498a-983e-3b30a8379e63": "Samuel Green",
  "user_002": "Alex Martinez",
  "kristen-lee-id": "Kristen Lee",
  "alex-wen-id": "Alex Wen",
  "hannah-cole-id": "Hannah Cole"
};

// Fallback mock data only used when API is unavailable
const mockArticles: Article[] = [
  {
    _id: "60e6cbb8f19a4b3d8c3a7f21",
    authorId: "84b2f82c-1e93-498a-983e-3b30a8379e63",
    title: "The Future of Artificial Intelligence: Transforming Our World",
    slug: "updated-first-article",
    coverImageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995",
    tags: ["AI", "Machine Learning"],
    content: [
      { 
        paragraphId: "p1",
        text: "Artificial Intelligence (AI) stands at the forefront of technological innovation, promising to revolutionize every aspect of our lives. From healthcare to transportation, education to entertainment, AI's influence continues to grow exponentially."
      }
    ],
    createdAt: "2025-04-09T12:00:00.000Z",
    updatedAt: "2025-04-09T14:00:00.000Z"
  },
  {
    _id: "60e6cbb8f19a4b3d8c3a7f99",
    authorId: "user_002",
    title: "The Rise of Gen Z Creators",
    slug: "gen-z-rise",
    coverImageUrl: "https://images.unsplash.com/photo-1601908804492-7f3d9d42e1b3",
    tags: ["Culture", "Youth"],
    content: [
      {
        paragraphId: "p1",
        text: "Gen Z is redefining creativity in the age of social media, turning platforms like TikTok and YouTube into launching pads for innovative voices around the globe."
      }
    ],
    createdAt: "2025-04-10T12:00:00.000Z",
    updatedAt: "2025-04-10T13:00:00.000Z"
  },
  {
    _id: "70f7d1e2a8b24d1fa2c1b8f3",
    authorId: "kristen-lee-id",
    title: "Unravelling the Ethics of AI",
    slug: "unravelling-ethics-of-ai",
    coverImageUrl: "https://images.unsplash.com/photo-1581091012184-7c07f32c2f32",
    tags: ["Ethics", "AI"],
    content: [
      {
        paragraphId: "p1",
        text: "As artificial intelligence rapidly advances, we must confront moral questions around bias, privacy, and accountability. Who is responsible when an AI-powered system errs, and how do we ensure fair outcomes for all?"
      }
    ],
    createdAt: "2025-04-12T09:00:00.000Z",
    updatedAt: "2025-04-12T09:00:00.000Z"
  },
  {
    _id: "81a8d2f3b9c35e2ab3d2c4e5",
    authorId: "alex-wen-id",
    title: "The Hidden Costs of Urbanization",
    slug: "hidden-costs-of-urbanization",
    coverImageUrl: "https://images.unsplash.com/photo-1541051646-784cfc8a2c21",
    tags: ["Urbanization", "Society"],
    content: [
      {
        paragraphId: "p1",
        text: "Cities grow at breakneck speed, but beneath the skylines lie rising living costs, environmental strain, and widening inequality. How do we balance prosperity with sustainability in our ever‑expanding metropolises?"
      }
    ],
    createdAt: "2025-04-12T09:15:00.000Z",
    updatedAt: "2025-04-12T09:15:00.000Z"
  },
  {
    _id: "92h9ffg3c41d7e6g1f6h0g54",
    authorId: "hannah-cole-id",
    title: "Justice and Equality in Modern Society",
    slug: "justice-and-equality-in-modern-society",
    coverImageUrl: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70",
    tags: ["Justice", "Equality"],
    content: [
      {
        paragraphId: "p1",
        text: "In an age of rapid change, ensuring that every voice is heard and that rights are upheld remains the cornerstone of a just society. What steps can we take to close the gap between ideals and reality?"
      }
    ],
    createdAt: "2025-04-12T09:30:00.000Z",
    updatedAt: "2025-04-12T09:30:00.000Z"
  }
];

export default function HomePage() {
  // Initialize with empty arrays/null instead of stub objects
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Initialize as false

  useEffect(() => {
    // Check Firebase authentication status
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user); // Set to true if user exists
    });
    
    // Fetch articles data
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        
        // Backend Flask API URL 
        const API_BASE_URL = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
        
        // Try to fetch from API first
        try {
          // Get featured article
          const featuredResponse = await fetch(`${API_BASE_URL}/api/prototype/v1/articles?featured=true`);
          
          if (!featuredResponse.ok) {
            throw new Error(`API error: ${featuredResponse.status}`);
          }
          
          const featuredData = await featuredResponse.json();
          
          if (featuredData && featuredData.length > 0) {
            setFeaturedArticle(featuredData[0]);
          }
          
          // Get all articles
          const articlesResponse = await fetch(`${API_BASE_URL}/api/prototype/v1/articles`);
          
          if (!articlesResponse.ok) {
            throw new Error(`API error: ${articlesResponse.status}`);
          }
          
          const articlesData = await articlesResponse.json();
          
          if (articlesData) {
            // Filter out the featured article from the main list
            const nonFeaturedArticles = featuredArticle 
              ? articlesData.filter((article: Article) => article.slug !== featuredArticle.slug)
              : articlesData;
              
            setArticles(nonFeaturedArticles);
            
            // Extract all unique tags
            const allTags = articlesData
              .flatMap((article: Article) => article.tags || [])
              .filter((tag: string, index: number, self: string[]) => self.indexOf(tag) === index);
              
            setTags(allTags);
          }
        } catch (apiError) {
          console.error('API not available, using mock data:', apiError);
          
          // Use mock data if API fails
          // Set featured article as the first one
          setFeaturedArticle(mockArticles[0]);
          
          // Use the rest for the article list
          setArticles(mockArticles.slice(1));
          
          // Extract unique tags from mock data
          const allTags = mockArticles
            .flatMap(article => article.tags || [])
            .filter((tag, index, self) => self.indexOf(tag) === index);
            
          setTags(allTags);
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
    
    // Clean up the auth listener on unmount
    return () => unsubscribe();
  }, []);

  // Get author name from authorId, preferring the API-provided authorName if available
  const getAuthorName = (article: Article): string => {
    if (article.authorName) return article.authorName;
    if (!article.authorId) return '';
    return authorMapping[article.authorId] || '';
  };

  // Calculate estimated reading time based on content length
  const getReadingTime = (content: Article['content']) => {
    if (!content || !Array.isArray(content)) {
      return 1; // Default to 1 minute if content is missing or not an array
    }
    
    const wordCount = content.reduce((count: number, para: { text: string }) => {
      return count + ((para && para.text) ? para.text.split(' ').length : 0);
    }, 0);
    
    // Average reading speed: 200 words per minute
    const minutes = Math.ceil(wordCount / 200) || 1; // Ensure at least 1 minute
    return minutes;
  };

  // Use the API-provided excerpt if available, otherwise calculate from content
  const getExcerpt = (article: Article, maxLength = 150) => {
    // If the API provided an excerpt, use it
    if (article.excerpt) return article.excerpt;
    
    // Otherwise calculate from content as a fallback
    const content = article.content;
    if (!content || !Array.isArray(content) || content.length === 0) {
      return '';
    }
    
    const text = content[0]?.text || '';
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength).trim() + '...';
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      // Error handling for logout failure
    }
  };

  return (
    <div className={styles['three-column-layout']}>
      {/* LEFT SIDEBAR */}
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

      {/* CENTER COLUMN */}
      <main className={styles['center-column']}>
        {/* Daily Prompt Banner */}
        <div className={styles['prompt-banner']}>
          <div className={styles['prompt-icon']}>💡</div>
          <div className={styles['prompt-text']}>What's an idea that changed your life?</div>
          <Link href="/write" className={styles['prompt-button']}>
            Write now →
          </Link>
        </div>

        {isLoading ? (
          <div className={styles['loading']}>Loading articles...</div>
        ) : (
          <>
            {/* Featured Thought */}
            {featuredArticle && (
              <article className={styles['featured-card']}>
                <div className={styles['featured-content']}>
                  <div className={styles['featured-label']}>FEATURED THOUGHT</div>
                  <h2 className={styles['featured-title']}>{featuredArticle.title}</h2>
                  <div className={styles['featured-meta']}>
                    by {getAuthorName(featuredArticle)} • {getReadingTime(featuredArticle.content)} min read
                  </div>
                  <p className={styles['featured-excerpt']}>
                    {getExcerpt(featuredArticle)}
                  </p>
                  <Link href={`/articles/${featuredArticle.slug}`} className={styles['read-link']}>
                    Read →
                  </Link>
                </div>
                {featuredArticle.coverImageUrl && (
                  <div className={styles['featured-image']}>
                    <img 
                      src={featuredArticle.coverImageUrl} 
                      alt={featuredArticle.title}
                      className={styles['cover-image']}
                    />
                  </div>
                )}
              </article>
            )}

            {/* Article Grid */}
            <div className={styles['article-grid']}>
              {articles.map((article, index) => (
                <article 
                  key={article._id || article.slug || `article-${index}`} 
                  className={styles['article-card']}
                >
                  <h3 className={styles['article-title']}>{article.title}</h3>
                  <div className={styles['article-meta']}>
                    by {getAuthorName(article)} • {getReadingTime(article.content)} min read
                  </div>
                  {(article.excerpt || (article.content && article.content.length > 0)) && (
                    <p className={styles['article-excerpt']}>
                      {getExcerpt(article)}
                    </p>
                  )}
                  
                  {/* Tags */}
                  {article.tags && article.tags.length > 0 && (
                    <div className={styles['article-tags']}>
                      {article.tags.map((tag, tagIndex) => (
                        <span key={`${article.slug}-tag-${tagIndex}`} className={styles['tag']}>{tag}</span>
                      ))}
                    </div>
                  )}
                  
                  {/* Reaction Bar */}
                  <div className={styles['reaction-bar']}>
                    <button className={styles['reaction-button']}>❤️ Echo</button>
                    <button className={styles['reaction-button']}>🔁 Resonate</button>
                    <button className={styles['reaction-button']}>💬 Comment</button>
                    <Link href={`/articles/${article.slug}`} className={styles['read-link']}>
                      Read →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </main>

      {/* RIGHT SIDEBAR */}
      <aside className={styles['right-sidebar']}>
        <h2 className={styles['sidebar-heading']}>Trending</h2>
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
  )
}