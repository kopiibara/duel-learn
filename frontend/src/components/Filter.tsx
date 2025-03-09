import * as React from "react";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

interface FilterProps {
  menuItems: { value: number | string; label: string }[];
  value: number | string;
  onChange: (value: number | string) => void;
}

const Filter: React.FC<FilterProps> = ({ menuItems, value, onChange }) => {
  // Set the default value to the first item in the menuItems array, unless a value is passed
  const selectedValue = value || menuItems[0]?.value;

  const handleChange = (event: SelectChangeEvent<string | number>) => {
    onChange(event.target.value);
  };

  return (
    <Box sx={{ minWidth: 120, maxWidth: "full" }}>
      <FormControl fullWidth>
        <Select
          id="select"
          size="small"
          value={selectedValue}
          onChange={handleChange}
          sx={{
            backgroundColor: "transparent",
            color: "#9F9BAE", // This ensures the text color is consistent
            borderRadius: "0.8rem",
            fontSize: "14px",
            transition: "all 0.3s ease-in-out",
            "&:hover": {
              transform: "scale(1.03)",
              backgroundColor: "rgba(59, 53, 76, 0.3)",
            },
            "& .MuiSelect-icon": {
              color: "#6F658D",
              transition: "all 0.3s ease-in-out",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#3B354C",
              borderWidth: "2px", // Updated border width to 2px
              transition: "all 0.3s ease-in-out",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#9F9BAE",
              borderWidth: "2px", // Consistent 2px border on hover
            },
            "&.Mui-focused": {
              backgroundColor: "rgba(59, 53, 76, 0.5)",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#9F9BAE",
              borderWidth: "2px",
            },
            // Fix for the selected value text color
            "& .MuiSelect-select": {
              color: "#6F658D",
            },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: "#120F1B",
                borderRadius: "0.8rem",
                boxShadow: "0 8px 16px rgba(0, 0, 0, 0.5)",
                mt: 1,
                padding: "0rem 0.5rem",
                // Override the default blue background
                "& .MuiList-root": {
                  padding: "0.5rem 0",
                },
                "& .Mui-selected": {
                  backgroundColor: "#3B354C !important",
                  color: "#E2DDF3 !important",
                },
                "& .Mui-selected:hover": {
                  backgroundColor: "#4A465A !important",
                },
              },
            },
          }}
        >
          {menuItems.map((item) => (
            <MenuItem
              key={item.value}
              value={item.value}
              sx={{
                color: "#E2DDF3",
                padding: "0.6rem 1rem",
                margin: "0.2rem 0",
                transition: "all 0.3s ease-in-out",
                borderRadius: "0.5rem",
                "&:hover": {
                  transform: "scale(1.02)",
                  backgroundColor: "#3B354C",
                },
                "&.Mui-selected": {
                  backgroundColor: "#3B354C",
                  color: "#E2DDF3",
                  "&:hover": {
                    backgroundColor: "#4A465A",
                  },
                },
              }}
            >
              {item.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default Filter;
