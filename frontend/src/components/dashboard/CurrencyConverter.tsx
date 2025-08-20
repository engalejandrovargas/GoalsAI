import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, TrendingUp, TrendingDown, Star, StarOff, RefreshCw } from 'lucide-react';

interface ExchangeRate {
  currency: string;
  rate: number;
  change24h: number;
  symbol: string;
  flag: string;
}

interface CurrencyConverterProps {
  goalId: string;
}

const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ goalId }) => {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState('1000');
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [favorites, setFavorites] = useState<string[]>(['EUR', 'GBP', 'JPY']);
  const [isLoading, setIsLoading] = useState(false);

  // Mock exchange rates data
  const exchangeRates: ExchangeRate[] = [
    { currency: 'EUR', rate: 0.85, change24h: 0.12, symbol: '€', flag: '🇪🇺' },
    { currency: 'GBP', rate: 0.73, change24h: -0.08, symbol: '£', flag: '🇬🇧' },
    { currency: 'JPY', rate: 110.25, change24h: 0.45, symbol: '¥', flag: '🇯🇵' },
    { currency: 'CAD', rate: 1.25, change24h: 0.23, symbol: 'C$', flag: '🇨🇦' },
    { currency: 'AUD', rate: 1.35, change24h: -0.15, symbol: 'A$', flag: '🇦🇺' },
    { currency: 'CHF', rate: 0.92, change24h: 0.07, symbol: 'CHF', flag: '🇨🇭' },
    { currency: 'CNY', rate: 6.45, change24h: 0.18, symbol: '¥', flag: '🇨🇳' },
    { currency: 'INR', rate: 74.50, change24h: -0.32, symbol: '₹', flag: '🇮🇳' },
    { currency: 'KRW', rate: 1180.00, change24h: 0.89, symbol: '₩', flag: '🇰🇷' },
    { currency: 'MXN', rate: 18.20, change24h: -0.45, symbol: '$', flag: '🇲🇽' }
  ];

  const getCurrencyRate = (currency: string) => {
    if (currency === 'USD') return 1;
    return exchangeRates.find(rate => rate.currency === currency)?.rate || 1;
  };

  const getCurrencyData = (currency: string) => {
    if (currency === 'USD') return { currency: 'USD', rate: 1, change24h: 0, symbol: '$', flag: '🇺🇸' };
    return exchangeRates.find(rate => rate.currency === currency);
  };

  useEffect(() => {
    const fromRate = getCurrencyRate(fromCurrency);
    const toRate = getCurrencyRate(toCurrency);
    const result = (parseFloat(amount) || 0) * (toRate / fromRate);
    setConvertedAmount(result);
  }, [amount, fromCurrency, toCurrency]);

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const toggleFavorite = (currency: string) => {
    if (favorites.includes(currency)) {
      setFavorites(favorites.filter(fav => fav !== currency));
    } else {
      setFavorites([...favorites, currency]);
    }
  };

  const refreshRates = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const currencies = ['USD', ...exchangeRates.map(rate => rate.currency)];
  const popularPairs = [
    { from: 'USD', to: 'EUR' },
    { from: 'USD', to: 'GBP' },
    { from: 'USD', to: 'JPY' },
    { from: 'EUR', to: 'GBP' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-green-500 to-blue-600 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500 to-green-500 rounded-full translate-y-24 -translate-x-24"></div>
      </div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl shadow-lg">
            <ArrowRightLeft className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Currency Converter</h3>
            <p className="text-gray-600 dark:text-gray-400">Real-time exchange rates & conversion</p>
          </div>
        </div>
        <button
          onClick={refreshRates}
          disabled={isLoading}
          className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors disabled:opacity-50 shadow-lg"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Converter */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
          {/* From Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From
            </label>
            <div className="space-y-2">
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {currencies.map(currency => {
                  const data = getCurrencyData(currency);
                  return (
                    <option key={currency} value={currency}>
                      {data?.flag} {currency} {data?.symbol}
                    </option>
                  );
                })}
              </select>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg font-medium"
                placeholder="Enter amount"
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={swapCurrencies}
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>
          </div>

          {/* To Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              To
            </label>
            <div className="space-y-2">
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {currencies.map(currency => {
                  const data = getCurrencyData(currency);
                  return (
                    <option key={currency} value={currency}>
                      {data?.flag} {currency} {data?.symbol}
                    </option>
                  );
                })}
              </select>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                <p className="text-lg font-bold text-green-800 dark:text-green-300">
                  {getCurrencyData(toCurrency)?.symbol}{convertedAmount.toLocaleString('en-US', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Exchange Rate Info */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              1 {fromCurrency} = {(getCurrencyRate(toCurrency) / getCurrencyRate(fromCurrency)).toFixed(4)} {toCurrency}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Popular Pairs */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Popular Pairs</h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {popularPairs.map(pair => {
            const rate = getCurrencyRate(pair.to) / getCurrencyRate(pair.from);
            const change = getCurrencyData(pair.to)?.change24h || 0;
            
            return (
              <button
                key={`${pair.from}-${pair.to}`}
                onClick={() => {
                  setFromCurrency(pair.from);
                  setToCurrency(pair.to);
                }}
                className="p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-left"
              >
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {pair.from}/{pair.to}
                  </span>
                  {change !== 0 && (
                    change > 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-600" />
                    )
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {rate.toFixed(4)}
                </p>
                {change !== 0 && (
                  <p className={`text-xs ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {change > 0 ? '+' : ''}{change.toFixed(2)}%
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Favorites */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Favorite Currencies</h4>
        </div>
        <div className="space-y-2">
          {exchangeRates.slice(0, 6).map(rate => (
            <div key={rate.currency} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-lg">{rate.flag}</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {rate.currency} ({rate.symbol})
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      1 USD = {rate.rate.toFixed(2)} {rate.currency}
                    </span>
                    {rate.change24h !== 0 && (
                      <span className={`text-xs flex items-center gap-1 ${
                        rate.change24h > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {rate.change24h > 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {Math.abs(rate.change24h).toFixed(2)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => toggleFavorite(rate.currency)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                {favorites.includes(rate.currency) ? (
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                ) : (
                  <StarOff className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default CurrencyConverter;