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

        // Construct the prompt incorporating the user's query
        const prompt = `Provide detailed information about ${query}.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Function to replace stars with bold text
        const formatResponse = (text) => {
            return text.replace(/\*\*(.*?)\*\*/g, '**$1**')
                      .replace(/\*/g, '')
                      .replace(/^(.*?):/g, '**$1:**')
                      .replace(/^(.*)$/, (match, p1) => {
                          if (p1.trim().startsWith('-')) {
                              return p1.replace('-', '•');
                          }
                          return p1;
                      });
        };

        const formattedText = formatResponse(responseText);

        // Log the formatted response in the console
        console.log(`**Query:** ${query}`);
        console.log(`**Information:**`);
        console.log(formattedText.split('\n').map(line => line.trim()).join('\n'));

        const formattedResponse = {
            query: query,
            information: formattedText
        }

        res.json(formattedResponse);
    } catch (error) {
        console.error("Error generating travel information:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { travelInfoController };
