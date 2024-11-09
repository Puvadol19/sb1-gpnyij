import fetch from 'node-fetch';
import { RSI, MACD, ROC } from 'technicalindicators';

export class TradingAnalyzer {
  async fetchMarketData(symbol) {
    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=demo`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || !data['Time Series (Daily)']) {
        throw new Error('Invalid data received from API');
      }
      
      return this.formatMarketData(data);
    } catch (error) {
      console.error(`Error fetching market data for ${symbol}:`, error);
      throw error;
    }
  }

  formatMarketData(data) {
    try {
      const timeSeries = data['Time Series (Daily)'];
      return Object.entries(timeSeries)
        .map(([date, values]) => ({
          date,
          close: parseFloat(values['4. close']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          open: parseFloat(values['1. open'])
        }))
        .filter(item => !Object.values(item).some(isNaN))
        .reverse();
    } catch (error) {
      console.error('Error formatting market data:', error);
      throw new Error('Failed to format market data');
    }
  }

  calculateIndicators(prices) {
    try {
      if (!Array.isArray(prices) || prices.length === 0) {
        throw new Error('Invalid price data for indicator calculation');
      }

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
    } catch (error) {
      console.error('Error calculating indicators:', error);
      throw error;
    }
  }

  calculateFibonacciLevels(high, low) {
    try {
      if (typeof high !== 'number' || typeof low !== 'number' || isNaN(high) || isNaN(low)) {
        throw new Error('Invalid high/low values for Fibonacci calculation');
      }

      const diff = high - low;
      const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
      
      return levels.map(level => ({
        level,
        price: parseFloat((high - (diff * level)).toFixed(2))
      }));
    } catch (error) {
      console.error('Error calculating Fibonacci levels:', error);
      throw error;
    }
  }
}