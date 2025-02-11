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
            backgroundColor: "transparent", // Background color
            color: "#6F658D", // Text color
            borderRadius: "8px", // Rounded corners
            fontSize: "14px", // Font size
            "& .MuiSelect-icon": {
              color: "#6F658D", // Change the dropdown arrow color
            },
            "&:hover .MuiSelect-icon": {
              color: "#E2DDF3", // Change the dropdown arrow color on hover
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#6F658D", // Default border color
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#E2DDF3", // Hover state border color
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#E2DDF3", // Border color when focused
            },
          }}
        >
          {menuItems.map((item) => (
            <MenuItem
              key={item.value}
              value={item.value}
              sx={{
                color: "#6F658D", // Default text color of menu items
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
