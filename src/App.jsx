import { useState } from 'react';
import { Card, Title, Select, SelectItem } from "@tremor/react";
import TradingDashboard from './components/TradingDashboard';
import SymbolAnalysis from './components/SymbolAnalysis';

const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META'];

export default function App() {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');

  return (
    <div className="p-12">
      <Title>Trading Analysis Dashboard</Title>
      
      <Card className="mt-6">
        <div className="max-w-sm mx-auto">
          <Select 
            value={selectedSymbol} 
            onValueChange={setSelectedSymbol}
            placeholder="Select Stock Symbol"
          >
            {symbols.map((symbol) => (
              <SelectItem key={symbol} value={symbol}>
                {symbol}
              </SelectItem>
            ))}
          </Select>
        </div>
      </Card>

      <div className="mt-6">
        <SymbolAnalysis symbol={selectedSymbol} />
      </div>

      <div className="mt-6">
        <TradingDashboard symbol={selectedSymbol} />
      </div>
    </div>
  );
}