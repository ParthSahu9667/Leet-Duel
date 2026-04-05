import { Request, Response } from 'express';
import axios from 'axios';

// Get base URL from environment, or fallback to default public API
const ALFA_BASE_URL = process.env.LEETCODE_API_BASE_URL || 'https://alfa-leetcode-api.onrender.com';

/**
 * Universal Proxy Controller for Alfa API
 * Takes any incoming request, strips out our local mount prefix if needed (handled by Router automatically typically),
 * ensures it builds the exact URL match to the Alfa API, and forwards query parameters.
 */
export const passthroughProxy = async (req: Request, res: Response) => {
    try {
        // req.path contains the sub-path used in the router (e.g., if mounted at /api/leetcode and the route hit is /api/leetcode/alfaarghya/badges, req.path might be just /alfaarghya/badges or the full match depending on how expressive it is. Wait, using req.originalUrl is safer but we need to strip `/api/leetcode`.)
        
        // Strip out the `/api/leetcode` base to get exactly what the Alfa API expects.
        // e.g., "/api/leetcode/testuser/solved?limit=5" -> "/testuser/solved?limit=5"
        const targetPath = req.originalUrl.replace(/^\/api\/leetcode/, '');
        
        const targetUrl = `${ALFA_BASE_URL}${targetPath}`;
        
        // Use our server as a strict pass-through proxy
        const response = await axios({
            method: req.method,
            url: targetUrl,
            // axios handles appending the ?limit=5 parameter implicitly via string if we don't decouple it, 
            // since targetPath includes query args.
            headers: {
               // Forward User-Agent or just use Axios default
            }
        });

        // Pipe successful API JSON directly to the frontend clients
        res.status(response.status).json(response.data);

    } catch (error: any) {
        console.error(`[API Proxy Error] against ${req.originalUrl}:`, error.message);
        
        // If the Alfa API returned an explicit error block
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }
        
        // Network timeout / unhandled fault
        res.status(500).json({ error: 'Failed to contact external LeetCode service.' });
    }
};
