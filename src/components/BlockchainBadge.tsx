import React from 'react';
import { Shield, ExternalLink } from 'lucide-react';
import { blockchainService } from '../lib/blockchainService';

interface Props {
  transactionId: string;
  verdict: string;
  timestamp: string;
}

const BlockchainBadge: React.FC<Props> = ({ transactionId, verdict, timestamp }) => {
  const handleViewOnBlockchain = () => {
    const explorerUrl = blockchainService.getExplorerUrl(transactionId);
    window.open(explorerUrl, '_blank');
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'valid':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'fake':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800';
      default:
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border text-xs font-medium ${getVerdictColor(verdict)}`}>
      <Shield className="h-3 w-3" />
      <span>Verified on Algorand</span>
      <button
        onClick={handleViewOnBlockchain}
        className="flex items-center space-x-1 hover:underline"
        title="View on blockchain"
      >
        <ExternalLink className="h-3 w-3" />
        <span className="hidden sm:inline">View Proof</span>
      </button>
    </div>
  );
};

export default BlockchainBadge;