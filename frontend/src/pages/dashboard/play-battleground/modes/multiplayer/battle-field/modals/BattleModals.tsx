import { EmojiEvents, CancelOutlined } from '@mui/icons-material';

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewReport: () => void;
  isVictory: boolean;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  onClose,
  onViewReport,
  isVictory
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className={`w-[400px] rounded-2xl p-8 flex flex-col items-center ${
        isVictory ? 'bg-[#1a1f2e] border-2 border-purple-500/20' : 'bg-[#1a1f2e] border-2 border-red-500/20'
      }`}>
        {/* Icon */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
          isVictory ? 'bg-purple-900/50' : 'bg-red-900/50'
        }`}>
          {isVictory ? (
            <EmojiEvents className="w-8 h-8 text-purple-400" />
          ) : (
            <CancelOutlined className="w-8 h-8 text-red-400" />
          )}
        </div>

        {/* Title */}
        <h2 className={`text-3xl font-bold mb-2 ${
          isVictory ? 'text-purple-400' : 'text-red-400'
        }`}>
          {isVictory ? 'Victory!' : 'Defeat!'}
        </h2>

        {/* Message */}
        <p className="text-white text-lg mb-8">
          {isVictory ? 'You Won!' : 'You Lost!'}
        </p>

        {/* Buttons */}
        <button
          onClick={onViewReport}
          className={`w-full py-3 rounded-lg mb-3 flex items-center justify-center gap-2 ${
            isVictory 
              ? 'bg-purple-600 hover:bg-purple-700 text-white' 
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          View Session Report
        </button>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-lg bg-[#2C2C2C] hover:bg-[#3C3C3C] text-white flex items-center justify-center gap-2"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};
