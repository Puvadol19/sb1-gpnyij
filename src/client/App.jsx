import { useState } from 'react';
import { Card, Title, Text, TabList, Tab, TabGroup, TabPanels, TabPanel } from "@tremor/react";
import SymbolAnalysis from './components/SymbolAnalysis';
import TradingDashboard from './components/TradingDashboard';

const SYMBOLS = ['AAPL', 'MSFT', 'GOOGL'];

export default function App() {
  const [selectedSymbol, setSelectedSymbol] = useState(SYMBOLS[0]);

  return (
    <main className="p-12">
      <Title>Trading Bot Dashboard</Title>
      <Text>Real-time market analysis and trading signals</Text>

      <TabGroup className="mt-6">
        <TabList>
          {SYMBOLS.map((symbol) => (
            <Tab key={symbol} onClick={() => setSelectedSymbol(symbol)}>
              {symbol}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          <TabPanel>
            <div className="mt-6">
              <Card>
                <SymbolAnalysis symbol={selectedSymbol} />
              </Card>
              <div className="mt-6">
                <TradingDashboard symbol={selectedSymbol} />
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  );
}