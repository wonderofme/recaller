import { format } from 'date-fns';

interface RecallCardProps {
  id: string;
  title: string;
  description: string;
  source: string;
  date: string;
  link: string;
  productName?: string;
  manufacturer?: string;
  recallReason?: string;
}

export default function RecallCard({ 
  id, 
  title, 
  description, 
  source, 
  date, 
  link, 
  productName, 
  manufacturer, 
  recallReason 
}: RecallCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Unknown date';
    }
  };

  const getSourceColor = (source: string) => {
    const colors: { [key: string]: string } = {
      'FDA': 'bg-blue-100 text-blue-800 border-blue-200',
      'CPSC': 'bg-red-100 text-red-800 border-red-200',
      'NHTSA': 'bg-orange-100 text-orange-800 border-orange-200',
      'USDA': 'bg-green-100 text-green-800 border-green-200',
      'EPA': 'bg-green-100 text-green-800 border-green-200',
      'FTC': 'bg-purple-100 text-purple-800 border-purple-200',
      'DOT': 'bg-orange-100 text-orange-800 border-orange-200',
      'ATF': 'bg-red-100 text-red-800 border-red-200',
      'USCG': 'bg-blue-100 text-blue-800 border-blue-200',
      'Toyota': 'bg-red-100 text-red-800 border-red-200',
      'Honda': 'bg-red-100 text-red-800 border-red-200',
      'Ford': 'bg-blue-100 text-blue-800 border-blue-200',
      'General Motors': 'bg-blue-100 text-blue-800 border-blue-200',
      'Tesla': 'bg-red-100 text-red-800 border-red-200',
      'BMW': 'bg-blue-100 text-blue-800 border-blue-200',
      'Mercedes-Benz': 'bg-gray-100 text-gray-800 border-gray-200',
      'Apple': 'bg-gray-100 text-gray-800 border-gray-200',
      'Walmart': 'bg-blue-100 text-blue-800 border-blue-200',
      'Target': 'bg-red-100 text-red-800 border-red-200',
      'Amazon': 'bg-orange-100 text-orange-800 border-orange-200',
      'Home Depot': 'bg-orange-100 text-orange-800 border-orange-200',
      'Consumer Reports': 'bg-green-100 text-green-800 border-green-200',
      'Consumer Affairs': 'bg-purple-100 text-purple-800 border-purple-200',
      'Better Business Bureau': 'bg-blue-100 text-blue-800 border-blue-200',
      'Food Safety News': 'bg-green-100 text-green-800 border-green-200',
      'Test Feed 1': 'bg-purple-100 text-purple-800 border-purple-200',
      'Test Feed 2': 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return colors[source] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-red-600 transition-colors">
              {title}
            </h3>
            <div className="flex items-center space-x-3 mb-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getSourceColor(source)}`}>
                {source}
              </span>
              <span className="text-sm text-gray-500">
                {formatDate(date)}
              </span>
            </div>
          </div>
        </div>

        {/* Product Details */}
        {(productName || manufacturer || recallReason) && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border-l-4 border-red-500">
            {productName && (
              <div className="mb-2">
                <span className="text-sm font-medium text-gray-700">Product:</span>
                <span className="ml-2 text-sm text-gray-900 font-semibold">{productName}</span>
              </div>
            )}
            {manufacturer && (
              <div className="mb-2">
                <span className="text-sm font-medium text-gray-700">Manufacturer:</span>
                <span className="ml-2 text-sm text-gray-900 font-semibold">{manufacturer}</span>
              </div>
            )}
            {recallReason && (
              <div>
                <span className="text-sm font-medium text-gray-700">Reason:</span>
                <span className="ml-2 text-sm text-gray-900">{recallReason}</span>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
          {description}
        </p>

        {/* Action Button */}
        <div className="flex justify-between items-center">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            Read More
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          
          <div className="text-xs text-gray-400">
            ID: {id.slice(-8)}
          </div>
        </div>
      </div>
    </div>
  );
} 