"use client"

import { useState } from "react"
import "../style/HostModeSelection.css"
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';

export default function HostModeSelection() {
    const [selectedDifficulty, setSelectedDifficulty] = useState("Easy Mode")

    const handleDifficultyChange = (direction: 'left' | 'right') => {
        if (direction === 'left') {
            if (selectedDifficulty === "Easy Mode") {
                setSelectedDifficulty("Hard Mode"); // Loop back to Hard Mode
            } else if (selectedDifficulty === "Average Mode") {
                setSelectedDifficulty("Easy Mode");
            } else if (selectedDifficulty === "Hard Mode") {
                setSelectedDifficulty("Average Mode");
            }
        } else if (direction === 'right') {
            if (selectedDifficulty === "Easy Mode") {
                setSelectedDifficulty("Average Mode");
            } else if (selectedDifficulty === "Average Mode") {
                setSelectedDifficulty("Hard Mode");
            } else if (selectedDifficulty === "Hard Mode") {
                setSelectedDifficulty("Easy Mode"); // Loop back to Easy Mode
            }
        }
    }

    return (
        <div className="difficulty-selector" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className="container">
                <div className="header">
                    <h1>SELECT DIFFICULTY</h1>
                    <p>Choose a difficulty level that matches your skill!</p>
                </div>

                <div className="content">
                    <div className="difficulty-buttons">
                        {/* Easy Mode Button */}
                        <button
                            onClick={() => setSelectedDifficulty("Easy Mode")}
                            className={`difficulty-button ${selectedDifficulty === "Easy Mode" ? "selected" : ""}`}
                        >
                            Easy Mode
                        </button>

                        {/* Average Mode Button */}
                        <button
                            onClick={() => setSelectedDifficulty("Average Mode")}
                            className={`difficulty-button ${selectedDifficulty === "Average Mode" ? "selected" : ""}`}
                        >
                            Average Mode
                        </button>

                        {/* Hard Mode Button */}
                        <button
                            onClick={() => setSelectedDifficulty("Hard Mode")}
                            className={`difficulty-button ${selectedDifficulty === "Hard Mode" ? "selected" : ""}`}
                        >
                            Hard Mode
                        </button>

                        {/* Back Button */}
                        <button className="back-button">Start Game</button>
                    </div>

                    <div className="cards-section">
                        <div className="cards-grid">
                            {/* Top Row Cards */}
                            <div className="flip-card">
                                <div className="flip-card-inner">
                                    <div className="flip-card-front">
                                        <div className="skull-icon">
                                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M50,20 C60,20 70,30 70,40 C70,50 60,55 50,55 C40,55 30,50 30,40 C30,30 40,20 50,20 Z"
                                                    fill="#222"
                                                />
                                                <circle cx="40" cy="35" r="5" fill="#777" />
                                                <circle cx="60" cy="35" r="5" fill="#777" />
                                                <path
                                                    d="M30,60 C30,60 40,70 50,70 C60,70 70,60 70,60 L65,85 C65,85 60,90 50,90 C40,90 35,85 35,85 L30,60 Z"
                                                    fill="#222"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flip-card-back">
                                        <div className="card-content">
                                            <h3>Card Info</h3>
                                            <p>Card details revealed on flip</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flip-card">
                                <div className="flip-card-inner">
                                    <div className="flip-card-front">
                                        <div className="skull-icon">
                                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M50,20 C60,20 70,30 70,40 C70,50 60,55 50,55 C40,55 30,50 30,40 C30,30 40,20 50,20 Z"
                                                    fill="#222"
                                                />
                                                <circle cx="40" cy="35" r="5" fill="#777" />
                                                <circle cx="60" cy="35" r="5" fill="#777" />
                                                <path
                                                    d="M30,60 C30,60 40,70 50,70 C60,70 70,60 70,60 L65,85 C65,85 60,90 50,90 C40,90 35,85 35,85 L30,60 Z"
                                                    fill="#222"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flip-card-back">
                                        <div className="card-content">
                                            <h3>Card Info</h3>
                                            <p>Card details revealed on flip</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Row Cards */}
                            <div className="flip-card">
                                <div className="flip-card-inner">
                                    <div className="flip-card-front">
                                        <div className="skull-icon">
                                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M50,20 C60,20 70,30 70,40 C70,50 60,55 50,55 C40,55 30,50 30,40 C30,30 40,20 50,20 Z"
                                                    fill="#222"
                                                />
                                                <circle cx="40" cy="35" r="5" fill="#777" />
                                                <circle cx="60" cy="35" r="5" fill="#777" />
                                                <path
                                                    d="M30,60 C30,60 40,70 50,70 C60,70 70,60 70,60 L65,85 C65,85 60,90 50,90 C40,90 35,85 35,85 L30,60 Z"
                                                    fill="#222"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flip-card-back">
                                        <div className="card-content">
                                            <h3>Card Info</h3>
                                            <p>Card details revealed on flip</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flip-card">
                                <div className="flip-card-inner">
                                    <div className="flip-card-front">
                                        <div className="skull-icon">
                                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M50,20 C60,20 70,30 70,40 C70,50 60,55 50,55 C40,55 30,50 30,40 C30,30 40,20 50,20 Z"
                                                    fill="#222"
                                                />
                                                <circle cx="40" cy="35" r="5" fill="#777" />
                                                <circle cx="60" cy="35" r="5" fill="#777" />
                                                <path
                                                    d="M30,60 C30,60 40,70 50,70 C60,70 70,60 70,60 L65,85 C65,85 60,90 50,90 C40,90 35,85 35,85 L30,60 Z"
                                                    fill="#222"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flip-card-back">
                                        <div className="card-content">
                                            <h3>Card Info</h3>
                                            <p>Card details revealed on flip</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation and text at the bottom of cards section */}
                        <div className="navigation">
                            <button className="nav-button" onClick={() => handleDifficultyChange('left')}>
                                <KeyboardArrowLeft />
                            </button>
                            <p className="nav-text">
                                {selectedDifficulty === "Easy Mode" && "Easy mode includes cards that belong to easy mode only."}
                                {selectedDifficulty === "Average Mode" && "Average mode includes cards that belong to average mode only."}
                                {selectedDifficulty === "Hard Mode" && "Hard mode includes cards that belong to hard mode only."}
                            </p>
                            <button className="nav-button" onClick={() => handleDifficultyChange('right')}>
                                <KeyboardArrowRight />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

