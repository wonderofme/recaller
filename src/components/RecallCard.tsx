import { RecallItem } from '@/lib/rss-parser';
import { format, parseISO } from 'date-fns';

interface RecallCardProps {
  recall: RecallItem & {
    productName?: string;
    recallReason?: string;
    manufacturer?: string;
  };
}

export default function RecallCard({ recall }: RecallCardProps) {
  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM dd, yyyy');
    } catch {
      return dateStr;
    }
  };

  const getSourceColor = (source: string) => {
    const colors: { [key: string]: string } = {
      'FDA': 'bg-blue-100 text-blue-800',
      'CPSC': 'bg-red-100 text-red-800',
      'NHTSA': 'bg-yellow-100 text-yellow-800',
      'USDA': 'bg-green-100 text-green-800',
      'EPA': 'bg-emerald-100 text-emerald-800',
      'FTC': 'bg-orange-100 text-orange-800',
      'Toyota': 'bg-red-100 text-red-800',
      'Honda': 'bg-blue-100 text-blue-800',
      'Ford': 'bg-blue-100 text-blue-800',
      'General Motors': 'bg-red-100 text-red-800',
      'Walmart': 'bg-blue-100 text-blue-800',
      'Target': 'bg-red-100 text-red-800',
      'Amazon': 'bg-orange-100 text-orange-800',
      'Home Depot': 'bg-orange-100 text-orange-800',
      'Consumer Reports': 'bg-purple-100 text-purple-800',
      'Consumer Affairs': 'bg-purple-100 text-purple-800',
      'Better Business Bureau': 'bg-blue-100 text-blue-800',
      'Food Safety News': 'bg-green-100 text-green-800',
      'DOT': 'bg-orange-100 text-orange-800',
      'ATF': 'bg-red-100 text-red-800',
      'USCG': 'bg-blue-100 text-blue-800',
      'Tesla': 'bg-red-100 text-red-800',
      'BMW': 'bg-blue-100 text-blue-800',
      'Mercedes-Benz': 'bg-gray-100 text-gray-800',
      'Apple': 'bg-gray-100 text-gray-800',
      'Test Feed 1': 'bg-purple-100 text-purple-800',
      'Test Feed 2': 'bg-indigo-100 text-indigo-800'
    };
    return colors[source] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSourceColor(recall.source)}`}>
            {recall.source}
          </span>
          <span className="text-sm text-gray-500">
            {formatDate(recall.date)}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {recall.title}
        </h3>
        
        {recall.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {recall.description}
          </p>
        )}
        
        {recall.productName && (
          <div className="mb-2">
            <span className="text-xs font-medium text-gray-500">Product:</span>
            <p className="text-sm text-gray-700">{recall.productName}</p>
          </div>
        )}
        
        {recall.manufacturer && (
          <div className="mb-2">
            <span className="text-xs font-medium text-gray-500">Manufacturer:</span>
            <p className="text-sm text-gray-700">{recall.manufacturer}</p>
          </div>
        )}
        
        {recall.recallReason && (
          <div className="mb-2">
            <span className="text-xs font-medium text-gray-500">Reason:</span>
            <p className="text-sm text-gray-700 line-clamp-2">{recall.recallReason}</p>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 capitalize">
            {recall.category}
          </span>
          <a
            href={recall.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Read More
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
} 