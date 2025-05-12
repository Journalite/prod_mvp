// src/components/RenderArticle.tsx
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Article as ArticleService } from '@/services/articleService';
import CommentSection from '@/components/CommentSection';
import '@/styles/article.css';  
import '@/styles/article.css';     

interface Comment {
  userId: string;
  content: string;
  createdAt: string;
}

interface Paragraph {
  paragraphId: string;
  text: string;
  likes: string[];
  comments: Comment[];
}

interface ComplexArticle {
  _id: string;
  authorId: string;
  title: string;
  slug: string;
  coverImageUrl?: string;
  tags: string[];
  content: Paragraph[];
  likes: string[];
  reposts: string[];
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

interface RenderArticleProps {
  article: ArticleService | ComplexArticle;
}

const RenderArticle: React.FC<RenderArticleProps> = ({ article }) => {
  const [visibleParagraphs, setVisibleParagraphs] = useState<Record<string, boolean>>({});
  const paragraphRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // IntersectionObserver for fade‑in
  useEffect(() => {
    if (!Array.isArray((article as ComplexArticle).content)) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const id = entry.target.getAttribute('data-paragraph-id');
          if (id && entry.isIntersecting) {
            setVisibleParagraphs(prev => ({ ...prev, [id]: true }));
          }
        });
      },
      { threshold: 0.3, rootMargin: '-30px 0px' }
    );

    // observe each paragraph
    Object.values(paragraphRefs.current).forEach(el => {
      if (el) observer.observe(el);
    });

    return () => {
      Object.values(paragraphRefs.current).forEach(el => {
        if (el) observer.unobserve(el);
      });
    };
  }, [article]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  const isComplex = (a: any): a is ComplexArticle => Array.isArray(a.content);
  if (!isComplex(article)) return null;

  return (
    <article className="article-container">
      <div className="article-main">
        <header className="article-header">
          <h1 className="article-title">{article.title}</h1>
          <div className="article-meta">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
              alt="Author"
              className="author-image"
            />
            <span className="author">By {article.authorId}</span>
            <span className="separator">•</span>
            <span className="date">{formatDate(article.createdAt)}</span>
          </div>
          <div className="article-tags">
            {article.tags.map(tag => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </header>

        <section className="article-content">
          {article.content.map(para => (
            <div
              key={para.paragraphId}
              data-paragraph-id={para.paragraphId}
              // __IMPORTANT__: use braces so ref returns void
              ref={el => {
                paragraphRefs.current[para.paragraphId] = el
              }}
              className={`paragraph-block ${
                visibleParagraphs[para.paragraphId] ? 'visible' : ''
              }`}
            >
              <div className="paragraph-text">
                <ReactMarkdown>{para.text}</ReactMarkdown>
              </div>
            </div>
          ))}
        </section>

        <CommentSection slug={(article as ComplexArticle).slug} />
      </div>
    </article>
  );
};

export default RenderArticle;