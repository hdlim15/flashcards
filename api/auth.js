// Serverless function for GitHub OAuth token exchange
// Deploy this to Vercel, Netlify, or Cloudflare Workers

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'Authorization code required' });
    }

    try {
        // Exchange authorization code for access token
        const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code: code,
            }),
        });

        const data = await response.json();

        if (data.error) {
            return res.status(400).json({ error: data.error_description || data.error });
        }

        // Return only the access token (never expose client_secret)
        return res.status(200).json({
            access_token: data.access_token,
            token_type: data.token_type,
            scope: data.scope,
        });
    } catch (error) {
        console.error('OAuth error:', error);
        return res.status(500).json({ error: 'Failed to exchange authorization code' });
    }
}

