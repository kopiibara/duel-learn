import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';

interface HeaderProps {
    mode: string;
    material: {
        title: string;
    } | null;
    correct: number;
    incorrect: number;
}

export default function Header({ material, mode, correct, incorrect }: HeaderProps) {
    return (
        <header className="absolute top-0 left-0 w-full sm:px-8 md:px-16 lg:px-32 px-12 mt-5 py-12">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
                    <button className="text-gray-400 hover:text-white transition-colors"
                        style={{
                            border: "2px solid #6F658D",
                            borderRadius: "50%",
                            padding: "4px",
                            color: "#6F658D",
                        }}>
                        <ArrowBackIcon sx={{ fontSize: 24 }} />
                    </button>
                    <div className="flex flex-col">
                        <span className="text-[16px] sm:text-[18px] md:text-[20px] lg:text-[22px] font-semibold mb-1 text-white">
                            {mode} Mode - {material?.title || 'No Material Selected'}
                        </span>
                        <div className="flex items-center gap-4 text-[12px] sm:text-[14px] text-[#6F658D]">
                            <div>Correct {correct}</div>
                            <div>Incorrect {incorrect}</div>
                        </div>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-white transition-colors">
                    <SettingsIcon sx={{ fontSize: 24 }} />
                </button>
            </div>
        </header>
    )
}

