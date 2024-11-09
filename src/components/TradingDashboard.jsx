import { useEffect, useState } from 'react';
import { Card, Title, AreaChart, Text } from "@tremor/react";

export default function TradingDashboard({ symbol }) {
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`http://localhost:3000/api/analysis/${symbol}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.historicalData || !Array.isArray(data.historicalData)) {
          throw new Error('Invalid data format received');
        }
        
        const formattedData = data.historicalData.map(item => ({
          date: new Date(item.date).toLocaleDateString(),
          Price: parseFloat(item.close.toFixed(2))
        }));
        
        setChartData(formattedData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchData();
    }
  }, [symbol]);

  if (loading) {
    return (
      <Card>
        <Title>Price History</Title>
        <div className="h-72 flex items-center justify-center">
          <Text>Loading chart data...</Text>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Title>Price History</Title>
        <div className="h-72 flex items-center justify-center">
          <Text color="red">Error loading chart: {error}</Text>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Title>Price History - {symbol}</Title>
      {chartData.length > 0 ? (
        <AreaChart
          className="h-72 mt-4"
          data={chartData}
          index="date"
          categories={["Price"]}
          colors={["blue"]}
          yAxisWidth={60}
          showLegend={false}
        />
      ) : (
        <div className="h-72 flex items-center justify-center">
          <Text>No data available for {symbol}</Text>
        </div>
      )}
    </Card>
  );
}