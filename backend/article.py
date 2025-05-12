from flask import Flask, jsonify, request
from flask_cors import CORS
import uuid
from datetime import datetime

app = Flask(__name__)
# Enable CORS for all routes. In production, restrict origins appropriately.
CORS(app, origins="*")

# Authors mapping - maps authorId to display name
authors = {
    "84b2f82c-1e93-498a-983e-3b30a8379e63": "Samuel Green",
    "user_002": "Alex Martinez",
    "kristen-lee-id": "Kristen Lee",
    "alex-wen-id": "Alex Wen",
    "hannah-cole-id": "Hannah Cole",
    "urban-planner-id": "Jordan Urban",
    "quote-author-id": "John Shedd"
}

# 1) In‑memory "database" of articles
articles = {
    "updated-first-article": {
        "_id": "60e6cbb8f19a4b3d8c3a7f21",
        "authorId": "84b2f82c-1e93-498a-983e-3b30a8379e63",
        "title": "The Future of Artificial Intelligence: Transforming Our World",
        "slug": "updated-first-article",
        "coverImageUrl": "https://images.unsplash.com/photo-1677442136019-21780ecad995",
        "tags": ["AI", "Machine Learning"],
        "content": [
            { 
                "paragraphId": "p1",
                "text": "Artificial Intelligence (AI) stands at the forefront of technological innovation, promising to revolutionize every aspect of our lives. From healthcare to transportation, education to entertainment, AI's influence continues to grow exponentially. As we stand on the cusp of this technological revolution, it's crucial to understand both the potential and challenges that lie ahead.",
                "likes": ["user123", "user234", "user345"],
                "comments": [
                    {
                        "userId": "user456",
                        "content": "This introduction really sets the stage for understanding AI's impact!",
                        "createdAt": "2025-04-09T12:05:00.000Z"
                    }
                ]
            },
            # … other paragraphs omitted for brevity …
        ],
        "likes": ["user789", "user234", "user345", "user456", "user567"],
        "reposts": ["user345", "user456", "user789"],
        "comments": [
            {
                "commentId": "c123456789",
                "userId": "user789",
                "content": "This article changed my perspective on AI. Thank you for the comprehensive overview!",
                "createdAt": "2025-04-09T15:30:00.000Z",
                "likes": ["user123", "user456"],
                "replies": [
                    {
                        "replyId": "r987654321",
                        "userId": "user456",
                        "content": "I completely agree! The section on ethics was particularly eye-opening.",
                        "createdAt": "2025-04-09T16:15:00.000Z",
                        "likes": ["user789"]
                    }
                ]
            },
            {
                "commentId": "c987654321",
                "userId": "user234",
                "content": "I'd love to see a follow-up piece on AI regulation across different countries.",
                "createdAt": "2025-04-10T08:15:00.000Z",
                "likes": [],
                "replies": []
            }
        ],
        "viewCount": 1520,
        "createdAt": "2025-04-09T12:00:00.000Z",
        "updatedAt": "2025-04-09T14:00:00.000Z"
    },
    "gen-z-rise": {
        "_id": "60e6cbb8f19a4b3d8c3a7f99",
        "authorId": "user_002",
        "title": "The Rise of Gen Z Creators",
        "slug": "gen-z-rise",
        "coverImageUrl": "https://images.unsplash.com/photo-1601908804492-7f3d9d42e1b3",
        "tags": ["Culture", "Youth"],
        "content": [
            {
                "paragraphId": "p1",
                "text": "Gen Z is redefining creativity in the age of social media, turning platforms like TikTok and YouTube into launching pads for innovative voices around the globe.",
                "likes": ["user111", "user112"],
                "comments": [
                    {
                        "userId": "user888",
                        "content": "Inspiring read!",
                        "createdAt": "2025-04-09T12:05:00.000Z"
                    }
                ]
            }
        ],
        "likes": ["user001"],
        "reposts": [],
        "comments": [
            {
                "commentId": "c567890123",
                "userId": "user111",
                "content": "As a Gen Z creator, I feel seen by this article.",
                "createdAt": "2025-04-10T14:20:00.000Z",
                "likes": ["user112", "user888"],
                "replies": []
            }
        ],
        "viewCount": 98,
        "createdAt": "2025-04-10T12:00:00.000Z",
        "updatedAt": "2025-04-10T13:00:00.000Z"
    },

    # — NEW: Trending Essays —
    "unravelling-ethics-of-ai": {
        "_id": "70f7d1e2a8b24d1fa2c1b8f3",
        "authorId": "kristen-lee-id",
        "title": "Unravelling the Ethics of AI",
        "slug": "unravelling-ethics-of-ai",
        "coverImageUrl": "https://images.unsplash.com/photo-1581091012184-7c07f32c2f32",
        "tags": ["Ethics", "AI"],
        "content": [
            {
                "paragraphId": "p1",
                "text": "As artificial intelligence rapidly advances, we must confront moral questions around bias, privacy, and accountability. Who is responsible when an AI-powered system errs, and how do we ensure fair outcomes for all?",
                "likes": [],
                "comments": []
            }
        ],
        "likes": [],
        "reposts": [],
        "comments": [],
        "viewCount": 0,
        "createdAt": "2025-04-12T09:00:00.000Z",
        "updatedAt": "2025-04-12T09:00:00.000Z"
    },
    "hidden-costs-of-urbanization": {
        "_id": "81a8d2f3b9c35e2ab3d2c4e5",
        "authorId": "alex-wen-id",
        "title": "The Hidden Costs of Urbanization",
        "slug": "hidden-costs-of-urbanization",
        "coverImageUrl": "https://images.unsplash.com/photo-1541051646-784cfc8a2c21",
        "tags": ["Urbanization", "Society"],
        "content": [
            {
                "paragraphId": "p1",
                "text": "Cities grow at breakneck speed, but beneath the skylines lie rising living costs, environmental strain, and widening inequality. How do we balance prosperity with sustainability in our ever‑expanding metropolises?",
                "likes": [],
                "comments": []
            },
            {
                "paragraphId": "p2",
                "text": "## The Housing Crisis",
                "likes": [],
                "comments": []
            },
            {
                "paragraphId": "p3",
                "text": "As urban populations swell, housing markets transform into battlegrounds of economic disparity. Property values in city centers skyrocket beyond the reach of average workers, creating sprawling commuter zones and fractured communities. The modern urban dweller often sacrifices up to 50% of their income for housing alone, a stark contrast to previous generations. Meanwhile, developers focus on luxury apartments and high-margin properties, further widening the affordability gap.",
                "likes": [],
                "comments": []
            },
            {
                "paragraphId": "p4",
                "text": "## Environmental Degradation",
                "likes": [],
                "comments": []
            },
            {
                "paragraphId": "p5",
                "text": "Urban centers create concentrated environmental footprints that extend far beyond city limits. Air quality deteriorates as vehicle emissions and industrial activity intensify. Urban heat islands trap pollutants and raise temperatures, sometimes by 7°C above surrounding areas. Natural drainage patterns give way to impermeable surfaces, increasing flood risks during heavy rainfall. Despite technological advances, most cities continue to operate on infrastructure models designed for smaller populations and different climate conditions.",
                "likes": [],
                "comments": []
            },
            {
                "paragraphId": "p6",
                "text": "## Social Fragmentation",
                "likes": [],
                "comments": []
            },
            {
                "paragraphId": "p7",
                "text": "Behind the vibrant facade of urban diversity lies increasing social segregation. Economic pressures sort neighborhoods by income brackets, creating invisible boundaries that limit genuine social mixing. Community institutions struggle as transient populations cycle through neighborhoods, weakening social bonds. Mental health challenges increase with density and disconnection from nature, while noise pollution and crowding add constant stressors to daily life.",
                "likes": [],
                "comments": []
            },
            {
                "paragraphId": "p8",
                "text": "## Paths Forward",
                "likes": [],
                "comments": []
            },
            {
                "paragraphId": "p9",
                "text": "Creating truly sustainable cities requires rethinking fundamental assumptions about urban development. Mixed-income housing policies, green infrastructure investment, and community-centered design offer promising alternatives to current trajectories. Some municipalities now mandate affordable housing percentages in new developments and prioritize pedestrian-friendly planning over car-centric models. The challenge remains balancing economic growth with environmental responsibility and social cohesion—a complex equilibrium that will define urban success in the coming decades.",
                "likes": [],
                "comments": []
            }
        ],
        "likes": [],
        "reposts": [],
        "comments": [
            {
                "commentId": "c135792468",
                "userId": "urban-planner-id",
                "content": "As an urban planner, I see these issues daily. We need to prioritize inclusive development that accounts for all socioeconomic groups.",
                "createdAt": "2025-04-12T10:45:00.000Z",
                "likes": [],
                "replies": []
            }
        ],
        "viewCount": 0,
        "createdAt": "2025-04-12T09:15:00.000Z",
        "updatedAt": "2025-04-12T09:15:00.000Z"
    },
    "justice-and-equality-in-modern-society": {
        "_id": "92h9ffg3c41d7e6g1f6h0g54",
        "authorId": "hannah-cole-id",
        "title": "Justice and Equality in Modern Society",
        "slug": "justice-and-equality-in-modern-society",
        "coverImageUrl": "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70",
        "tags": ["Justice", "Equality"],
        "content": [
            {
                "paragraphId": "p1",
                "text": "In an age of rapid change, ensuring that every voice is heard and that rights are upheld remains the cornerstone of a just society. What steps can we take to close the gap between ideals and reality?",
                "likes": [],
                "comments": []
            }
        ],
        "likes": [],
        "reposts": [],
        "comments": [],
        "viewCount": 0,
        "createdAt": "2025-04-12T09:30:00.000Z",
        "updatedAt": "2025-04-12T09:30:00.000Z"
    },
    "ship-harbor-quote": {
        "_id": "q1b2c3d4e5f6g7h8i9j0",
        "authorId": "quote-author-id",
        "title": "On Taking Risks",
        "slug": "ship-harbor-quote",
        "tags": ["inspiration"],
        "content": [
            {
                "paragraphId": "p1",
                "text": "\"A ship in harbor is safe, but that is not what a ship is built for.\"",
                "likes": [],
                "comments": []
            }
        ],
        "likes": [],
        "reposts": [],
        "comments": [],
        "viewCount": 0,
        "createdAt": "2025-04-11T10:30:00.000Z",
        "updatedAt": "2025-04-11T10:30:00.000Z"
    }
}


# 2) Single‑article lookup
@app.route('/api/prototype/v1/article/<slug>', methods=['GET'])
def get_article(slug):
    art = articles.get(slug)
    if not art:
        return jsonify({"error": "Article not found"}), 404
    return jsonify(art)


# 3) List‑all summary endpoint
@app.route('/api/prototype/v1/articles', methods=['GET'])
def list_articles():
    summary = []
    for art in articles.values():
        # Extract excerpt from the first paragraph if available
        excerpt = ""
        if art.get("content") and len(art["content"]) > 0:
            # Get the first paragraph text
            excerpt = art["content"][0].get("text", "")
            # Truncate to 150 characters if necessary
            if len(excerpt) > 150:
                excerpt = excerpt[:150] + "..."
        
        # Get author name from mapping or use a fallback
        authorName = authors.get(art["authorId"], "Unknown Author")
        
        summary.append({
            "title": art["title"],
            "slug": art["slug"],
            "coverImageUrl": art.get("coverImageUrl"),
            "tags": art.get("tags", []),
            "authorId": art["authorId"],
            "authorName": authorName,
            "excerpt": excerpt,
            "_id": art["_id"],
            "content": art.get("content", []),
            "createdAt": art.get("createdAt"),
            "updatedAt": art.get("updatedAt")
        })
    return jsonify(summary)


# 4) Add a comment to an article
@app.route('/api/prototype/v1/article/<slug>/comment', methods=['POST'])
def add_article_comment(slug):
    art = articles.get(slug)
    if not art:
        return jsonify({"error": "Article not found"}), 404
    
    data = request.json
    if not data or 'content' not in data or 'userId' not in data:
        return jsonify({"error": "Missing required comment data"}), 400
    
    new_comment = {
        "commentId": f"c{uuid.uuid4().hex[:10]}",
        "userId": data['userId'],
        "content": data['content'],
        "createdAt": datetime.utcnow().isoformat() + "Z",
        "likes": [],
        "replies": []
    }
    
    if 'comments' not in art:
        art['comments'] = []
    
    art['comments'].append(new_comment)
    art['updatedAt'] = datetime.utcnow().isoformat() + "Z"
    
    return jsonify(new_comment), 201


# 5) Get all comments for an article 
@app.route('/api/prototype/v1/article/<slug>/comments', methods=['GET'])
def get_article_comments(slug): 
    art = articles.get(slug) 
    if not art: 
        return jsonify({"error": "Article not found"}), 404
    
    return jsonify(art.get('comments', []))


# 6) Delete a comment
@app.route('/api/prototype/v1/article/<slug>/comment/<comment_id>', methods=['DELETE'])
def delete_article_comment(slug, comment_id):
    art = articles.get(slug)
    if not art:
        return jsonify({"error": "Article not found"}), 404
    
    # Check if userId in request matches comment author (for authentication)
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({"error": "Authentication required"}), 401
    
    comment_list = art.get('comments', [])
    for i, comment in enumerate(comment_list):
        if comment.get('commentId') == comment_id:
            # Check if user is the comment author
            if comment.get('userId') != user_id:
                return jsonify({"error": "Not authorized to delete this comment"}), 403
            
            # Remove the comment
            del comment_list[i]
            art['updatedAt'] = datetime.utcnow().isoformat() + "Z"
            return jsonify({"success": True, "message": "Comment deleted"}), 200
    
    return jsonify({"error": "Comment not found"}), 404


# 7) Like a comment
@app.route('/api/prototype/v1/article/<slug>/comment/<comment_id>/like', methods=['POST'])
def like_article_comment(slug, comment_id):
    art = articles.get(slug)
    if not art:
        return jsonify({"error": "Article not found"}), 404
    
    data = request.json
    if not data or 'userId' not in data:
        return jsonify({"error": "Missing userId"}), 400
    
    user_id = data['userId']
    
    comment_list = art.get('comments', [])
    for comment in comment_list:
        if comment.get('commentId') == comment_id:
            likes = comment.get('likes', [])
            
            # Toggle like status
            if user_id in likes:
                likes.remove(user_id)
                action = "unliked"
            else:
                likes.append(user_id)
                action = "liked"
            
            comment['likes'] = likes
            art['updatedAt'] = datetime.utcnow().isoformat() + "Z"
            
            return jsonify({
                "success": True, 
                "action": action, 
                "likes": likes, 
                "count": len(likes)
            }), 200
    
    return jsonify({"error": "Comment not found"}), 404


# 8) Add a reply to a comment
@app.route('/api/prototype/v1/article/<slug>/comment/<comment_id>/reply', methods=['POST'])
def add_comment_reply(slug, comment_id):
    art = articles.get(slug)
    if not art:
        return jsonify({"error": "Article not found"}), 404
    
    data = request.json
    if not data or 'content' not in data or 'userId' not in data:
        return jsonify({"error": "Missing required reply data"}), 400
    
    # Create new reply
    new_reply = {
        "replyId": f"r{uuid.uuid4().hex[:10]}",
        "userId": data['userId'],
        "content": data['content'],
        "createdAt": datetime.utcnow().isoformat() + "Z",
        "likes": []
    }
    
    # Find the parent comment
    comment_found = False
    for comment in art.get('comments', []):
        if comment.get('commentId') == comment_id:
            # Initialize replies list if it doesn't exist
            if 'replies' not in comment:
                comment['replies'] = []
            
            # Add reply to comment
            comment['replies'].append(new_reply)
            art['updatedAt'] = datetime.utcnow().isoformat() + "Z"
            comment_found = True
            break
    
    if not comment_found:
        return jsonify({"error": "Comment not found"}), 404
    
    return jsonify(new_reply), 201


# 9) Delete a reply
@app.route('/api/prototype/v1/article/<slug>/comment/<comment_id>/reply/<reply_id>', methods=['DELETE'])
def delete_comment_reply(slug, comment_id, reply_id):
    art = articles.get(slug)
    if not art:
        return jsonify({"error": "Article not found"}), 404
    
    # Check if userId in request matches reply author (for authentication)
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({"error": "Authentication required"}), 401
    
    # Find the parent comment and reply
    for comment in art.get('comments', []):
        if comment.get('commentId') == comment_id:
            for i, reply in enumerate(comment.get('replies', [])):
                if reply.get('replyId') == reply_id:
                    # Check if user is the reply author
                    if reply.get('userId') != user_id:
                        return jsonify({"error": "Not authorized to delete this reply"}), 403
                    
                    # Remove the reply
                    del comment['replies'][i]
                    art['updatedAt'] = datetime.utcnow().isoformat() + "Z"
                    return jsonify({"success": True, "message": "Reply deleted"}), 200
    
    return jsonify({"error": "Comment or reply not found"}), 404


# 10) Like a reply
@app.route('/api/prototype/v1/article/<slug>/comment/<comment_id>/reply/<reply_id>/like', methods=['POST'])
def like_comment_reply(slug, comment_id, reply_id):
    art = articles.get(slug)
    if not art:
        return jsonify({"error": "Article not found"}), 404
    
    data = request.json
    if not data or 'userId' not in data:
        return jsonify({"error": "Missing userId"}), 400
    
    user_id = data['userId']
    
    # Find the parent comment and reply
    for comment in art.get('comments', []):
        if comment.get('commentId') == comment_id:
            for reply in comment.get('replies', []):
                if reply.get('replyId') == reply_id:
                    likes = reply.get('likes', [])
                    
                    # Toggle like status
                    if user_id in likes:
                        likes.remove(user_id)
                        action = "unliked"
                    else:
                        likes.append(user_id)
                        action = "liked"
                    
                    reply['likes'] = likes
                    art['updatedAt'] = datetime.utcnow().isoformat() + "Z"
                    
                    return jsonify({
                        "success": True, 
                        "action": action, 
                        "likes": likes, 
                        "count": len(likes)
                    }), 200
    
    return jsonify({"error": "Comment or reply not found"}), 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)