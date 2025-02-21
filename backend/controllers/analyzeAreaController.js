require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const RouteOccurrence = require('../models/RouteOccurence'); // Missing import added

const analyzeAreaController = (() => {
    // API key validation and initialization
    const validateApiKey = () => {
        const apiKey = process.env.GOOGLE_GEMINI;
        if (!apiKey) {
            throw new Error('GOOGLE_GEMINI API key is missing in environment variables');
        }
        return apiKey;
    };

    // Initialize Google Generative AI with error handling
    const initializeGenAI = () => {
        try {
            const apiKey = validateApiKey();
            return new GoogleGenerativeAI(apiKey);
        } catch (error) {
            console.error('Failed to initialize Google Generative AI:', error);
            throw error;
        }
    };

    const genAI = initializeGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // --- Helper Functions ---
    const safeJsonParse = (text) => {
        try {
            const cleanText = text.replace(/```(json)?|```/gi, '').trim();
            return JSON.parse(cleanText);
        } catch (error) {
            console.error('JSON parsing error:', error, 'Original text:', text);
            return null;
        }
    };

    // Prompts (as functions for clarity and reusability)
    const generateCrimePrompt = (source, destination, date) => {
        return `Generate 3-5 realistic crime reports that happened between ${source} roads to ${destination} crimes based on roads and on ${date}.  
Return ONLY a JSON array. No other text. No backticks. No "json" prefix. Adhere strictly to this format:

[
  {
    "crimeType": "string (e.g., Theft, Vandalism, Assault, Burglary, Traffic Violation)",
    "description": "string (Detailed, specific description. Include details like street names, vehicle descriptions, etc.)",
    "date": "string (ISO date string for ${date})",
    "time": "string (24-hour format, HH:MM)",
    "severity": "number (1-5, 1 = low, 5 = high)",
    "source": "string (e.g., 'Local Police Department', 'Neighborhood Watch')",
    "status": "string (Active, Resolved, Under Investigation)"
  }
]`;
    };

    const generateIncidentPrompt = (source, destination, date) => {
        return `Generate 3-4 realistic non-crime incident reports based on road incidents between ${source} roads to ${destination} that harmed travellers on ${date}.
Return ONLY a JSON array. No other text. No backticks. No "json" prefix. Adhere strictly to this format:

[
  {
    "incidentType": "string (e.g., Traffic Accident, Power Outage, Water Main Break, Fire, Medical Emergency, Lost Animal, Noise Complaint)",
    "description": "string (Detailed, specific description. Include address or intersection if relevant.)",
    "date": "string (ISO date string for ${date})",
    "status": "string (Ongoing, Resolved, Under Control)",
    "severity": "number (1-5, 1 being minimal impact, 5 being major impact)",
    "source": "string (e.g., 'City Services', 'Emergency Dispatch', 'Utility Company')",
    "reportedBy": "string"
  }
]`;
    };

    const generateWeatherPrompt = (source, destination, date) => {
        return `Generate 2-3 realistic weather alerts between ${source} roads to ${destination} that travellers faced while driving on ${date}.
Return ONLY a JSON array. No other text. No backticks. No "json" prefix. Adhere strictly to this format:

[
  {
    "alertType": "string (e.g., Thunderstorm Warning, Flood Advisory, Heat Advisory, Winter Storm Watch, High Wind Warning)",
    "description": "string (Detailed description of weather conditions and potential impacts/hazards.)",
    "severity": "string (Minor, Moderate, Severe, Extreme)",
    "startTime": "string (ISO date string for a time on ${date})",
    "endTime": "string (ISO date string; end time within 48 hours of start time)",
    "source": "string (e.g., 'National Weather Service', 'Local Meteorological Agency')",
    "issuedBy": "string"
  }
]`;
    };

    const getGeminiResponse = async (prompt, retries = 3) => {
        for (let i = 0; i <= retries; i++) {
            try {
                // Check if model is properly initialized before each attempt
                if (!model) throw new Error('Gemini model not initialized properly');
                
                const result = await model.generateContent(prompt);
                const responseText = result.response.text();
                const response = safeJsonParse(responseText);

                if (response) {
                    return response;
                }
            } catch (error) {
                console.error(`Attempt ${i + 1} failed:`, error);
                
                // Special handling for API key errors
                if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key not valid')) {
                    console.error('❌ API KEY ERROR: The Google Gemini API key appears to be invalid');
                    throw new Error('Invalid Google Gemini API key. Please check your environment variables and ensure the key is correct.');
                }
                
                if (i === retries) throw error;
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
            }
        }
        throw new Error('Max retries reached. Could not get a valid response from Gemini.');
    };

    // --- Save RouteOccurrences ---
    const saveRouteOccurrences = async (source, destination, date, crimeData, incidentData, weatherData) => {
        const occurrences = {
            crimes: crimeData.map(crime => ({
                crimeType: crime.crimeType,
                description: crime.description,
                date: new Date(crime.date),
                time: crime.time,
                severity: crime.severity,
                source: crime.source,
                status: crime.status
            })),
            incidents: incidentData.map(incident => ({
                incidentType: incident.incidentType,
                description: incident.description,
                date: new Date(incident.date),
                status: incident.status,
                severity: incident.severity,
                source: incident.source,
                reportedBy: incident.reportedBy
            })),
            weather: weatherData.map(alert => ({
                alertType: alert.alertType,
                description: alert.description,
                severity: alert.severity,
                startTime: new Date(alert.startTime),
                endTime: new Date(alert.endTime),
                source: alert.source,
                issuedBy: alert.issuedBy
            }))
        };

        const newRouteOccurrence = new RouteOccurrence({
            source: source,
            destination: destination,
            date: new Date(date),
            occurrences: occurrences
        });
        return await newRouteOccurrence.save();
    };

    // --- Main Controller Function ---
    const getDataFromGemini = async (req, res) => {
        try {
            // Verify API key is available before proceeding
            validateApiKey();
            const { source, destination, date } = req.params;
            const userId = req.user?.id || '657f4f204c7c7b894def2c89'; // Default user ID

            // Input Validation
            if (!source || !destination || !date) {
                return res.status(400).json({ error: 'Missing required parameters.' });
            }
            try {
                new Date(date).toISOString(); // Check for valid date
            } catch {
                return res.status(400).json({ error: 'Invalid date format.' });
            }

            // Create all prompts
            const crimePrompt = generateCrimePrompt(source, destination, date); // Fixed missing destination parameter
            const incidentPrompt = generateIncidentPrompt(source, destination, date); // Fixed missing destination parameter
            const weatherPrompt = generateWeatherPrompt(source, destination, date); // Fixed missing destination parameter
            
            // Get Gemini data (all in parallel)
            const [crimeData, incidentData, weatherData] = await Promise.all([
                getGeminiResponse(crimePrompt),
                getGeminiResponse(incidentPrompt),
                getGeminiResponse(weatherPrompt)
            ]);

            // Check for null responses (Gemini failure)
            if (!crimeData || !incidentData || !weatherData) {
                return res.status(500).json({ error: 'Failed to retrieve data from Gemini for one or more categories.' });
            }
            
            // Save data using the correct function
            const savedRouteOccurrence = await saveRouteOccurrences(source, destination, date, crimeData, incidentData, weatherData);

            res.status(200).json(savedRouteOccurrence);
        } catch (error) {
            console.error('Error in getDataFromGemini:', error);
            
            // Provide more specific error messages for common API issues
            if (error.message?.includes('API key')) {
                return res.status(500).json({
                    error: 'API Configuration Error',
                    message: 'There is an issue with the Google Gemini API key configuration. Please check your environment variables.',
                    details: error.message
                });
            }
            
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    };

    return {
        getDataFromGemini // Return the public methods from the controller
    };
})();

module.exports = analyzeAreaController;