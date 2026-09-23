const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serves our HTML page

// API Endpoint to download video
app.post('/api/download', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    // Command to stream the best MP4 video + audio directly to standard output
    const command = `npx yt-dlp-exec "${url}" -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" -o -`;

    res.header('Content-Disposition', 'attachment; filename="video.mp4"');
    res.header('Content-Type', 'video/mp4');

    const process = exec(command, { maxBuffer: 1024 * 1024 * 1024 });

    // Pipe the yt-dlp output stream directly to the browser response
    process.stdout.pipe(res);

    process.stderr.on('data', (data) => {
        console.log(`yt-dlp log: ${data}`);
    });

    process.on('error', (err) => {
        console.error('Download error:', err);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to process video' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running locally at http://localhost:${PORT}`);
});
