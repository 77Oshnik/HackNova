const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function buildForecastPrompt(data) {
    return `
    Act as an expert travel and risk assessment AI system. Analyze and provide a detailed forecast for the following journey:

    JOURNEY DETAILS:
    Departure Date: ${data.travelDate}
    Starting Location: ${data.sourcePoint}
    Destination: ${data.destination}
    Transportation Mode: ${data.modeOfTravel}
    Travel Priority: ${data.preference}

    Provide a comprehensive analysis in the following structured format:

    1. RISK ASSESSMENT
    - Weather Forecast: Detailed weather conditions expected during travel period(use past years data and predict the forecasts)
    - Safety Risks: Analyze potential threats, severity levels (Low/Medium/High), consider every perspective(use past records of incidents, crimes, and harsh climate and predict the forecast)
    - Recent Incidents: Any relevant historical events or patterns in the region
    - Infrastructure Status: Current condition of roads/rails/airports based on mode

    2. ROUTE ANALYSIS
    - Primary Recommended Route: Based on ${data.preference} preference
    - Alternative Routes: At least 2 backup options with pros/cons
    - Travel Duration: Estimated time including potential delays
    - Known Bottlenecks: Common delay points or areas of concern

    3. POINTS OF INTEREST
    - Must-Visit Locations: Based on route and travel mode
    - Rest Stops: Strategic stopping points for breaks
    - Scenic Areas: Notable viewpoints or attractions
    - Cultural Significance: Important landmarks or cultural sites

    4. TRAVEL RECOMMENDATIONS
    - Mode-Specific Tips: Focused on ${data.modeOfTravel}
    - Suggested-Mode Alternatives: Other modes of transportation(which are best for the given journey, according to points of interest, weather forecast, etc.)
    - Safety Precautions: Specific to route and conditions
    - Emergency Contacts: Suggested emergency services to note(give emergency contact numbers of the emergency services of the)
    - Preparation Checklist: Essential items and preparations

    5. SPECIAL CONSIDERATIONS
    - Time-Specific Factors: Any date-related concerns or opportunities
    - Mode-Specific Warnings: Particular to ${data.modeOfTravel}
    - Regional Alerts: Local events or situations to be aware of
    `;
}

function formatResponse(text) {
    // Replace markdown headings with formatted headings
    text = text.replace(/#{1,6}\s+(.+)/g, (match, heading) => {
        return `\n=== ${heading.toUpperCase()} ===\n`;
    });

    // Replace bold markdown with uppercase
    text = text.replace(/\*\*(.+?)\*\*/g, (match, content) => {
        return content.toUpperCase();
    });

    // Replace bullet points with better formatting
    text = text.replace(/^\s*\*\s+/gm, '► ');

    // Replace numbered lists with better formatting
    text = text.replace(/^\s*\d+\.\s+/gm, (match) => {
        return `${match.trim()} `;
    });

    // Add line breaks before sections
    text = text.replace(/(\n►|\n===)/g, '\n\n$1');

    return text;
}


function parseResponse(rawResponse) {
    try {
        const sections = {
            riskAssessment: {},
            routeAnalysis: {},
            pointsOfInterest: {},
            travelRecommendations: {},
            specialConsiderations: {}
        };

        // Extract sections using regex
        const sections_raw = rawResponse.split(/\*\*\d+\.\s+([^*]+)\*\*/);
        
        sections_raw.forEach((section, index) => {
            if (section.trim().toLowerCase() === 'risk assessment') {
                sections.riskAssessment = extractPoints(sections_raw[index + 1]);
            } else if (section.trim().toLowerCase() === 'route analysis') {
                sections.routeAnalysis = extractPoints(sections_raw[index + 1]);
            } else if (section.trim().toLowerCase() === 'points of interest') {
                sections.pointsOfInterest = extractPoints(sections_raw[index + 1]);
            } else if (section.trim().toLowerCase() === 'travel recommendations') {
                sections.travelRecommendations = extractPoints(sections_raw[index + 1]);
            } else if (section.trim().toLowerCase() === 'special considerations') {
                sections.specialConsiderations = extractPoints(sections_raw[index + 1]);
            }
        });

        return sections;
    } catch (error) {
        console.error('Error parsing response:', error);
        return null;
    }
}

function extractPoints(text) {
    if (!text) return {};
    
    const points = {};
    const lines = text.split('\n');
    
    let currentKey = '';
    lines.forEach(line => {
        if (line.includes('*')) {
            const keyMatch = line.match(/\*\*([^:]+)\*\*/);
            if (keyMatch) {
                currentKey = keyMatch[1].trim();
                points[currentKey] = [];
            }
            const content = line.replace(/\*\*[^:]+\*\*:\s*/, '').trim();
            if (content && currentKey) {
                points[currentKey].push(content);
            }
        }
    });
    
    return points;
}

const generateForecast = async (req, res) => {
    try {
        const { sourcePoint, destination, travelDate, modeOfTravel, preference } = req.body;

        // Input validation
        if (!sourcePoint || !destination || !travelDate || !modeOfTravel || !preference) {
            return res.status(400).json({
                success: false,
                error: "Missing required fields",
                requiredFields: {
                    sourcePoint: "Starting location",
                    destination: "End location",
                    travelDate: "Date of travel",
                    modeOfTravel: "Mode of transportation",
                    preference: "Travel preference (time-saving/safe/scenic)"
                }
            });
        }

        // Validate date format
        const travelDateObj = new Date(travelDate);
        if (isNaN(travelDateObj.getTime())) {
            return res.status(400).json({
                success: false,
                error: "Invalid date format. Please use YYYY-MM-DD format"
            });
        }

        // Build and send prompt to Gemini
        const prompt = buildForecastPrompt({
            sourcePoint,
            destination,
            travelDate,
            modeOfTravel,
            preference
        });

        const result = await model.generateContent(prompt);
        const rawResponse = result.response.text();

        // Format and log the response
        const formattedResponse = formatResponse(rawResponse);

        // Parse the response into structured sections
        const parsedResponse = parseResponse(rawResponse);

        res.json({
            success: true,
            data: {
                forecast: {
                    raw: rawResponse,
                    formatted: formattedResponse,
                    structured: parsedResponse
                },
                metadata: {
                    generated: new Date(),
                    source: "gemini-1.5-flash",
                    inputs: {
                        sourcePoint,
                        destination,
                        travelDate,
                        modeOfTravel,
                        preference
                    }
                }
            }
        });

    } catch (error) {
        console.error('Forecast Generation Error:', error);
        res.status(500).json({
            success: false,
            error: "Error generating forecast",
            message: error.message
        });
    }
};

module.exports = {
    generateForecast
};