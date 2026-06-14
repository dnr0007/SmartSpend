'use client';

import { useState } from 'react';
import { Plus, Minus, ShoppingCart, Clock, IndianRupee, CheckCircle, XCircle, Zap } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { CartItem, CartComparison } from '@/types';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { id: '1', product_id: 'milk-1', quantity: 2, preferred_brand: 'Amul' },
    { id: '2', product_id: 'bread-1', quantity: 1, preferred_brand: 'Britannia' },
    { id: '3', product_id: 'eggs-1', quantity: 1, preferred_pack_size: '12 pack' },
    { id: '4', product_id: 'rice-1', quantity: 1, preferred_brand: 'India Gate' },
  ]);

  const [selectedPlatform, setSelectedPlatform] = useState('zepto');

  const cartComparisons: CartComparison[] = [
    { platform: 'Zepto', item_total: 742, delivery_fee: 0, platform_fee: 5, handling_fee: 0, coupon_discount: 0, final_total: 747, eta_minutes: 11, available_item_count: 4, missing_item_count: 0 },
    { platform: 'Blinkit', item_total: 781, delivery_fee: 0, platform_fee: 6, handling_fee: 0, coupon_discount: 0, final_total: 787, eta_minutes: 9, available_item_count: 4, missing_item_count: 0 },
    { platform: 'Instamart', item_total: 769, delivery_fee: 30, platform_fee: 0, handling_fee: 0, coupon_discount: 20, final_total: 779, eta_minutes: 17, available_item_count: 4, missing_item_count: 0 },
    { platform: 'BigBasket', item_total: 755, delivery_fee: 0, platform_fee: 0, handling_fee: 10, coupon_discount: 0, final_total: 765, eta_minutes: 22, available_item_count: 4, missing_item_count: 0 },
  ];

  const bestDeal = cartComparisons.reduce((prev, curr) => prev.final_total < curr.final_total ? prev : curr);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Quick Commerce Cart Comparison</h1>
          <p className="text-gray-600 mt-2">Compare your grocery cart across multiple platforms</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Cart</h2>
              
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div className="flex items-center space-x-4">
                      <img src={`https://via.placeholder.com/80x80`} alt="Product" className="w-20 h-20 object-cover rounded-lg" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Product {index + 1}</h3>
                        <p className="text-sm text-gray-600">{item.preferred_brand || item.preferred_pack_size}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center border rounded-lg">
                        <button 
                          onClick={() => setCartItems(cartItems.filter(i => i.id !== item.id))}
                          className="px-3 py-1 hover:bg-gray-100"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-4 py-1">{item.quantity}</span>
                        <button 
                          onClick={() => {
                            setCartItems(cartItems.map(i => i.id === item.id ? {...i, quantity: i.quantity + 1} : i));
                          }}
                          className="px-3 py-1 hover:bg-gray-100"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <button 
                        onClick={() => setCartItems(cartItems.filter(i => i.id !== item.id))}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-6 border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-600 hover:border-primary-600 hover:text-primary-600 transition-colors flex items-center justify-center space-x-2">
                <Plus size={20} />
                <span>Add More Items</span>
              </button>
            </div>

            {/* Platform Comparison Table */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Comparison</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Platform</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Item Total</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Delivery Fee</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Platform Fee</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Final Price</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">ETA</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartComparisons.map((comparison, index) => (
                      <tr 
                        key={index} 
                        className={`border-b hover:bg-gray-50 cursor-pointer ${selectedPlatform === comparison.platform.toLowerCase() ? 'bg-blue-50' : ''}`}
                        onClick={() => setSelectedPlatform(comparison.platform.toLowerCase())}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">{comparison.platform}</span>
                            {comparison.platform === bestDeal.platform && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Cheapest</span>
                            )}
                          </div>
                        </td>
                        <td className="text-right py-4 px-4">{formatPrice(comparison.item_total)}</td>
                        <td className="text-right py-4 px-4">
                          {comparison.delivery_fee === 0 ? (
                            <span className="text-green-600">Free</span>
                          ) : (
                            formatPrice(comparison.delivery_fee)
                          )}
                        </td>
                        <td className="text-right py-4 px-4">
                          {comparison.platform_fee === 0 ? (
                            <span className="text-green-600">None</span>
                          ) : (
                            formatPrice(comparison.platform_fee)
                          )}
                        </td>
                        <td className="text-right py-4 px-4">
                          <span className="text-lg font-bold text-gray-900">{formatPrice(comparison.final_total)}</span>
                        </td>
                        <td className="text-center py-4 px-4">
                          <div className="flex items-center justify-center space-x-1">
                            <Clock size={16} className="text-gray-400" />
                            <span>{comparison.eta_minutes} min</span>
                          </div>
                        </td>
                        <td className="text-center py-4 px-4">
                          <button 
                            className={`px-4 py-2 rounded-lg ${selectedPlatform === comparison.platform.toLowerCase() ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                          >
                            Select
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Summary & AI Recommendation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Total Items</span>
                  <span>{cartItems.length}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Average Item Total</span>
                  <span>{formatPrice(Math.round(cartComparisons.reduce((sum, c) => sum + c.item_total, 0) / cartComparisons.length))}</span>
                </div>
              </div>

              {/* AI Recommendation */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-4 mb-6 text-white">
                <div className="flex items-start space-x-3">
                  <Zap className="flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold mb-1">AI Recommendation</h3>
                    <p className="text-sm text-primary-100 mb-2">
                      Choose <strong>{bestDeal.platform}</strong> for the lowest price at {formatPrice(bestDeal.final_total)}.
                      {bestDeal.eta_minutes && `${bestDeal.eta_minutes} minutes delivery time.`}
                    </p>
                    <p className="text-xs text-primary-200">
                      Saves you {formatPrice(cartComparisons.reduce((max, c) => Math.max(max, c.final_total), 0) - bestDeal.final_total)} compared to other platforms
                    </p>
                  </div>
                </div>
              </div>

              {/* Availability Status */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Availability</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle size={16} className="text-green-600" />
                    <span>All items available on selected platform</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <XCircle size={16} className="text-red-600" />
                    <span>No missing items</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                  <ShoppingCart size={20} />
                  <span>Open {bestDeal.platform} App</span>
                </button>
                <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                  Save Cart
                </button>
                <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                  Set Price Alert
                </button>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-gray-500 mt-4 text-center">
                Prices and availability may change. Final amount determined at checkout.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
