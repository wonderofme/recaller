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
      recall.description?.toLowerCase().includes(query.toLowerCase()) ||
      recall.productName?.toLowerCase().includes(query.toLowerCase()) ||
      recall.manufacturer?.toLowerCase().includes(query.toLowerCase())
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Latest Product Recalls
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay informed about the latest product recalls from FDA, CPSC, NHTSA, USDA, EPA, FTC and major manufacturers. 
            Search recalls by product name, manufacturer, or safety issue.
          </p>
          <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {recalls.length} Active Recalls
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {sources.length} Sources
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Updated Daily
            </span>
          </div>
        </div>

        <SearchAndFilter
          onSearch={handleSearch}
          onFilterBySource={handleFilterBySource}
          onFilterByCategory={handleFilterByCategory}
          sources={sources}
          categories={categories}
        />

        {/* Results Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Showing {filteredRecalls.length} of {recalls.length} recalls
            </h2>
            {filteredRecalls.length !== recalls.length && (
              <button
                onClick={() => {
                  setFilteredRecalls(recalls);
                  // Reset search inputs
                  const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
                  if (searchInput) searchInput.value = '';
                  const sourceSelect = document.querySelector('select') as HTMLSelectElement;
                  if (sourceSelect) sourceSelect.value = '';
                  const categorySelect = document.querySelectorAll('select')[1] as HTMLSelectElement;
                  if (categorySelect) categorySelect.value = '';
                }}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>

          {filteredRecalls.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recalls found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecalls.map((recall) => (
                <RecallCard
                  key={recall.id}
                  id={recall.id}
                  title={recall.title}
                  description={recall.description || ''}
                  source={recall.source}
                  date={recall.date}
                  link={recall.link}
                  productName={recall.productName}
                  manufacturer={recall.manufacturer}
                  recallReason={recall.recallReason}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            Data sourced from official government agencies and manufacturer websites. 
            Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Loading...'}
          </p>
        </div>
      </main>
    </div>
  );
}
