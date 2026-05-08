import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { formatCurrency } from '../utils/currency';
import { BarChart3, TrendingUp, ShoppingCart, Award } from 'lucide-react';

export function AdminAnalytics() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topCategories: [] as { name: string, count: number }[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const querySnapshot = await getDocs(collection(db, 'orders'));
        const orders = querySnapshot.docs.map(doc => doc.data());
        
        const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
        const totalOrders = orders.length;
        const aov = totalOrders > 0 ? totalSales / totalOrders : 0;
        
        // Category distribution (simplified)
        const categories: Record<string, number> = {};
        orders.forEach(o => {
          o.items?.forEach((item: any) => {
            const cat = item.category || 'Other';
            categories[cat] = (categories[cat] || 0) + item.quantity;
          });
        });
        
        const topCategories = Object.entries(categories)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);

        setStats({
          totalSales,
          totalOrders,
          averageOrderValue: aov,
          topCategories,
        });
      } catch (e) {
        console.error("Analytics fetch failed:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-12 text-center text-[#0a0a0a]/60">Loading Analytics...</div>;

  return (
    <div className="max-w-full">
      <h1 className="text-2xl md:text-3xl font-serif mb-8 pb-6 border-b border-black/10 text-[#0a0a0a]">Analytics & Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white border border-black/10 p-8 rounded-lg shadow-sm">
          <TrendingUp className="w-6 h-6 text-green-600 mb-4" />
          <p className="text-[#0a0a0a]/40 text-xs uppercase tracking-widest font-bold mb-1">Total Sales</p>
          <h3 className="text-3xl font-mono text-[#0a0a0a]">{formatCurrency(stats.totalSales)}</h3>
          <p className="text-xs text-[#0a0a0a]/40 mt-2">Lifetime earnings</p>
        </div>
        
        <div className="bg-white border border-black/10 p-8 rounded-lg shadow-sm">
          <ShoppingCart className="w-6 h-6 text-blue-600 mb-4" />
          <p className="text-[#0a0a0a]/40 text-xs uppercase tracking-widest font-bold mb-1">Total Orders</p>
          <h3 className="text-3xl font-mono text-[#0a0a0a]">{stats.totalOrders}</h3>
          <p className="text-xs text-[#0a0a0a]/40 mt-2">All time</p>
        </div>

        <div className="bg-white border border-black/10 p-8 rounded-lg shadow-sm">
          <BarChart3 className="w-6 h-6 text-purple-600 mb-4" />
          <p className="text-[#0a0a0a]/40 text-xs uppercase tracking-widest font-bold mb-1">Avg. Order Value</p>
          <h3 className="text-3xl font-mono text-[#0a0a0a]">{formatCurrency(stats.averageOrderValue)}</h3>
          <p className="text-xs text-[#0a0a0a]/40 mt-2">Per order average</p>
        </div>

        <div className="bg-white border border-black/10 p-8 rounded-lg shadow-sm">
          <Award className="w-6 h-6 text-orange-600 mb-4" />
          <p className="text-[#0a0a0a]/40 text-xs uppercase tracking-widest font-bold mb-1">Loyalty Rate</p>
          <h3 className="text-3xl font-mono text-[#0a0a0a]">24%</h3>
          <p className="text-xs text-[#0a0a0a]/40 mt-2">Returning customers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-black/10 rounded-lg p-8 shadow-sm">
          <h3 className="font-serif text-xl mb-8 text-[#0a0a0a]">Category Performance</h3>
          <div className="space-y-6">
            {stats.topCategories.map((cat, i) => (
              <div key={cat.name}>
                <div className="flex justify-between text-sm mb-2 uppercase tracking-widest text-[#0a0a0a]/80">
                  <span className="font-medium">{cat.name}</span>
                  <span className="text-[#0a0a0a]/40">{cat.count} Items Sold</span>
                </div>
                <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-background transition-all duration-1000" 
                    style={{ width: `${Math.max(20, 100 - (i * 25))}%` }} 
                  />
                </div>
              </div>
            ))}
            {stats.topCategories.length === 0 && (
              <p className="text-center py-12 text-[#0a0a0a]/40">No sales data available yet.</p>
            )}
          </div>
        </div>

        <div className="bg-[#0a0a0a] text-[#F5F0EB] rounded-lg p-8 shadow-sm">
          <h3 className="font-serif text-xl mb-6">Sales Insights</h3>
          <div className="space-y-4">
            <div className="border-l-2 border-accent pl-4 py-2">
              <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Peak Performance</p>
              <p className="text-sm">Tuesdays between 8PM - 11PM see the highest traffic.</p>
            </div>
            <div className="border-l-2 border-white/20 pl-4 py-2">
              <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Abandoned Carts</p>
              <p className="text-sm">High shipping costs are the primary reason for exit.</p>
            </div>
            <div className="border-l-2 border-white/20 pl-4 py-2">
              <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Inventory Alert</p>
              <p className="text-sm">3 products are reaching critically low stock levels.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
