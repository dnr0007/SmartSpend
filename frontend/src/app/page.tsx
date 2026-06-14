'use client';

import { useState } from 'react';
import { Search, ShoppingCart, Bell, Tag, TrendingUp, Menu, X } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const quickActions = [
    { icon: ShoppingCart, label: 'Compare Grocery Cart', href: '/cart' },
    { icon: TrendingUp, label: 'Track Product Price', href: '/products' },
    { icon: Tag, label: 'Find Coupons', href: '/coupons' },
    { icon: Bell, label: 'View Alerts', href: '/alerts' },
  ];

  const todayDeals = [
    { id: 1, title: 'iPhone 15 128GB', originalPrice: 79900, dealPrice: 58999, platform: 'Flipkart', discount: 26 },
    { id: 2, title: 'Samsung Galaxy S24', originalPrice: 79999, dealPrice: 64999, platform: 'Amazon', discount: 19 },
    { id: 3, title: 'Sony WH-1000XM5', originalPrice: 29990, dealPrice: 21990, platform: 'Myntra', discount: 27 },
  ];

  const savingsSummary = {
    month: 'June 2024',
    totalSaved: 2450,
    grocerySaved: 890,
    ecommerceSaved: 1560,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary-600">
                SmartSpend AI
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/products" className="text-gray-700 hover:text-primary-600">Products</Link>
              <Link href="/cart" className="text-gray-700 hover:text-primary-600">Grocery Cart</Link>
              <Link href="/coupons" className="text-gray-700 hover:text-primary-600">Coupons</Link>
              <Link href="/alerts" className="text-gray-700 hover:text-primary-600">Alerts</Link>
              <Link href="/savings" className="text-gray-700 hover:text-primary-600">Savings</Link>
              <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
                Sign In
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-2 space-y-2">
              <Link href="/products" className="block py-2 text-gray-700">Products</Link>
              <Link href="/cart" className="block py-2 text-gray-700">Grocery Cart</Link>
              <Link href="/coupons" className="block py-2 text-gray-700">Coupons</Link>
              <Link href="/alerts" className="block py-2 text-gray-700">Alerts</Link>
              <Link href="/savings" className="block py-2 text-gray-700">Savings</Link>
              <button className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 mt-2">
                Sign In
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section with Search */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            India's AI-Powered Shopping Assistant
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Compare prices, track deals, discover coupons, and save money on every purchase
          </p>
          
          {/* Universal Search Bar */}
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products or paste a product URL..."
                className="w-full px-6 py-4 pl-14 text-lg border-2 border-gray-300 rounded-xl focus:border-primary-600 focus:outline-none transition-colors"
              />
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center"
            >
              <action.icon className="mx-auto mb-3 text-primary-600" size={32} />
              <h3 className="font-semibold text-gray-900">{action.label}</h3>
            </Link>
          ))}
        </div>

        {/* Savings Summary Card */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white mb-12">
          <h2 className="text-2xl font-bold mb-4">Your Savings This Month</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-primary-100">Total Saved</p>
              <p className="text-4xl font-bold">₹{savingsSummary.totalSaved.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-primary-100">Grocery Savings</p>
              <p className="text-2xl font-semibold">₹{savingsSummary.grocerySaved.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-primary-100">E-commerce Savings</p>
              <p className="text-2xl font-semibold">₹{savingsSummary.ecommerceSaved.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Today's Deals */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Today's Best Deals</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {todayDeals.map((deal) => (
              <div key={deal.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                      {deal.discount}% OFF
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{deal.platform}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{deal.title}</h3>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-primary-600">₹{deal.dealPrice.toLocaleString()}</span>
                    <span className="text-sm text-gray-500 line-through">₹{deal.originalPrice.toLocaleString()}</span>
                  </div>
                  <button className="w-full mt-4 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors">
                    View Deal
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendation Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-12">
          <div className="flex items-start space-x-4">
            <div className="bg-primary-100 p-3 rounded-lg">
              <TrendingUp className="text-primary-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Shopping Insight</h3>
              <p className="text-gray-600 mb-4">
                Electronics prices are currently 8% above their historical average. Wait for the upcoming sale season 
                if your purchase is not urgent. Grocery prices remain stable across platforms.
              </p>
              <div className="flex space-x-3">
                <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                  Set Price Alert
                </button>
                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">SmartSpend AI</h3>
              <p className="text-gray-400">
                India's AI-powered shopping assistant helping you save money on every purchase.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/products" className="hover:text-white">Products</Link></li>
                <li><Link href="/cart" className="hover:text-white">Grocery Cart</Link></li>
                <li><Link href="/coupons" className="hover:text-white">Coupons</Link></li>
                <li><Link href="/alerts" className="hover:text-white">Alerts</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Download Extension</h4>
              <p className="text-gray-400 mb-4">Get price history and deals directly in your browser.</p>
              <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors w-full">
                Chrome Extension
              </button>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SmartSpend AI. All rights reserved.</p>
            <p className="mt-2 text-sm">
              Prices, availability, and offers may change. Final amount determined at checkout on provider platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
