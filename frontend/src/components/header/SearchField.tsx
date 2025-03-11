import { useState, useEffect } from "react";
import axios from "axios";
import { Box, Stack } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { UserInfo } from "../../types/userInfoObject";
import { StudyMaterial } from "../../types/studyMaterialObject";
import PersonIcon from "@mui/icons-material/Person";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import "../../styles/custom-scrollbar.css";
import { useNavigate } from "react-router-dom";

// Define a union type for search results
type SearchResult = UserInfo | StudyMaterial;

export default function SearchField() {
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle API search
  useEffect(() => {
    if (inputValue.trim() === "") {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await axios.get<{
          users: UserInfo[];
          study_materials: StudyMaterial[];
        }>(`http://localhost:5000/api/search/global/${inputValue}`);

        setResults([...response.data.users, ...response.data.study_materials]);
      } catch (error) {
        console.error("Search failed:", error);
      }
      setLoading(false);
    };

    // Debounce API calls
    const delayDebounce = setTimeout(fetchResults, 300);

    return () => clearTimeout(delayDebounce);
  }, [inputValue]);

  // Handle Enter key press to navigate to search page
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      navigate(`/dashboard/search?query=${encodeURIComponent(inputValue)}`);
      setIsFocused(false);
    }
  };

  // Handle item selection
  const handleSelectItem = (item: SearchResult) => {
    if ("username" in item) {
      // Navigate to user profile
      navigate(`/dashboard/profile/${item.username}`);
    } else {
      // Navigate to study material details
      navigate(`/dashboard/studymaterial/${item.study_material_id}`);
    }
    setIsFocused(false);
  };

  return (
    <Box className="w-full max-w-[567px] min-w-[170px]">
      <Box className="relative">
        <input
          type="search"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 100)}
          onKeyDown={handleKeyDown}
          className="peer w-full h-[48px]  pl-11 pr-10 text-[18px] bg-[#3B354D] rounded-[0.8rem] focus:outline-none focus:ring-2 focus:ring-[#6F658D] placeholder-transparent sm:max-w-full [&::-webkit-search-cancel-button]:appearance-none"
          placeholder="Search input"
        />
        {/* Hide default clear button and add custom one */}
        {inputValue && (
          <Box
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
            onClick={() => setInputValue("")}
          >
            <ClearIcon sx={{ color: "#6F658D", fontSize: "20px" }} />
          </Box>
        )}
        {!inputValue && !isFocused && (
          <label
            htmlFor="search"
            className="absolute left-[43px] top-1/2 transform -translate-y-1/2 text-[#6F658D] text-[18px] transition-opacity duration-300 opacity-100"
          >
            Search input
          </label>
        )}
        <Box className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <SearchIcon sx={{ color: "#6F658D", fontSize: "22px" }} />
        </Box>

        {/* Autocomplete dropdown */}
        {isFocused && (
          <Box className="absolute top-[55px] bg-[#3B354D] w-full max-h-[400px] overflow-y-auto rounded-[0.8rem] shadow-lg z-10">
            {loading ? (
              <Box className="py-3 px-4 ">Loading...</Box>
            ) : results.length > 0 ? (
              results.map((item, index) => (
                <Stack className="p-2" key={index}>
                  <Box
                    className="cursor-pointer py-3 px-4 hover:bg-[#6F658D] rounded-[0.8rem] flex items-center gap-2"
                    onClick={() => handleSelectItem(item)}
                  >
                    {/* Type indicator icon */}
                    {"username" in item ? (
                      <PersonIcon fontSize="small" sx={{ color: "#8878C7" }} />
                    ) : (
                      <MenuBookIcon
                        fontSize="small"
                        sx={{ color: "#8878C7" }}
                      />
                    )}

                    {"username" in item ? item.username : item.title}
                  </Box>
                </Stack>
              ))
            ) : (
              <Box className="py-3 px-4 ">No results found</Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
