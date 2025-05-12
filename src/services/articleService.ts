// src/services/articleService.ts
// // or wherever your interface lives

export async function getArticle(slug: string): Promise<Article> {
    // 1. Read your base URL (make sure .env.local has NEXT_PUBLIC_API_BASE_URL)
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
        || 'http://127.0.0.1:5001'

    // 2. Construct the correct Flask endpoint
    const url = `${baseUrl}/api/prototype/v1/article/${slug}`

    // 3. Fetch it
    const res = await fetch(url)
    if (!res.ok) {
        throw new Error(`Failed to fetch article: ${res.status} ${res.statusText}`)
    }

    // 4. Parse JSON and return
    return res.json()
}

// Get article comments
export async function getArticleComments(slug: string): Promise<ArticleComment[]> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5001'
    const url = `${baseUrl}/api/prototype/v1/article/${slug}/comments`

    const res = await fetch(url)
    if (!res.ok) {
        throw new Error(`Failed to fetch comments: ${res.status} ${res.statusText}`)
    }

    return res.json()
}

// Post a new comment
export async function postComment(slug: string, userId: string, content: string): Promise<ArticleComment> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5001'
    const url = `${baseUrl}/api/prototype/v1/article/${slug}/comment`

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, content }),
    })

    if (!res.ok) {
        throw new Error(`Failed to post comment: ${res.status} ${res.statusText}`)
    }

    return res.json()
}

// Post a reply to a comment
export async function postReply(slug: string, commentId: string, userId: string, content: string): Promise<CommentReply> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5001'
    const url = `${baseUrl}/api/prototype/v1/article/${slug}/comment/${commentId}/reply`

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, content }),
    })

    if (!res.ok) {
        throw new Error(`Failed to post reply: ${res.status} ${res.statusText}`)
    }

    return res.json()
}

// Like or unlike a comment
export async function likeComment(slug: string, commentId: string, userId: string): Promise<{ success: boolean, action: string, likes: string[], count: number }> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5001'
    const url = `${baseUrl}/api/prototype/v1/article/${slug}/comment/${commentId}/like`

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
    })

    if (!res.ok) {
        throw new Error(`Failed to like comment: ${res.status} ${res.statusText}`)
    }

    return res.json()
}

// Like or unlike a reply
export async function likeReply(slug: string, commentId: string, replyId: string, userId: string): Promise<{ success: boolean, action: string, likes: string[], count: number }> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5001'
    const url = `${baseUrl}/api/prototype/v1/article/${slug}/comment/${commentId}/reply/${replyId}/like`

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
    })

    if (!res.ok) {
        throw new Error(`Failed to like reply: ${res.status} ${res.statusText}`)
    }

    return res.json()
}

// Delete a comment
export async function deleteComment(slug: string, commentId: string, userId: string): Promise<{ success: boolean, message: string }> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5001'
    const url = `${baseUrl}/api/prototype/v1/article/${slug}/comment/${commentId}?userId=${userId}`

    const res = await fetch(url, {
        method: 'DELETE',
    })

    if (!res.ok) {
        throw new Error(`Failed to delete comment: ${res.status} ${res.statusText}`)
    }

    return res.json()
}

// Delete a reply
export async function deleteReply(slug: string, commentId: string, replyId: string, userId: string): Promise<{ success: boolean, message: string }> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5001'
    const url = `${baseUrl}/api/prototype/v1/article/${slug}/comment/${commentId}/reply/${replyId}?userId=${userId}`

    const res = await fetch(url, {
        method: 'DELETE',
    })

    if (!res.ok) {
        throw new Error(`Failed to delete reply: ${res.status} ${res.statusText}`)
    }

    return res.json()
}

export interface Article {
    _id: string;
    id?: string;           // optional for your samples
    slug: string;
    title: string;
    content: string | ParagraphContent[];
    author?: string;
    authorId: string;
    publishedDate?: string;
    tags: string[];
    likes: number | string[];
    viewCount?: number;
    readTime?: number;
    comments?: ArticleComment[];
    coverImageUrl?: string;
    createdAt?: string;
    updatedAt?: string;
    reposts?: string[];
}

interface ParagraphContent {
    paragraphId: string;
    text: string;
    likes: string[];
    comments: CommentContent[];
}

interface CommentContent {
    userId: string;
    content: string;
    createdAt: string;
}

export interface ArticleComment {
    commentId: string;
    userId: string;
    content: string;
    createdAt: string;
    likes: string[];
    replies: CommentReply[];
}

export interface CommentReply {
    replyId: string;
    userId: string;
    content: string;
    createdAt: string;
    likes: string[];
}