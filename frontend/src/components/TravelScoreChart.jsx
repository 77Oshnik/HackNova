import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { TrendingUp, Loader2, AlertTriangle, Car, CloudRain } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Label } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { toast } from "sonner";
import ChatAssistant from "./ChatAssistant";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Define colors for pie charts
const pieChartColors = [
  "#FF6384", // Red
  "#36A2EB", // Blue
  "#FFCE56", // Yellow
  "#4BC0C0", // Teal
  "#9966FF", // Purple
];

const generatePrompt = (start, end) => {
  return `As a travel expert, analyze traveling from ${start} to ${end}. Provide 3 sets of data separated by '###':

1. With respect to ${end}, which month is best to travel cost-wise, festival-wise, climate-wise, etc.? Rate each month for travel suitability (0-100) use your knowledge to figure out which month is how much suitable. Respond with just 12 numbers separated by commas.

2. Estimate tourist demographics from last year. strictly Provide realistic and non-rounded numbers that do not look suspicious if ${end} is a city the value will be high if its a state the value will be a bit higher. Respond with just 2 numbers separated by commas: Indian tourists, Foreign tourists.

3. Estimate visitor demographics by category.strictly Provide realistic and non-rounded numbers that do not look suspicious if ${end} is a city the value will be high if its a state the value will be a bit higher. Respond with just 3 numbers separated by commas: Children, Male adults, Female adults.

Format: [monthly scores] ### [tourist types] ### [visitor categories]
Example: 42,78,65,90,83,67,96,72,88,49,70,61 ### 15234,8123 ### 5123,10234,8123`;
};

export function TravelScoreChart() {
  const [searchParams] = useSearchParams();
  const { user } = useUser();
  const source = searchParams.get("source");
  const destination = searchParams.get("destination");
  const date = searchParams.get("date");
  
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState([]);
  const [touristTypes, setTouristTypes] = useState([]);
  const [visitorTypes, setVisitorTypes] = useState([]);
  const [safetyData, setSafetyData] = useState(null);

  const processGeminiResponse = (response) => {
    const [monthlyScores, tourists, visitors] = response.split('###').map(str => str.trim());
    
    const monthScores = monthlyScores.split(',').map((num, index) => ({
      month: months[index],
      score: Math.min(Math.max(parseInt(num), 0), 100)
    }));

    const [indian, foreign] = tourists.split(',').map(num => parseInt(num.trim()));
    const touristData = [
      { name: "Indian Tourists", value: indian, fill: pieChartColors[0] },
      { name: "Foreign Tourists", value: foreign, fill: pieChartColors[1] }
    ];

    const [children, male, female] = visitors.split(',').map(num => parseInt(num.trim()));
    const visitorData = [
      { name: "Children", value: children, fill: pieChartColors[2] },
      { name: "Male Adults", value: male, fill: pieChartColors[3] },
      { name: "Female Adults", value: female, fill: pieChartColors[4] }
    ];

    return { monthScores, touristData, visitorData };
  };

  useEffect(() => {
    const fetchAllData = async () => {
      if (!source || !destination || !date || !user) {
        toast({
          title: "Missing parameters",
          description: "Source, destination, and date are required.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      try {
        const [travelResponse, safetyResponse] = await Promise.all([
          fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': import.meta.env.VITE_GEMINI_API_KEY || '',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: generatePrompt(source, destination)
                }]
              }]
            })
          }),
          fetch(`http://localhost:5000/api/analyzeArea/${user.id}/${source}/${destination}/${date}`)
        ]);

        const travelData = await travelResponse.json();
        const safetyData = await safetyResponse.json();

        const textResponse = travelData.candidates[0].content.parts[0].text;
        const { monthScores, touristData, visitorData } = processGeminiResponse(textResponse);
        
        setScores(monthScores);
        setTouristTypes(touristData);
        setVisitorTypes(visitorData);
        setSafetyData(safetyData.savedRouteOccurrence);

        toast({
          title: "Analysis complete!",
          description: "Travel and safety data has been analyzed and visualized.",
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error analyzing data",
          description: "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [source, destination, date, user]);

  const getBestMonth = () => {
    if (scores.length === 0) return null;
    return scores.reduce((max, current) => 
      current.score > max.score ? current : max
    );
  };

  const totalTourists = useMemo(() => {
    return touristTypes.reduce((acc, curr) => acc + curr.value, 0);
  }, [touristTypes]);

  const totalVisitors = useMemo(() => {
    return visitorTypes.reduce((acc, curr) => acc + curr.value, 0);
  }, [visitorTypes]);

  const bestMonth = getBestMonth();

  if (loading) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardContent className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Travel Analysis: {source} to {destination}</CardTitle>
          <CardDescription>
            Analyzing the best time to visit and tourist demographics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {scores.length > 0 && (
            <div className="flex flex-col gap-6">
              <div className="h-[300px] w-full">
                <BarChart
                  width={800}
                  height={300}
                  data={scores}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  className="w-full"
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(value) => value.slice(0, 3)}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="score" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} barSize={30} />
                </BarChart>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-[300px] flex items-center justify-center">
                  <PieChart width={300} height={300}>
                    <Pie
                      data={touristTypes}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                    >
                      <Label
                        content={({ viewBox }) => (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-xl font-bold"
                            >
                              {totalTourists.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy + 20}
                              className="fill-muted-foreground text-sm"
                            >
                              Total Tourists
                            </tspan>
                          </text>
                        )}
                      />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </div>

                <div className="h-[300px] flex items-center justify-center">
                  <PieChart width={300} height={300}>
                    <Pie
                      data={visitorTypes}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                    >
                      <Label
                        content={({ viewBox }) => (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-xl font-bold"
                            >
                              {totalVisitors.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy + 20}
                              className="fill-muted-foreground text-sm"
                            >
                              Visitor Types
                            </tspan>
                          </text>
                        )}
                      />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        {bestMonth && (
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              Best time to travel: {bestMonth.month} (Score: {bestMonth.score})
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              Based on weather, costs, crowds, and local events
            </div>
          </CardFooter>
        )}
      </Card>

      {safetyData?.occurrences && (
        <div className="w-full max-w-6xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold">Safety Analysis</h2>
          
          {safetyData.occurrences.crimes?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Recent Crime Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {safetyData.occurrences.crimes.map((crime) => (
                    <Alert key={crime._id} variant={crime.severity >= 4 ? "destructive" : "default"}>
                      <AlertTitle className="flex items-center gap-2">
                        {crime.crimeType} - {crime.time}
                        <span className="text-sm text-muted-foreground">
                          Severity: {crime.severity}/5
                        </span>
                      </AlertTitle>
                      <AlertDescription>{crime.description}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {safetyData.occurrences.incidents?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Traffic & Road Incidents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {safetyData.occurrences.incidents.map((incident) => (
                    <Alert key={incident._id} variant={incident.severity >= 4 ? "destructive" : "default"}>
                      <AlertTitle className="flex items-center gap-2">
                        {incident.incidentType}
                        <span className="text-sm text-muted-foreground">
                          Status: {incident.status}
                        </span>
                      </AlertTitle>
                      <AlertDescription>{incident.description}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {safetyData.occurrences.weather?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CloudRain className="h-5 w-5" />
                  Weather Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {safetyData.occurrences.weather.map((alert) => (
                    <Alert key={alert._id}>
                      <AlertTitle>{alert.alertType} - Severity: {alert.severity}</AlertTitle>
                      <AlertDescription>{alert.description}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default TravelScoreChart;