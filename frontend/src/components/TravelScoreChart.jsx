import { useState, useMemo } from "react";
import { TrendingUp, Loader2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Label } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState([]);
  const [touristTypes, setTouristTypes] = useState([]);
  const [visitorTypes, setVisitorTypes] = useState([]);

  const processGeminiResponse = (response) => {
    const [monthlyScores, tourists, visitors] = response.split('###').map(str => str.trim());
    
    // Process monthly scores
    const monthScores = monthlyScores.split(',').map((num, index) => ({
      month: months[index],
      score: Math.min(Math.max(parseInt(num), 0), 100)
    }));

    // Process tourist types
    const [indian, foreign] = tourists.split(',').map(num => parseInt(num.trim()));
    const touristData = [
      { name: "Indian Tourists", value: indian, fill: pieChartColors[0] },
      { name: "Foreign Tourists", value: foreign, fill: pieChartColors[1] }
    ];

    // Process visitor types
    const [children, male, female] = visitors.split(',').map(num => parseInt(num.trim()));
    const visitorData = [
      { name: "Children", value: children, fill: pieChartColors[2] },
      { name: "Male Adults", value: male, fill: pieChartColors[3] },
      { name: "Female Adults", value: female, fill: pieChartColors[4] }
    ];

    return { monthScores, touristData, visitorData };
  };

  const getRecommendations = async () => {
    if (!startLocation || !endLocation) {
      toast({
        title: "Please enter both locations",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': import.meta.env.VITE_GEMINI_API_KEY || '',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: generatePrompt(startLocation, endLocation)
            }]
          }]
        })
      });

      const data = await response.json();
      const textResponse = data.candidates[0].content.parts[0].text;
      const { monthScores, touristData, visitorData } = processGeminiResponse(textResponse);
      
      setScores(monthScores);
      setTouristTypes(touristData);
      setVisitorTypes(visitorData);

      toast({
        title: "Analysis complete!",
        description: "Travel data has been analyzed and visualized.",
      });
    } catch (error) {
      toast({
        title: "Error analyzing travel data",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <ChatAssistant />
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Travel Score Analysis</CardTitle>
        <CardDescription>
          Enter your travel locations to analyze the best time to visit and tourist demographics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Starting Location"
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <Input
              placeholder="Destination"
              value={endLocation}
              onChange={(e) => setEndLocation(e.target.value)}
              className="w-full"
            />
          </div>
          <Button
            onClick={getRecommendations}
            disabled={loading || !startLocation || !endLocation}
            className="min-w-[120px]"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Analyze"
            )}
          </Button>
        </div>

        {scores.length > 0 && (
          <div className="flex flex-col gap-6">
            {/* Bar Chart at the Top */}
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

            {/* Pie Charts Below */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tourist Types Pie Chart */}
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

              {/* Visitor Types Pie Chart */}
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
  );
}

export default TravelScoreChart;