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
