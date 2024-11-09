import { useEffect, useState } from 'react';
import { Card, Metric, Text, Flex, Grid } from "@tremor/react";

export default function SymbolAnalysis({ symbol }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/analysis/${symbol}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid data format received');
        }
        
        setAnalysis(data);
      } catch (err) {
        console.error('Error fetching analysis:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [symbol]);

  if (loading) {
    return (
      <Card>
        <Text>Loading analysis...</Text>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Text color="red">Error: {error}</Text>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <Text>No data available for {symbol}</Text>
      </Card>
    );
  }

  return (
    <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
      <Card>
        <Text>Current Price</Text>
        <Metric>{analysis.currentPrice?.toFixed(2) || 'N/A'}</Metric>
        <Text>{analysis.trend || 'Unknown'}</Text>
      </Card>
      <Card>
        <Text>Technical Indicators</Text>
        <Flex className="mt-4">
          <div>
            <Text>RSI (14)</Text>
            <Metric>{analysis.rsi?.toFixed(2) || 'N/A'}</Metric>
          </div>
          <div>
            <Text>ROC (14)</Text>
            <Metric>{analysis.roc?.toFixed(2) || 'N/A'}%</Metric>
          </div>
        </Flex>
      </Card>
      <Card>
        <Text>MACD</Text>
        <Flex className="mt-4">
          <div>
            <Text>Signal</Text>
            <Metric>{analysis.macd?.signal?.toFixed(4) || 'N/A'}</Metric>
          </div>
          <div>
            <Text>Histogram</Text>
            <Metric>{analysis.macd?.histogram?.toFixed(4) || 'N/A'}</Metric>
          </div>
        </Flex>
      </Card>
    </Grid>
  );
}