import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function SearchField() {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [topics, setTopics] = useState<string[]>([]);

  useEffect(() => {
    fetch("/mock-data/SearchField.json")
      .then((response) => response.json())
      .then((data) => setTopics(data.topics))
      .catch((error) => console.error("Error fetching topics:", error));
  }, []);

  // Filter topics based on input value
  const filteredTopics = topics.filter((topic) =>
    topic.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Handle click on dropdown item to set the value in input
  const handleSelectTopic = (topic: string) => {
    setInputValue(topic); // Set the selected topic
    setIsFocused(false); // Close the dropdown
  };

  return (
    <Box className="w-full max-w-[567px] min-w-[170px]">
      <Box className="relative">
        <input
          type="search"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsFocused(true)} // Show dropdown when focused
          onBlur={() => setTimeout(() => setIsFocused(false), 100)} // Delay blur to allow click on dropdown item
          className="peer w-full h-[42px] px-[24px] text-[18px] bg-[#3B354D] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#6F658D] placeholder-transparent sm:max-w-full text-[#dddddd]"
          placeholder="Search input"
        />
        {!inputValue &&
          !isFocused && ( // Only show label when input is empty and not focused
            <label
              htmlFor="search"
              className="absolute left-[43px] top-1/2 transform -translate-y-1/2 text-[#6F658D] text-[18px] transition-opacity duration-300 opacity-100"
            >
              Search input
            </label>
          )}
        {!inputValue &&
          !isFocused && ( // Only show icon when input is empty and not focused
            <Box className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <SearchIcon sx={{ color: "#6F658D", fontSize: "22px" }} />
            </Box>
          )}

        {/* Autocomplete dropdown */}
        {isFocused && filteredTopics.length > 0 && (
          <Box className="absolute top-[47px] bg-[#3B354D] w-full max-h-[350px] overflow-y-auto rounded-[10px] shadow-lg z-10">
            <Box className="custom-scrollbar bg-[#3B354D]">
              {filteredTopics.map((topic, index) => (
                <Box
                  key={index}
                  className="cursor-pointer p-[10px] text-[#dddddd] hover:bg-[#6F658D] rounded-[8px]"
                  onClick={() => handleSelectTopic(topic)}
                >
                  {topic}
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
