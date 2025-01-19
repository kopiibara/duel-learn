import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { School, Science, Code, MusicNote, History, Psychology, LocalLibrary, Group, Language, Gavel } from "@mui/icons-material";
import PersonalizationBG from "../../assets/UserOnboarding/PersonalizationBG.png";
import { useNavigate } from "react-router-dom";

// Define the type for subjects which includes both name and icon
interface Subject {
    name: string;
    icon: JSX.Element;
}

interface Topic {
    topic: string;
    subjects: Subject[];
}

const topics: Topic[] = [
    {
        topic: "STEM (Science, Technology, Engineering, Mathematics)",
        subjects: [
            { name: "Mathematics", icon: <School /> },
            { name: "Physics", icon: <Science /> },
            { name: "Biology", icon: <Science /> },
            { name: "Computer Science", icon: <Code /> },
            { name: "Chemistry", icon: <Science /> },
            { name: "Engineering", icon: <Code /> },
            { name: "Statistics", icon: <School /> },
            { name: "Astronomy", icon: <Science /> },
            { name: "Environmental Science", icon: <Science /> },
        ],
    },
    {
        topic: "Humanities and Social Sciences",
        subjects: [
            { name: "History", icon: <History /> },
            { name: "Psychology", icon: <Psychology /> },
            { name: "Philosophy", icon: <LocalLibrary /> },
            { name: "Sociology", icon: <Group /> },
            { name: "Political Science", icon: <School /> },
            { name: "Anthropology", icon: <Group /> },
            { name: "Geography", icon: <School /> },
            { name: "Economics", icon: <School /> },
            { name: "Linguistics", icon: <Language /> },
        ],
    },
    {
        topic: "Language and Literature",
        subjects: [
            { name: "English Literature", icon: <LocalLibrary /> },
            { name: "Linguistics", icon: <Language /> },
            { name: "Creative Writing", icon: <LocalLibrary /> },
            { name: "Poetry", icon: <LocalLibrary /> },
            { name: "Modern Languages", icon: <Language /> },
            { name: "Comparative Literature", icon: <LocalLibrary /> },
            { name: "Rhetoric", icon: <Language /> },
            { name: "Drama", icon: <LocalLibrary /> },
            { name: "Translation Studies", icon: <Language /> },
        ],
    },
    {
        topic: "Other Academic Fields",
        subjects: [
            { name: "Economics", icon: <School /> },
            { name: "Business Studies", icon: <School /> },
            { name: "Art", icon: <School /> },
            { name: "Music", icon: <MusicNote /> },
            { name: "Environmental Science", icon: <Science /> },
            { name: "Political Science", icon: <School /> },
            { name: "Astronomy", icon: <Science /> },
            { name: "Philosophy", icon: <LocalLibrary /> },
            { name: "Psychology", icon: <Psychology /> },
            { name: "Geography", icon: <School /> },
            { name: "Architecture", icon: <School /> },
            { name: "Law", icon: <Gavel /> },
            { name: "Sociology", icon: <Group /> },
            { name: "Linguistics", icon: <Language /> },
            { name: "Anthropology", icon: <Group /> },
            { name: "Engineering", icon: <Code /> },
        ],
    },
];


const Personalization: React.FC = () => {
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Preload the background image
        const img = new Image();
        img.src = PersonalizationBG;

        img.onload = () => {
            setTimeout(() => {
                setIsLoaded(true);
                setImageLoaded(true);
                document.body.style.overflow = "auto"; // Re-enable scrolling
            }, 1000); // Delay the loading screen for smooth transition
        };

        img.onerror = () => {
            console.error("Failed to load background image.");
            setTimeout(() => {
                setIsLoaded(true);
                setImageLoaded(true);
                document.body.style.overflow = "auto"; // Re-enable scrolling
            }, 2000);
        };

        // Disable scrolling during loading
        document.body.style.overflow = "hidden";
    }, []);

    const handleClickDone = () => {
        alert(`Selected topics: ${selectedSubjects.join(", ")}`);
        navigate("/dashboard/home");
      };

    const handleSubjectClick = (subject: string) => {
        if (selectedSubjects.includes(subject)) {
            setSelectedSubjects(selectedSubjects.filter((s) => s !== subject));
        } else {
            setSelectedSubjects([...selectedSubjects, subject]);
        }
    };

    if (!isLoaded) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    width: "100%",
                    backgroundColor: "#080511", // Dark background for loading
                }}
            >
                {/* Loading Spinner */}
                <div
                    style={{
                        border: "8px solid rgba(255, 255, 255, 0.2)", // Light gray border
                        borderTop: "8px solid #FFFFFF", // White border for spinning effect
                        borderRadius: "50%",
                        width: "50px",
                        height: "50px",
                        animation: "spin 1s linear infinite", // Spinner animation
                    }}
                ></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white p-6 flex flex-col items-center relative">
            {/* Independent container for the background image */}
            <img
                src={imageLoaded ? PersonalizationBG : ''}  // Only set the source once the image is loaded
                alt="Personalization Background"
                style={{
                    position: 'absolute',
                    top: '0',
                    left: '50%',
                    transform: 'translateX(-50%)', // Center the image horizontally
                    width: '100%', // Make the width of the image span the entire width of the viewport
                    height: 'auto', // Maintain aspect ratio
                    zIndex: -1, // Ensure it's behind the content
                }}
            />

            <div className="mt-8 mr-20 flex justify-end w-full gap-4">
                {/* Skip Button */}
                <Button
                    sx={{
                        textTransform: "capitalize",
                        color: "#7F6F8B",
                        "&:hover": {
                            color: "white",
                        },
                    }}
                >
                    Skip
                </Button>

                {/* Conditionally render Done Button based on the selected subjects */}
                {selectedSubjects.length > 0 && (
                    <Button
                        sx={{
                            textTransform: "capitalize",
                            backgroundColor: "#4D18E8",
                            color: "white",
                            "&:hover": {
                                backgroundColor: "#7B3FFF", // Lighter purple on hover
                                color: "white",
                            },
                        }}
                        variant="contained"
                        onClick={() => handleClickDone()}
                    >
                        Done
                    </Button>
                )}

            </div>

            <div className="w-28 h-28 rounded bg-white mb-6 mt-36"></div>
            <h1 className="text-2xl font-bold mb-2">Your Magical Journey Starts Here!</h1>
            <p className="text-md mb-20 text-center text-[#786d99]">
                Select topics to open the gates to a world of personalized discovery.
            </p>

            <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
                {topics.map((category, index) => (
                    <div key={index} className="mb-16">
                        <h2 className="text-lg font-semibold mb-7">{category.topic}</h2>
                        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-5 justify-center">
                            {category.subjects.map((subject, idx) => (
                                <button
                                    key={idx}
                                    className={`p-4 border rounded-lg transition-all h-[204px] w-[209px] ${selectedSubjects.includes(subject.name)
                                        ? "bg-[#A28CE2] border-indigo-400 font-bold text-[#322168]"
                                        : "bg-white text-[#322168] font-bold hover:bg-gray-200"
                                        }`}
                                    onClick={() => handleSubjectClick(subject.name)}
                                >
                                    <div className="flex flex-col items-center">
                                        {subject.icon}
                                        <span className="mt-2">{subject.name}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Personalization;
