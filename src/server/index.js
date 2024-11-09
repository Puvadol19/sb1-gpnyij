import express from 'express';
import cors from 'cors';
import { TradingAnalyzer } from './tradingAnalyzer.js';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const analyzer = new TradingAnalyzer();

app.get('/api/analysis/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol || typeof symbol !== 'string') {
      return res.status(400).json({ error: 'Invalid symbol provided' });
    }

    const marketData = await analyzer.fetchMarketData(symbol);
    
    if (!marketData || !Array.isArray(marketData) || marketData.length === 0) {
      return res.status(404).json({ error: 'Market data not found' });
    }

    const prices = marketData.map(candle => candle.close);
    const currentPrice = prices[prices.length - 1];
    
    const indicators = analyzer.calculateIndicators(prices);
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    
    const analysis = {
      symbol,
      currentPrice,
      rsi: indicators.rsi[indicators.rsi.length - 1],
      macd: {
        value: indicators.macd[indicators.macd.length - 1].MACD,
        signal: indicators.macd[indicators.macd.length - 1].signal,
        histogram: indicators.macd[indicators.macd.length - 1].histogram
      },
      roc: indicators.roc[indicators.roc.length - 1],
      fibLevels: analyzer.calculateFibonacciLevels(high, low),
      trend: indicators.roc[indicators.roc.length - 1] > 0 ? '📈 Uptrend' : '📉 Downtrend',
      historicalData: marketData
    };

    res.json(analysis);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});