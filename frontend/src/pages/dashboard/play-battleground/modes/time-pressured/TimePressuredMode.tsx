import React, { useState, useEffect, useCallback, useRef } from "react";
import { useGameLogic } from "../../hooks/useGameLogic";
import FlashCard from "../../components/common/FlashCard";
import Header from "../../components/common/Header";
import Timer from "../../components/common/Timer";
import axios from "axios";
import "./../../styles/setupques.css";
import { useAudio } from "../../../../../contexts/AudioContext";
import { nanoid } from "nanoid";
import { useUser } from "../../../../../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { GeneralLoadingScreen } from "../../../../../components/LoadingScreen";
import DocumentHead from "../../../../../components/DocumentHead";

interface TimePressuredModeProps {
  mode: string;
  material: any;
  selectedTypes: string[];
  timeLimit?: number;
}

interface SessionReportResponse {
  success: boolean;
  message: string;
  sessionId?: string;
  error?: string;
}

interface SessionData {
  correctCount: number;
  incorrectCount: number;
  highestStreak: number;
  earnedXP: number;
  timeSpent: string;
}

interface SessionPayload {
  session_id: string;
  study_material_id: string;
  title: string;
  summary: string;
  session_by_user_id: string;
  session_by_username: string;
  status: string;
  ends_at: string;
  exp_gained: number;
  coins_gained: number | null;
  game_mode: string | null;
  total_time: string;
  mastered: number;
  unmastered: number;
}

const TimePressuredMode: React.FC<TimePressuredModeProps> = ({
  mode,
  material,
  selectedTypes,
  timeLimit,
}) => {
  // 1. First, declare all hooks at the top
  const navigate = useNavigate(); // Move useNavigate to the top with other hooks
  const { user } = useUser();
  const {
    playCorrectAnswerSound,
    playIncorrectAnswerSound,
    playTimePressuredAudio,
    pauseAudio,
  } = useAudio();

  // 2. Then declare all useState hooks
  const [isGeneratingAI, setIsGeneratingAI] = useState(true);
  const [aiQuestions, setAiQuestions] = useState<any[]>([]);
  const [sessionId] = useState(nanoid());
  const [hasSessionSaved, setHasSessionSaved] = useState(false);
  const [isGameEndedByUser, setIsGameEndedByUser] = useState(false);
  const [startTime] = useState(new Date());
  const [inputAnswer, setInputAnswer] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGameReady, setIsGameReady] = useState(false);
  const [isCurrentAnswerCorrect, setIsCurrentAnswerCorrect] = useState<
    boolean | null
  >(null);

  // 3. Then useRef declarations
  const previousTimerRef = React.useRef<number | null>(null);

  // Add audio refs
  const backgroundMusicRef = useRef<HTMLAudioElement>(null);
  const speedUpMusicRef = useRef<HTMLAudioElement>(null);
  const correctAnswerSoundRef = useRef<HTMLAudioElement>(null);
  const incorrectAnswerSoundRef = useRef<HTMLAudioElement>(null);
  const sessionIncompleteRef = useRef<HTMLAudioElement>(null);
  const sessionCompleteRef = useRef<HTMLAudioElement>(null);

  // Add volume control state
  const [masterVolume, setMasterVolume] = useState(() => {
    const savedSettings = localStorage.getItem("duel-learn-audio-settings");
    if (savedSettings) {
      const { master } = JSON.parse(savedSettings);
      return master || 100;
    }
    return 100;
  });

  const [musicVolume, setMusicVolume] = useState(() => {
    const savedSettings = localStorage.getItem("duel-learn-audio-settings");
    if (savedSettings) {
      const { music } = JSON.parse(savedSettings);
      return music || 100;
    }
    return 100;
  });

  const [soundEffectsVolume, setSoundEffectsVolume] = useState(() => {
    const savedSettings = localStorage.getItem("duel-learn-audio-settings");
    if (savedSettings) {
      const { effects } = JSON.parse(savedSettings);
      return effects || 100;
    }
    return 100;
  });

  // 4. Fix whitespace and case sensitivity
  const normalizedMode = String(mode).trim();

  // 5. Game logic hook
  const {
    currentQuestion = {},
    isFlipped = false,
    handleFlip = () => {},
    handleAnswerSubmit: originalHandleAnswerSubmit = () => {},
    correctCount = 0,
    incorrectCount = 0,
    showResult = false,
    showNextButton = false,
    handleNextQuestion: originalHandleNextQuestion = () => {},
    getButtonStyle = () => "",
    questionTimer = null,
    timerProgress = 100,
    currentStreak = 0,
    highestStreak = 0,
    masteredCount = 0,
    unmasteredCount = 0,
    handleRevealAnswer = () => {},
    cardDisabled = false,
  } = useGameLogic({
    mode,
    material,
    selectedTypes,
    timeLimit,
    aiQuestions,
    isGameReady,
  }) || {};

  // 6. Helper functions (move these outside useEffect)
  const calculateExpGained = useCallback(
    (isComplete: boolean, totalItems: number): number => {
      if (!isComplete) {
        return 0; // Always return 0 for incomplete sessions
      }
      return Math.floor(totalItems / 10) * 5;
    },
    []
  );

  const calculateTimeSpent = useCallback((start: Date, end: Date) => {
    const diff = Math.floor((end.getTime() - start.getTime()) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }, []);

  // 7. useEffect hooks
  useEffect(() => {
    if (normalizedMode === "Time Pressured") {
      pauseAudio();
      playTimePressuredAudio(30);
    }
    return () => {
      pauseAudio();
    };
  }, [normalizedMode, pauseAudio, playTimePressuredAudio]);

  useEffect(() => {
    const generateAIQuestions = async () => {
      // Skip if we already have questions
      if (aiQuestions.length > 0) {
        setIsGeneratingAI(false);
        return;
      }

      try {
        setIsGeneratingAI(true);
        console.log("Starting AI question generation in TimePressuredMode");
        console.log("Selected question types:", selectedTypes);
        console.log("Mode received:", mode);
        console.log("Study material ID:", material.study_material_id);

        // Add debugging to inspect the material structure
        console.log("Material structure:", {
          id: material.id,
          study_material_id: material.study_material_id,
          title: material.title,
          itemsCount: material.items?.length || 0,
        });

        // Log the first few items to check for item_id
        if (material.items && material.items.length > 0) {
          console.log("First 3 items raw data:", material.items.slice(0, 3));
        }

        // Clear existing questions with explicit game mode
        const clearEndpoint = `${
          import.meta.env.VITE_BACKEND_URL
        }/api/openai/clear-questions/${material.study_material_id}`;
        let clearSuccess = false;

        try {
          console.log("Attempting to clear time-pressured questions...");
          const clearResponse = await axios.delete<{
            success: boolean;
            error?: string;
          }>(clearEndpoint, {
            params: { gameMode: "time-pressured" },
          });

          if (!clearResponse.data.success) {
            console.warn(
              "Failed to clear existing questions:",
              clearResponse.data.error
            );
            // We'll continue without clearing
          } else {
            console.log("Successfully cleared time-pressured questions");
            clearSuccess = true;
          }
        } catch (clearError) {
          console.warn("Error clearing existing questions:", clearError);
          // Continue with question generation despite the error
        }

        // If we couldn't clear questions, we'll use REPLACE INTO in the API endpoints
        if (!clearSuccess) {
          console.log(
            "Will rely on REPLACE INTO statements in API endpoints to handle duplicates"
          );
        }

        // Create an array of items with proper IDs and image handling
        const items = [...material.items].map((item, index) => {
          // Use the original item_id if available, otherwise fallback to the sequential ID
          const itemNumber = index + 1;
          const hasImage = item.image && item.image.startsWith("data:image");

          return {
            ...item,
            id: item.item_id || item.id || itemNumber,
            item_id: item.item_id || item.id || itemNumber,
            item_number: itemNumber, // Keep item_number as sequential for display purposes
            term: item.term,
            definition: item.definition,
            // Only include image URL if the item has an image
            ...(hasImage
              ? {
                  image: `${
                    import.meta.env.VITE_BACKEND_URL
                  }/api/study-material/image/${itemNumber}`,
                }
              : {
                  image: null,
                }),
          };
        });

        // Log the first few items to verify the data structure
        console.log(
          "First few items with full data:",
          items.slice(0, 3).map((item) => ({
            item_id: item.item_id,
            item_number: item.item_number,
            term: item.term,
            definition: item.definition,
            image: item.image,
          }))
        );

        const shuffledItems = items.sort(() => Math.random() - 0.5);
        const totalItems = items.length;
        const typesCount = selectedTypes.length;

        // Validate selected types
        const validTypes = ["identification", "multiple-choice", "true-false"];
        selectedTypes.forEach((type) => {
          if (!validTypes.includes(type)) {
            console.warn(`Warning: Unknown question type "${type}"`);
          }
        });

        const distribution = selectedTypes.reduce((acc, type, index) => {
          // For the last type, assign all remaining items
          if (index === typesCount - 1) {
            acc[type] =
              totalItems -
              Object.values(acc).reduce((sum, val) => sum + val, 0);
          } else {
            // Otherwise, distribute items evenly with a minimum of 1
            acc[type] = Math.max(1, Math.floor(totalItems / typesCount));
          }
          return acc;
        }, {} as Record<string, number>);

        console.log("Question distribution for", totalItems, "items:");
        Object.entries(distribution).forEach(([type, count]) => {
          console.log(`- ${type}: ${count} questions`);
        });

        // Validate total matches number of items
        const totalQuestions = Object.values(distribution).reduce(
          (sum, count) => sum + count,
          0
        );
        console.log(
          `Total questions to generate: ${totalQuestions} (should equal number of items: ${totalItems})`
        );

        // Keep track of which items have been used
        let currentItemIndex = 0;

        // Generate questions according to the distribution
        const generatedQuestions = [];
        for (const type of selectedTypes) {
          const questionsOfThisType = distribution[type];
          console.log(
            `\nGenerating ${questionsOfThisType} questions of type "${type}":`
          );

          for (let i = 0; i < questionsOfThisType; i++) {
            const item = shuffledItems[currentItemIndex];

            // For identification type, create question directly without AI
            if (type === "identification") {
              const directQuestion = {
                question: item.definition,
                answer: item.term,
                correctAnswer: item.term,
                questionType: "identification",
                type: "identification",
                item_id: item.item_id,
                item_number: item.item_number,
                itemInfo: {
                  term: item.term,
                  definition: item.definition,
                  itemId: item.item_id,
                  itemNumber: item.item_number,
                  studyMaterialId: material.study_material_id,
                  image:
                    item.image && item.image.startsWith("data:image")
                      ? item.image
                      : null,
                },
              };
              generatedQuestions.push(directQuestion);
              console.log(
                `✓ Created direct identification question for "${item.term}"`
              );
              currentItemIndex++;
              continue; // Skip AI generation for identification questions
            }

            console.log("Processing item:", {
              item_id: item.item_id,
              item_number: item.item_number,
              term: item.term,
              definition: item.definition,
              image: item.image,
              originalItemId: material.items[currentItemIndex].item_id,
              materialItemsStructure: typeof material.items[currentItemIndex],
            });

            // Rest of the existing code for other question types
            const endpoint = `${
              import.meta.env.VITE_BACKEND_URL
            }/api/openai/generate-${type}`;
            const requestPayload = {
              term: item.term,
              definition: item.definition,
              numberOfItems: 1,
              studyMaterialId: material.study_material_id,
              itemId: item.item_id,
              itemNumber: item.item_number,
              gameMode: "time-pressured",
              timestamp: new Date().getTime(),
              // Add additional context to help AI generate better questions
              context: {
                termAndDefinition: `${item.term} - ${item.definition}`,
                requireBothTermAndDefinition: true,
                questionGuidelines: {
                  trueOrFalse: [
                    "Create statements that test understanding of both term and its definition",
                    "Include false statements that mix up relationships between terms and definitions",
                    "Ensure statements reference both the term and its meaning",
                  ],
                  multipleChoice: [
                    "Include options that test both term recognition and definition understanding",
                    "Create distractors that relate to both term and definition",
                    "Ensure question text references both the concept and its explanation",
                  ],
                },
              },
            };

            try {
              const response = await axios.post<any[]>(
                endpoint,
                requestPayload
              );

              if (
                response.data &&
                Array.isArray(response.data) &&
                response.data.length > 0
              ) {
                const questionsWithItemInfo = response.data.map((q) => ({
                  ...q,
                  item_id: item.item_id,
                  item_number: item.item_number,
                  itemInfo: {
                    term: item.term,
                    definition: item.definition,
                    itemId: item.item_id,
                    itemNumber: item.item_number,
                    // Only include image if it exists
                    ...(item.image ? { image: item.image } : {}),
                  },
                }));

                // Add debug logging
                console.log("Created question with full data:", {
                  question: questionsWithItemInfo[0],
                  hasImage: !!questionsWithItemInfo[0].itemInfo?.image,
                  imageUrl: questionsWithItemInfo[0].itemInfo?.image,
                  fullItem: item,
                });

                generatedQuestions.push(...questionsWithItemInfo);
                console.log(
                  `✓ Successfully generated ${type} question for "${item.term}" with definition "${item.definition}"`
                );
              }
            } catch (error) {
              console.error(`Error generating ${type} question:`, error);
            }

            currentItemIndex++;
          }
        }

        // When setting the AI questions state
        const finalQuestions = generatedQuestions.map((q) => ({
          ...q,
          // Ensure itemInfo is preserved
          itemInfo: {
            ...q.itemInfo,
            image: q.itemInfo?.image || null,
          },
        }));

        console.log(
          "Final questions before setting state:",
          finalQuestions.map((q) => ({
            question: q.question,
            answer: q.answer,
            hasImage: !!q.itemInfo?.image,
            imageUrl: q.itemInfo?.image,
          }))
        );

        setAiQuestions(finalQuestions);
        // Set game ready to true after questions are generated
        setIsGameReady(true);
      } catch (error) {
        console.error("Error in question generation process:", error);
        setAiQuestions([]);
      } finally {
        setIsGeneratingAI(false);
      }
    };

    generateAIQuestions();
  }, [material?.study_material_id, selectedTypes, mode]);

  useEffect(() => {
    if (questionTimer !== null) {
      const isSpeedUpThreshold = questionTimer <= 5;
      const shouldUpdateAudio =
        (isSpeedUpThreshold && (previousTimerRef.current ?? Infinity) > 5) ||
        (!isSpeedUpThreshold && (previousTimerRef.current ?? 0) <= 5) ||
        previousTimerRef.current === null;

      if (shouldUpdateAudio) {
        playTimePressuredAudio(questionTimer);
      }
      previousTimerRef.current = questionTimer;
    }
  }, [questionTimer, playTimePressuredAudio]);

  useEffect(() => {
    const saveSession = async () => {
      if (
        correctCount + incorrectCount === aiQuestions.length &&
        aiQuestions.length > 0 &&
        !hasSessionSaved
      ) {
        const sessionData: SessionData = {
          correctCount,
          incorrectCount,
          highestStreak,
          earnedXP: calculateExpGained(true, material?.items?.length || 0),
          timeSpent: calculateTimeSpent(startTime, new Date()),
        };

        try {
          await saveSessionReport(sessionData, true);
        } catch (error) {
          console.error("Failed to save completed session:", error);
        }
      }
    };

    saveSession();
  }, [
    correctCount,
    incorrectCount,
    aiQuestions.length,
    highestStreak,
    hasSessionSaved,
  ]);

  // Initialize and manage audio
  useEffect(() => {
    // Configure audio elements
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.src = "/sounds-sfx/time-pressured-mode.mp3";
      backgroundMusicRef.current.loop = true;
      const actualMusicVolume = (musicVolume / 100) * (masterVolume / 100);
      backgroundMusicRef.current.volume = actualMusicVolume;
    }

    if (speedUpMusicRef.current) {
      speedUpMusicRef.current.src = "/sounds-sfx/time-pressured-speed-up.mp3";
      speedUpMusicRef.current.loop = true;
      const actualMusicVolume = (musicVolume / 100) * (masterVolume / 100);
      speedUpMusicRef.current.volume = actualMusicVolume;
    }

    const soundEffects = [
      { ref: correctAnswerSoundRef, src: "/sounds-sfx/right-answer.mp3" },
      { ref: incorrectAnswerSoundRef, src: "/sounds-sfx/wrong-answer.mp3" },
      { ref: sessionIncompleteRef, src: "/sounds-sfx/session-incomplete.wav" },
      {
        ref: sessionCompleteRef,
        src: "/sounds-sfx/session_report_completed.mp3",
      },
    ];

    // Configure sound effects
    soundEffects.forEach(({ ref, src }) => {
      if (ref.current) {
        ref.current.src = src;
        const actualVolume = (soundEffectsVolume / 100) * (masterVolume / 100);
        ref.current.volume = actualVolume;
      }
    });

    // Start playing background music
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.play().catch((error) => {
        console.log("Audio autoplay was prevented:", error);
      });
    }

    // Cleanup function
    return () => {
      const allRefs = [
        backgroundMusicRef,
        speedUpMusicRef,
        correctAnswerSoundRef,
        incorrectAnswerSoundRef,
        sessionIncompleteRef,
        sessionCompleteRef,
      ];

      allRefs.forEach((ref) => {
        if (ref.current) {
          ref.current.pause();
          ref.current.currentTime = 0;
        }
      });
    };
  }, [masterVolume, musicVolume, soundEffectsVolume]);

  // Handle speed-up music based on timer
  useEffect(() => {
    if (questionTimer !== null) {
      const isSpeedUpThreshold = questionTimer <= 5;

      if (isSpeedUpThreshold) {
        // Switch to speed-up music
        if (backgroundMusicRef.current) {
          backgroundMusicRef.current.pause();
        }
        if (speedUpMusicRef.current) {
          speedUpMusicRef.current.play().catch(console.error);
        }
      } else {
        // Switch back to normal music
        if (speedUpMusicRef.current) {
          speedUpMusicRef.current.pause();
          speedUpMusicRef.current.currentTime = 0;
        }
        if (backgroundMusicRef.current) {
          backgroundMusicRef.current.play().catch(console.error);
        }
      }
    }
  }, [questionTimer]);

  // Update handleAnswerSubmit to play sounds
  const handleAnswerSubmit = (answer: string) => {
    let isAnswerCorrect = false;

    if (!currentQuestion) {
      console.error("Missing question:", currentQuestion);
      return;
    }

    // Get correct answer - with fallbacks
    let correctAnswer = currentQuestion.correctAnswer || currentQuestion.answer;

    // Handle special case for multiple-choice: correctAnswer might be in format "A. term"
    if (
      currentQuestion.questionType === "multiple-choice" &&
      typeof correctAnswer === "string" &&
      correctAnswer.includes(". ")
    ) {
      // Extract just the term part after the letter
      const answerParts = correctAnswer.split(". ");
      if (answerParts.length > 1) {
        correctAnswer = answerParts.slice(1).join(". ").trim();
        console.log(
          `Using extracted multiple-choice answer: "${correctAnswer}"`
        );
      }
    }

    // Multi-stage fallback for correct answer
    if (!correctAnswer && currentQuestion.itemInfo?.term) {
      correctAnswer = currentQuestion.itemInfo.term;
      console.log(`Using term as fallback answer: "${correctAnswer}"`);
    }

    if (!correctAnswer) {
      console.error("No correct answer found for question:", currentQuestion);
      return;
    }

    // Safe string conversion and comparison
    const answerString = String(answer || "")
      .toLowerCase()
      .trim();
    const correctAnswerString = String(correctAnswer || "")
      .toLowerCase()
      .trim();

    console.log(
      `Comparing answer "${answerString}" with correct answer "${correctAnswerString}"`
    );
    isAnswerCorrect = answerString === correctAnswerString;

    // Update isCorrect property directly
    if (currentQuestion) {
      currentQuestion.isCorrect = isAnswerCorrect;
    }

    // Play appropriate sound
    if (isAnswerCorrect && correctAnswerSoundRef.current) {
      correctAnswerSoundRef.current.play();
    } else if (!isAnswerCorrect && incorrectAnswerSoundRef.current) {
      incorrectAnswerSoundRef.current.play();
    }

    // Call the original handler
    originalHandleAnswerSubmit(answer);
    setIsCurrentAnswerCorrect(isAnswerCorrect);
  };

  // Create a wrapper for handleNextQuestion that also clears the input
  const handleNextQuestion = () => {
    setInputAnswer(""); // Clear the input
    originalHandleNextQuestion(); // Call the original handler
  };

  // Show loading screen while generating questions
  if (isGeneratingAI) {
    return (
      <GeneralLoadingScreen
        text="Generating Questions"
        mode="Time Pressured Mode"
        isLoading={isGeneratingAI}
      />
    );
  }

  // Show loading screen if we don't have questions yet
  if (aiQuestions.length === 0) {
    return (
      <GeneralLoadingScreen
        text="Preparing Challenge"
        mode="Time Pressured Mode"
        isLoading={true}
      />
    );
  }

  const renderQuestionContent = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.questionType) {
      case "multiple-choice":
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-[1000px] mx-auto">
            {currentQuestion.options &&
            typeof currentQuestion.options === "object"
              ? // Handle options as an object (like {A: "option1", B: "option2"})
                Object.entries(currentQuestion.options).map(
                  ([key, value], index) => {
                    // Convert numeric index to letter
                    const letter = String.fromCharCode(65 + index); // 65 is ASCII for 'A'
                    return (
                      <button
                        key={letter}
                        onClick={() => handleAnswerSubmit(value as string)}
                        disabled={showResult}
                        className={`h-[100px] w-full bg-transparent 
                        ${getButtonStyle(value as string)}
                        rounded-lg text-white hover:bg-gray-800/20 transition-colors
                        disabled:cursor-not-allowed px-4 text-center`}
                      >
                        <span className="font-bold mr-2">{letter}:</span>{" "}
                        {value as string}
                      </button>
                    );
                  }
                )
              : // Handle options as an array (for backward compatibility)
                Array.isArray(currentQuestion.options) &&
                currentQuestion.options.map((option: string, index: number) => {
                  const letter = String.fromCharCode(65 + index); // 65 is ASCII for 'A'
                  return (
                    <button
                      key={letter}
                      onClick={() => handleAnswerSubmit(option)}
                      disabled={showResult}
                      className={`h-[100px] w-full bg-transparent 
                        ${getButtonStyle(option)}
                        rounded-lg text-white hover:bg-gray-800/20 transition-colors
                        disabled:cursor-not-allowed px-4 text-center`}
                    >
                      <span className="font-bold mr-2">{letter}:</span> {option}
                    </button>
                  );
                })}
          </div>
        );

      case "identification":
        return (
          <div className="w-full max-w-[500px] mt-3 mx-auto">
            <input
              type="text"
              value={inputAnswer}
              onChange={(e) => setInputAnswer(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !showResult) {
                  handleAnswerSubmit(inputAnswer);
                }
              }}
              disabled={showResult}
              className={`w-full p-4 rounded-lg bg-transparent py-10 px-10 border-2 text-center
                ${
                  showResult
                    ? isCurrentAnswerCorrect !== null
                      ? isCurrentAnswerCorrect
                        ? "border-[#52A647]" // Green border for correct answers
                        : "border-[#FF3B3F]" // Red border for incorrect answers
                      : currentQuestion?.isCorrect
                      ? "border-[#52A647]" // Fallback to currentQuestion.isCorrect
                      : "border-[#FF3B3F]"
                    : "border-gray-600" // Default gray border
                }
                text-white focus:outline-none placeholder:text-[#6F658D]`}
              placeholder="Type your answer here..."
            />
          </div>
        );

      case "true-false":
        return (
          <div className="flex gap-4 justify-center">
            {["true", "false"].map((option) => (
              <button
                key={option}
                onClick={() => handleAnswerSubmit(option)}
                disabled={showResult}
                className={`h-[100px] w-[200px] bg-transparent 
                                    ${getButtonStyle(option)}
                                    rounded-lg text-white hover:bg-gray-800/20 transition-colors
                                    disabled:cursor-not-allowed`}
              >
                {option.toUpperCase()}
              </button>
            ))}
          </div>
        );
    }
  };

  const getHeartbeatClass = () => {
    if (questionTimer === null || questionTimer === 0) return "";
    if (questionTimer <= 1) return "animate-heartbeat-1";
    if (questionTimer <= 2) return "animate-heartbeat-2";
    if (questionTimer <= 3) return "animate-heartbeat-3";
    return "";
  };

  const getBorderClass = () => {
    if (questionTimer === null) return "";
    if (questionTimer <= (timeLimit ?? 30) / 2) {
      return "animate-danger-pulse rounded-lg backdrop-blur-sm";
    }
    return "";
  };

  const getLowHealthEffects = () => {
    if (questionTimer === null || questionTimer === 0) return "";
    if (questionTimer <= (timeLimit ?? 30) / 2) {
      return "animate-screen-shake";
    }
    return "";
  };

  const renderVignette = () => {
    if (questionTimer === null || questionTimer > (timeLimit ?? 30) / 2)
      return null;
    return (
      <div className="fixed inset-0 pointer-events-none z-50">
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-red-500/20 to-red-500/70 animate-pulse-vignette" />
      </div>
    );
  };

  const saveSessionReport = async (
    sessionData: SessionData,
    isComplete: boolean = true
  ) => {
    if (hasSessionSaved) {
      console.log("Session already saved, skipping duplicate save");
      return;
    }

    try {
      const endpoint = `${
        import.meta.env.VITE_BACKEND_URL
      }/api/session-report/save`;

      // Get total number of items from material
      const totalItems = material?.items?.length || 0;

      // Calculate XP based on completion status
      const expGained = calculateExpGained(isComplete, totalItems);

      // Log the values we're about to send
      console.log("Preparing session report with values:", {
        timeSpent: sessionData.timeSpent,
        correctCount: sessionData.correctCount,
        incorrectCount: sessionData.incorrectCount,
      });

      const payload: SessionPayload = {
        session_id: sessionId,
        study_material_id: material.study_material_id,
        title: material.title || "",
        summary: material.summary || "",
        session_by_user_id: user?.firebase_uid || "",
        session_by_username: user?.username || "",
        status: isComplete ? "completed" : "incomplete",
        ends_at: new Date().toISOString(),
        exp_gained: expGained,
        coins_gained: null,
        game_mode: mode.toLowerCase(),
        total_time: sessionData.timeSpent,
        mastered: sessionData.correctCount,
        unmastered: sessionData.incorrectCount,
      };

      console.log("Sending payload to server:", payload);

      const response = await axios.post<SessionReportResponse>(
        endpoint,
        payload
      );

      if (response.data.success) {
        console.log("Session report saved successfully:", response.data);
        setHasSessionSaved(true);
        return response.data;
      } else {
        console.error("Failed to save session report:", response.data);
        throw new Error(
          response.data.message || "Failed to save session report"
        );
      }
    } catch (error: unknown) {
      console.error("Error in saveSessionReport:", error);
      if (error && typeof error === "object" && "isAxiosError" in error) {
        const axiosError = error as any;
        console.error("Axios error details:", {
          message: axiosError.message,
          status: axiosError.response?.status,
          data: axiosError.response?.data,
        });
      }
      throw error;
    }
  };

  // Update the handleEndGame function
  const handleEndGame = async () => {
    console.log("Handling early game end...");

    if (hasSessionSaved) {
      console.log("Session already saved, skipping save");
      return;
    }

    // Play session incomplete sound
    if (sessionIncompleteRef.current) {
      sessionIncompleteRef.current.play();
    }

    const timeSpent = calculateTimeSpent(startTime, new Date());
    const navigationState = {
      timeSpent,
      correctCount,
      incorrectCount,
      mode,
      material: material?.title || "Unknown Material",
      earlyEnd: true,
      highestStreak,
      masteredCount,
      unmasteredCount,
      earnedXP: 0,
    };

    try {
      // First save the session
      const sessionData: SessionData = {
        correctCount,
        incorrectCount,
        highestStreak,
        earnedXP: 0, // Force 0 XP for early end
        timeSpent,
      };

      await saveSessionReport(sessionData, false);

      setIsGameEndedByUser(true);
      setHasSessionSaved(true);

      // Log navigation attempt
      console.log(
        "Attempting navigation to summary with state:",
        navigationState
      );

      // Navigate after successful save
      navigate("/dashboard/study/session-summary", {
        replace: true,
        state: navigationState,
      });
    } catch (error) {
      console.error("Failed to save incomplete session:", error);

      // Still try to navigate even if save fails
      console.log("Save failed, attempting navigation anyway");
      navigate("/dashboard/study/session-summary", {
        replace: true,
        state: navigationState,
      });
    }
  };

  return (
    <div className={`min-h-screen relative ${getBorderClass()}`}>
      {/* Audio elements */}
      <audio ref={backgroundMusicRef} preload="auto" />
      <audio ref={speedUpMusicRef} preload="auto" />
      <audio ref={correctAnswerSoundRef} preload="auto" />
      <audio ref={incorrectAnswerSoundRef} preload="auto" />
      <audio ref={sessionIncompleteRef} preload="auto" />
      <audio ref={sessionCompleteRef} preload="auto" />
      <DocumentHead
        title={` ${
          material?.title || "Study Session"
        } - Time Pressured Mode | Duel Learn`}
      />

      {renderVignette()}
      <div className={`relative ${getLowHealthEffects()}`}>
        <Header
          material={material}
          mode={mode}
          correct={correctCount}
          incorrect={incorrectCount}
          startTime={startTime}
          highestStreak={highestStreak}
          masteredCount={masteredCount}
          unmasteredCount={unmasteredCount}
          onEndGame={handleEndGame}
          backgroundMusicRef={backgroundMusicRef}
          attackSoundRef={speedUpMusicRef}
          correctAnswerSoundRef={correctAnswerSoundRef}
          incorrectAnswerSoundRef={incorrectAnswerSoundRef}
          correctSfxRef={sessionCompleteRef}
          incorrectSfxRef={sessionIncompleteRef}
          masterVolume={masterVolume}
          musicVolume={musicVolume}
          soundEffectsVolume={soundEffectsVolume}
          setMasterVolume={setMasterVolume}
          setMusicVolume={setMusicVolume}
          setSoundEffectsVolume={setSoundEffectsVolume}
        />
        <main className="pt-24 px-4">
          <div className="mx-auto max-w-[1200px] flex flex-col items-center gap-8 h-[calc(100vh-96px)] justify-center">
            <div
              className={`w-[1200px] flex flex-col items-center gap-8 ${getHeartbeatClass()}`}
            >
              <FlashCard
                question={currentQuestion?.question || ""}
                correctAnswer={currentQuestion?.correctAnswer || ""}
                isFlipped={isFlipped}
                onFlip={handleFlip}
                onReveal={handleRevealAnswer}
                timeRemaining={questionTimer}
                type={currentQuestion?.type}
                disabled={cardDisabled}
                image={currentQuestion?.itemInfo?.image || null}
                currentQuestion={currentQuestion}
              />
            </div>
            {renderQuestionContent()}
            {showResult && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2 bg-[#4D18E8] text-white rounded-lg hover:bg-[#3A12B0] transition-colors"
                >
                  Next Question
                </button>
              </div>
            )}
          </div>
        </main>
        <Timer
          timeRemaining={questionTimer}
          progress={timerProgress}
          timeLimit={timeLimit ?? 30}
          currentStreak={currentStreak}
          highestStreak={highestStreak}
        />
      </div>
    </div>
  );
};

export default TimePressuredMode;
