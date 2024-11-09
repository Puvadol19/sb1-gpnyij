import fetch from 'node-fetch';
import { RSI, MACD, ROC } from 'technicalindicators';

const TELEGRAM_BOT_TOKEN = "6091872737:AAEVKKkq7lHM8WayJ2w2PNjfu72sBIrN0OM";
const TELEGRAM_CHAT_ID = "648117049";
const LOOKBACK = 100;

class TradingAnalyzer {
  async fetchMarketData(symbol) {
    try {
      // Example using Alpha Vantage API - replace with your preferred data source
      const response = await fetch(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=demo`
      );
      const data = await response.json();
      return this.formatMarketData(data);
    } catch (error) {
      console.error(`Error fetching market data for ${symbol}:`, error);
      return null;
    }
  }

  formatMarketData(data) {
    // Format the data based on your API response structure
    const timeSeries = data['Time Series (Daily)'];
    return Object.entries(timeSeries).map(([date, values]) => ({
      date,
      close: parseFloat(values['4. close']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      open: parseFloat(values['1. open'])
    })).reverse();
  }

  calculateIndicators(prices) {
    return {
      rsi: RSI.calculate({
        values: prices,
        period: 14
      }),
      macd: MACD.calculate({
        values: prices,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        SimpleMAOscillator: false,
        SimpleMASignal: false
      }),
      roc: ROC.calculate({
        values: prices,
        period: 14
      })
    };
  }

  calculateFibonacciLevels(high, low) {
    const diff = high - low;
    const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
    return levels.map(level => ({
      level,
      price: high - (diff * level)
    }));
  }

  async sendAnalysisToTelegram(symbol, analysis) {
    const message = this.formatAnalysisMessage(symbol, analysis);
    
    try {
      await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML'
          })
        }
      );
      console.log(`Analysis sent for ${symbol}`);
    } catch (error) {
      console.error(`Error sending analysis for ${symbol}:`, error);
    }
  }

  formatAnalysisMessage(symbol, analysis) {
    const {
      currentPrice,
      rsi,
      macd,
      roc,
      fibLevels,
      trend
    } = analysis;

    return `
<b>📊 ${symbol} Technical Analysis</b>
<b>Trend:</b> ${trend}
<b>Current Price:</b> ${currentPrice.toFixed(4)}

<b>Technical Indicators:</b>
RSI (14): ${rsi.toFixed(2)}
ROC (14): ${roc.toFixed(2)}%
MACD: ${macd.MACD.toFixed(4)}
Signal: ${macd.signal.toFixed(4)}
Histogram: ${macd.histogram.toFixed(4)}

<b>Fibonacci Levels:</b>
${fibLevels.map(fib => 
  `${(fib.level * 100).toFixed(1)}%: ${fib.price.toFixed(4)}`
).join('\n')}

<b>Signal Summary:</b>
${this.generateSignalSummary(analysis)}
    `.trim();
  }

  generateSignalSummary({ rsi, roc, macd }) {
    const signals = [];
    
    // RSI Analysis
    if (rsi > 70) signals.push('RSI indicates overbought conditions');
    else if (rsi < 30) signals.push('RSI indicates oversold conditions');
    
    // ROC Analysis
    if (roc > 0) signals.push('Positive momentum (ROC)');
    else signals.push('Negative momentum (ROC)');
    
    // MACD Analysis
    if (macd.histogram > 0 && macd.histogram > macd.signal) 
      signals.push('MACD indicates bullish momentum');
    else if (macd.histogram < 0 && macd.histogram < macd.signal)
      signals.push('MACD indicates bearish momentum');
    
    return signals.join('\n');
  }
}

async function main() {
  const analyzer = new TradingAnalyzer();
  const symbols = ['AAPL', 'MSFT', 'GOOGL']; // Add your symbols

  for (const symbol of symbols) {
    try {
      const marketData = await analyzer.fetchMarketData(symbol);
      if (!marketData) continue;

      const prices = marketData.map(candle => candle.close);
      const currentPrice = prices[prices.length - 1];
      
      const indicators = analyzer.calculateIndicators(prices);
      const high = Math.max(...prices);
      const low = Math.min(...prices);
      
      const analysis = {
        currentPrice,
        rsi: indicators.rsi[indicators.rsi.length - 1],
        macd: indicators.macd[indicators.macd.length - 1],
        roc: indicators.roc[indicators.roc.length - 1],
        fibLevels: analyzer.calculateFibonacciLevels(high, low),
        trend: indicators.roc[indicators.roc.length - 1] > 0 ? '📈 Uptrend' : '📉 Downtrend'
      };

      await analyzer.sendAnalysisToTelegram(symbol, analysis);
      
      // Add delay between processing symbols
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.error(`Error processing ${symbol}:`, error);
    }
  }
}

main().catch(console.error);