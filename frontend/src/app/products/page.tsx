'use client';

import { useState } from 'react';
import { Search, TrendingUp, Bell, ExternalLink, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatPrice, getDealScore } from '@/lib/utils';
import type { PriceHistory, AIRecommendation } from '@/types';

const mockPriceHistory: PriceHistory = {
  product_id: '1',
  platform: 'Amazon',
  history: [
    { date: '2024-01-01', price: 65999, mrp: 79900 },
    { date: '2024-02-01', price: 62999, mrp: 79900 },
    { date: '2024-03-01', price: 59999, mrp: 79900 },
    { date: '2024-04-01', price: 61999, mrp: 79900 },
    { date: '2024-05-01', price: 58999, mrp: 79900 },
    { date: '2024-06-01', price: 54499, mrp: 79900 },
    { date: '2024-06-15', price: 58999, mrp: 79900 },
  ],
  lowest_price: 54499,
  average_price: 60499,
  highest_price: 65999,
};

const mockRecommendation: AIRecommendation = {
  recommendation: 'wait',
  reason: 'This phone is currently 8% above its historical lowest price. Wait if the purchase is not urgent.',
  confidence: 85,
  deal_score: 'Good Deal',
  savings_potential: 4500,
};

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [productUrl, setProductUrl] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">E-commerce Price Tracker</h1>
          <p className="text-gray-600 mt-2">Compare prices, track history, and get AI recommendations</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Products</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Track Product URL</label>
              <div className="flex">
                <input
                  type="text"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder="Paste Amazon/Flipkart product URL..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button className="bg-primary-600 text-white px-6 py-3 rounded-r-lg hover:bg-primary-700 transition-colors">
                  Track
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Detail Example */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-start space-x-6">
            <img
              src="https://via.placeholder.com/300x300"
              alt="iPhone 15"
              className="w-48 h-48 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Apple iPhone 15 (128 GB) - Black</h2>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-primary-600">{formatPrice(58999)}</span>
                <span className="text-lg text-gray-500 line-through">{formatPrice(79900)}</span>
                <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                  26% OFF
                </span>
              </div>
              
              {/* Platform Comparison */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Available On</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { platform: 'Amazon', price: 58999, delivery: 'Free', inStock: true },
                    { platform: 'Flipkart', price: 59999, delivery: 'Free', inStock: true },
                    { platform: 'Myntra', price: 61999, delivery: '₹40', inStock: false },
                  ].map((item, index) => (
                    <div key={index} className={`border rounded-lg p-4 ${!item.inStock ? 'opacity-50' : ''}`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold">{item.platform}</span>
                        {item.inStock ? (
                          <span className="text-green-600 text-sm">In Stock</span>
                        ) : (
                          <span className="text-red-600 text-sm">Out of Stock</span>
                        )}
                      </div>
                      <div className="text-xl font-bold text-gray-900 mb-2">{formatPrice(item.price)}</div>
                      <div className="text-sm text-gray-600 mb-3">Delivery: {item.delivery}</div>
                      <button 
                        className={`w-full py-2 rounded-lg ${item.inStock ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                        disabled={!item.inStock}
                      >
                        {item.inStock ? 'View Deal' : 'Unavailable'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Recommendation */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">AI Recommendation: {mockRecommendation.recommendation === 'wait' ? 'Wait' : 'Buy Now'}</h3>
                    <p className="text-blue-800 text-sm mb-2">{mockRecommendation.reason}</p>
                    <div className="flex items-center space-x-4 text-xs text-blue-700">
                      <span>Confidence: {mockRecommendation.confidence}%</span>
                      <span>Potential Savings: {formatPrice(mockRecommendation.savings_potential || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price History Chart */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Price History (Last 6 Months)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockPriceHistory.history}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-IN', { month: 'short' })} />
                      <YAxis tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`} />
                      <Tooltip 
                        formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Price']}
                        labelFormatter={(label) => new Date(label).toLocaleDateString('en-IN')}
                      />
                      <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={2} dot={true} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Lowest Price</div>
                    <div className="text-lg font-bold text-green-600">{formatPrice(mockPriceHistory.lowest_price)}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Average Price</div>
                    <div className="text-lg font-bold text-gray-900">{formatPrice(mockPriceHistory.average_price)}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Highest Price</div>
                    <div className="text-lg font-bold text-red-600">{formatPrice(mockPriceHistory.highest_price)}</div>
                  </div>
                </div>
              </div>

              {/* Set Alert */}
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors">
                  <Bell size={20} />
                  <span>Set Price Alert</span>
                </button>
                <button className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
                  <ExternalLink size={20} />
                  <span>Go to Amazon</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Fake Discount Warning Example */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">Fake Discount Detection</h3>
              <p className="text-yellow-800 text-sm">
                This product shows a "26% OFF" discount, but our analysis reveals it has been selling near this price 
                for the last 30 days. The MRP may be inflated. Historical data suggests the real market price is 
                around ₹59,000-₹61,000.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
