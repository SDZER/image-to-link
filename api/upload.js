import fetch from 'node-fetch';

// GitHub configuration – replace with your values (or set env vars)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;      // set in Vercel environment
const REPO_OWNER = process.env.REPO_OWNER || 'SDZER';
const REPO_NAME = process.env.REPO_NAME || 'image-to-link';
const BRANCH = process.env.BRANCH || 'main';

export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { filename, content } = req.body;
    if (!filename || !content) {
        return res.status(400).json({ error: 'Missing filename or content' });
    }

    // Sanitize filename and create unique path
    const safeName = filename.replace(/[^a-zA-Z0-9.]/g, '_');
    const path = `uploads/${Date.now()}-${safeName}`;

    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;

    const body = {
        message: `Upload ${safeName}`,
        content: content,
        branch: BRANCH
    };

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            // Forward GitHub error message
            return res.status(response.status).json({ error: data.message });
        }

        // Construct raw URL
        const rawUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${path}`;
        return res.status(200).json({ url: rawUrl });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
