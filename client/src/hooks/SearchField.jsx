import * as React from 'react';
import { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';

const topics = [
    'JavaScript Fundamentals',
    'ES6 Syntax',
    'Asynchronous JavaScript (Promises, async/await)',
    'JavaScript Modules',
    'Node.js Basics',
    'Web Development with React',
    'REST APIs in JavaScript',
    'Data Structures in JavaScript',
    'Algorithms (Sorting, Searching)',
    'TypeScript Introduction',
    'JavaScript Frameworks (Vue, Angular)',
    'Functional Programming in JavaScript',
    'Object-Oriented Programming (OOP)',
    'Web Security Basics',
    'Git and GitHub for Version Control',
    'Front-End Development',
    'Back-End Development',
    'Databases (SQL vs NoSQL)',
    'GraphQL API',
    'Cloud Computing Basics'
];

export default function SearchField() {
    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    // Filter topics based on input value
    const filteredTopics = topics.filter(topic =>
        topic.toLowerCase().includes(inputValue.toLowerCase())
    );

    // Handle click on dropdown item to set the value in input
    const handleSelectTopic = (topic) => {
        setInputValue(topic); // Set the selected topic
        setIsFocused(false);  // Close the dropdown
    };

    return (
        <div className="w-full max-w-[567px] min-w-[170px]">
            <div className="relative">
                <input
                    type="search"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onFocus={() => setIsFocused(true)} // Show dropdown when focused
                    onBlur={() => setTimeout(() => setIsFocused(false), 100)} // Delay blur to allow click on dropdown item
                    className="peer w-full h-[42px] px-[24px] text-[18px] bg-[#3B354D] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#6F658D] placeholder-transparent sm:max-w-full text-[#dddddd]"
                    placeholder="Search input"
                />
                {!inputValue && !isFocused && ( // Only show label when input is empty and not focused
                    <label
                        htmlFor="search"
                        className="absolute left-[43px] top-1/2 transform -translate-y-1/2 text-[#6F658D] text-[18px] transition-all"
                    >
                        Search input
                    </label>
                )}
                {!inputValue && !isFocused && ( // Only show icon when input is empty and not focused
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <SearchIcon sx={{ color: '#6F658D', fontSize: '22px' }} />
                    </div>
                )}

                {/* Autocomplete dropdown */}
                {(isFocused && filteredTopics.length > 0) && (
                    <div className="absolute top-[47px] bg-[#3B354D] w-full max-h-[350px] overflow-y-auto rounded-[10px] shadow-lg z-10">
                        <div className="custom-scrollbar bg-[#3B354D]">
                            {filteredTopics.map((topic, index) => (
                                <div
                                    key={index}
                                    className="cursor-pointer p-[10px] text-[#dddddd] hover:bg-[#6F658D] rounded-[8px]"
                                    onClick={() => handleSelectTopic(topic)}
                                >
                                    {topic}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
