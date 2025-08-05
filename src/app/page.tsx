'use client';

import { useState, useEffect } from 'react';
import { RecallItem } from '@/lib/rss-parser';
import Header from '@/components/Header';
import RecallCard from '@/components/RecallCard';
import SearchAndFilter from '@/components/SearchAndFilter';

export default function Home() {
  const [recalls, setRecalls] = useState<RecallItem[]>([]);
  const [filteredRecalls, setFilteredRecalls] = useState<RecallItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    fetchRecalls();
  }, []);

  const fetchRecalls = async () => {
    try {
      const response = await fetch('/api/recalls');
      const data = await response.json();
      setRecalls(data.recalls || []);
      setFilteredRecalls(data.recalls || []);
      setLastUpdated(data.lastUpdated);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recalls:', error);
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredRecalls(recalls);
      return;
    }
    
    const filtered = recalls.filter(recall =>
      recall.title.toLowerCase().includes(query.toLowerCase()) ||
      recall.description?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredRecalls(filtered);
  };

  const handleFilterBySource = (source: string) => {
    if (!source) {
      setFilteredRecalls(recalls);
      return;
    }
    
    const filtered = recalls.filter(recall => recall.source === source);
    setFilteredRecalls(filtered);
  };

  const handleFilterByCategory = (category: string) => {
    if (!category) {
      setFilteredRecalls(recalls);
      return;
    }
    
    const filtered = recalls.filter(recall => recall.category === category);
    setFilteredRecalls(filtered);
  };

  const sources = [...new Set(recalls.map(recall => recall.source))];
  const categories = [...new Set(recalls.map(recall => recall.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Product Recall Alerts
          </h1>
          <p className="text-gray-600">
            Stay informed about the latest product recalls from official U.S. government sources.
          </p>
        </div>

        <SearchAndFilter
          onSearch={handleSearch}
          onFilterBySource={handleFilterBySource}
          onFilterByCategory={handleFilterByCategory}
          sources={sources}
          categories={categories}
        />

        <div className="mb-6">
          <p className="text-sm text-gray-500">
            Showing {filteredRecalls.length} of {recalls.length} recalls
          </p>
        </div>

        {filteredRecalls.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.334A7.97 7.97 0 0012 5c-2.34 0-4.29 1.009-5.824 2.562M12 5c-2.34 0-4.29 1.009-5.824 2.562" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recalls found</h3>
            <p className="text-gray-500">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecalls.map((recall) => (
              <RecallCard key={recall.id} recall={recall} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
