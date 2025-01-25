import React from "react";
import {
  Box,
  Button,
  Fab,
  Tooltip,
  IconButton,
  Typography,
  Stack,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import clsx from "clsx";
import AddIcon from "@mui/icons-material/Add";
import PlayIcon from "@mui/icons-material/PlayArrowRounded";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIcon from "@mui/icons-material/ArrowForwardIosRounded";
import { useNavigate } from "react-router-dom";
import ChooseModeModal from "./modals/ChooseModeModal"; // Import the modal component

const menuItems = [
  {
    title: "Home",
    icon: "/sidebar-icons/home-icon.svg",
    path: "/dashboard/home",
  },
  {
    title: "Explore",
    icon: "/sidebar-icons/explore-icon.svg",
    path: "/dashboard/explore",
  },
  {
    title: "My Library",
    icon: "/sidebar-icons/my-library-icon.svg",
    path: "/dashboard/my-library",
  },
  {
    title: "Profile",
    icon: "/sidebar-icons/profile-icon.svg",
    path: "/dashboard/profile",
  },
  {
    title: "Shop",
    icon: "/sidebar-icons/shop-icon.svg",
    path: "/dashboard/shop",
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(0);
  const [collapsed, setCollapsed] = React.useState(false);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [fromCreate, setFromCreate] = React.useState(false); // Tracks if navigation came from Create button

  const [openModal, setOpenModal] = React.useState(false); // Modal state
  const handleModalOpen = () => setOpenModal(true);
  const handleModalClose = () => setOpenModal(false);

  const handleItemClick = (index: number, path: string) => {
    setSelectedIndex(index);
    setCollapsed(fromCreate ? false : collapsed); // Uncollapse if navigation came from Create button
    setFromCreate(false); // Reset the Create navigation state
    navigate(path);
  };

  const toggleCollapse = () => setCollapsed(!collapsed);

  const handleCreateStudyMaterial = () => {
    setSelectedIndex(null); // Deselect the list items
    setFromCreate(true); // Mark that navigation originated from Create button
    setCollapsed(true); // Collapse the sidebar
    navigate("/dashboard/study-material/create");
  };

  const renderButton = (
    icon: React.ReactNode,
    text: string,
    variant: "contained" | "outlined",
    onClick: () => void
  ) => (
    <Tooltip title={collapsed ? text : ""} placement="right" arrow>
      <Button
        variant={variant}
        onClick={onClick}
        sx={{
          textTransform: "none",
          borderRadius: "0.8rem",
          padding: "0.6rem 2rem",
          display: "flex",
          width: "full",
          justifyContent: "center",
          alignItems: "center",
          ...(variant === "contained" && { backgroundColor: "#4D18E8" }),
          ...(variant === "outlined" && {
            borderColor: "#E2DDF3",
            color: "#E2DDF3",
          }),
        }}
      >
        {icon}
        <Typography
          variant="subtitle1"
          className={clsx("transition-all duration-100", {
            "opacity-0 w-auto": collapsed,
            "opacity-100 w-auto": !collapsed,
          })}
          sx={{
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          {text}
        </Typography>
      </Button>
    </Tooltip>
  );

  return (
    <Box style={{ display: "flex", position: "relative" }}>
      <Stack
        className="h-full w-full pl-2 mx-2  py-12 flex flex-col justify-between"
        spacing={2}
        sx={{
          width: collapsed ? "5.5rem" : "16rem",
          transition: "width 0.35s",
        }}
      >
        <Stack spacing={3} className="flex">
          <Stack direction="row" className="flex items-center" spacing={2}>
            <IconButton
              aria-label="navigate to landing page"
              onClick={() => navigate("/landing-page")}
            >
              <img
                src="/duel-learn-logo.svg"
                className="w-10 h-10"
                alt="icon"
              />
            </IconButton>
            <Typography
              variant="h6"
              fontWeight={600}
              className={clsx("transition-all duration-100", {
                "opacity-0 w-auto": collapsed,
                "opacity-100 w-auto": !collapsed,
              })}
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              Duel Learn
            </Typography>
            <Fab
              color="primary"
              onClick={toggleCollapse}
              size="small"
              sx={{
                backgroundColor: "transparent",
                "& .MuiSvgIcon-root": {
                  color: "#3B354D",
                },
                "&:hover": {
                  backgroundColor: "#3B354D",
                  "& .MuiSvgIcon-root": {
                    color: "#E2DDF3",
                  },
                },
              }}
              className={clsx(
                "absolute z-50 transition-all duration-300",
                collapsed ? "left-[0rem]" : "left-[0rem]"
              )}
            >
              {collapsed ? (
                <ArrowForwardIcon fontSize="small" />
              ) : (
                <ArrowBackIcon fontSize="small" />
              )}
            </Fab>
          </Stack>
          {renderButton(
            <AddIcon
              fontSize="small"
              className={clsx({ "mr-2": !collapsed })}
            />,
            "Create",
            "contained",
            handleCreateStudyMaterial
          )}
          {renderButton(
            <PlayIcon
              fontSize="small"
              className={clsx({ "mr-2": !collapsed })}
            />,
            "Play",
            "outlined",
            handleModalOpen // Opens the modal when "Play" is clicked
          )}
          <Divider className="bg-[#3F3565]" />
        </Stack>
        <nav aria-label="sidebar">
          <List>
            {menuItems.map((item, index) => (
              <ListItem key={index} disablePadding className="mb-2">
                <Tooltip
                  title={collapsed ? item.title : ""}
                  placement="right"
                  arrow
                >
                  <ListItemButton
                    selected={selectedIndex === index}
                    onClick={() => handleItemClick(index, item.path)}
                    sx={{
                      "&:hover, &.Mui-selected": {
                        borderColor: "#4D18E8",
                        borderWidth: "2px",
                        borderStyle: "solid",
                        borderRadius: "0.8rem",
                        color: "#4D18E8",
                      },
                      justifyContent: collapsed ? "center" : "center",
                      padding: "0.5rem 1.4rem",
                      borderRadius: "0.8rem",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        justifyContent: "center",
                        display: "flex",
                        alignItems: "center",
                        marginRight: collapsed ? 0 : "1rem",
                        width: collapsed ? "100%" : "auto",
                        transition:
                          "margin-right 0.35s, width 0.35s, opacity 0.35s",
                      }}
                    >
                      <img
                        src={
                          selectedIndex === index || hoveredIndex === index
                            ? item.icon.replace(".svg", "-colored.svg")
                            : item.icon
                        }
                        className="w-6.5"
                        alt={`${item.title} icon`}
                      />
                    </ListItemIcon>

                    <ListItemText
                      primary={item.title}
                      className={clsx("transition-all duration-0", {
                        "opacity-0 w-auto": collapsed,
                        "opacity-100 w-auto": !collapsed,
                      })}
                      sx={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        transition: "opacity 0.35s",
                      }}
                    />
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            ))}
          </List>
        </nav>
      </Stack>

      {/* Modal */}
      <ChooseModeModal open={openModal} handleClose={handleModalClose} />
    </Box>
  );
}
