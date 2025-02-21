const { GoogleGenerativeAI } = require("@google/generative-ai");

const googleAPIKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(googleAPIKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const travelInfoController = async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        // Construct prompt for AI
        const prompt = `Provide detailed travel information about ${query}. Format text with markdown-like syntax (headings, bullet points, bold).`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Function to manually format response text into HTML
        const formatResponseToHTML = (text) => {
            return text
                // Convert Markdown headings to HTML headings
                .replace(/^### (.*$)/gm, '<h3>$1</h3>')
                .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                .replace(/^# (.*$)/gm, '<h1>$1</h1>')
                // Convert **bold** to <strong>
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                // Convert bullet points (- text) into <ul><li> elements
                .replace(/^- (.*)/gm, '<li>$1</li>')
                // Wrap lists with <ul> tags (ensure proper list structure)
                .replace(/(<li>.*<\/li>)/gms, '<ul>$1</ul>')
                // Convert new lines into <p> tags for paragraphs
                .replace(/(?:\r\n|\r|\n){2,}/g, '</p><p>') // Multiple new lines -> separate paragraphs
                .replace(/^(?!<h[1-3]>|<ul>|<li>)(.*)$/gm, '<p>$1</p>') // Wrap remaining text in <p>
                // Remove unnecessary nested paragraph tags inside lists
                .replace(/<p><ul>/g, '<ul>')
                .replace(/<\/ul><\/p>/g, '</ul>')
                .replace(/<p><li>/g, '<li>')
                .replace(/<\/li><\/p>/g, '</li>');
        };

        // Convert AI response to formatted HTML
        const formattedHTML = formatResponseToHTML(responseText);

        console.log(`**Query:** ${query}`);
        console.log(`**Formatted Response:**`);
        console.log(formattedHTML);

        res.json({
            query: query,
            information: formattedHTML,
        });

    } catch (error) {
        console.error("Error generating travel information:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { travelInfoController };
