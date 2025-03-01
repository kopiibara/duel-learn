import React from "react";
import { Stack, Divider, Tooltip } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import Badge from "@mui/material/Badge";
import { useUser } from "../../../contexts/UserContext";
import { usePendingFriendRequests } from "../../../hooks/friends.hooks/usePendingFriendRequests";

interface FriendListActionsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const FriendListActions: React.FC<FriendListActionsProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { user } = useUser();
  const { requestsCount } = usePendingFriendRequests(user?.firebase_uid);

  return (
    <Stack
      direction={"row"}
      spacing={1}
      className="flex justify-between bg-[#120F1C] py-6 px-4 border-t-[0.25rem] rounded-b-[0.8rem] border-[#3B354C]"
    >
      <Tooltip title="Your Friends" placement="top" enterDelay={100} arrow>
        <button
          onClick={() => onTabChange("YOUR FRIENDS")}
          className={`flex items-center justify-center hover:scale-110 hover:text-[#A38CE6] transition-all duration-300 flex-1 ${
            activeTab === "YOUR FRIENDS" ? "text-[#A38CE6]" : "text-[#3B354D]"
          }`}
        >
          <PeopleIcon />
        </button>
      </Tooltip>
      <Divider orientation="vertical" variant="middle" flexItem />
      <Tooltip title="Friend Requests" placement="top" enterDelay={100} arrow>
        <button
          onClick={() => onTabChange("FRIEND REQUESTS")}
          className={`flex items-center justify-center hover:scale-110 hover:text-[#A38CE6] transition-all duration-300 flex-1 ${
            activeTab === "FRIEND REQUESTS"
              ? "text-[#A38CE6]"
              : "text-[#3B354D]"
          }`}
        >
          {requestsCount > 0 ? (
            <Badge
              badgeContent={requestsCount}
              overlap="circular"
              sx={{
                "& .MuiBadge-badge": {
                  left: 14,
                  backgroundColor: "#A38CE6",
                  color: "#3B354D",
                },
              }}
            >
              <PersonAddIcon />
            </Badge>
          ) : (
            <PersonAddIcon />
          )}
        </button>
      </Tooltip>
      <Divider orientation="vertical" variant="middle" flexItem />
      <Tooltip title="Find Friends" placement="top" enterDelay={100} arrow>
        <button
          onClick={() => onTabChange("FIND FRIENDS")}
          className={`flex items-center justify-center hover:scale-110 hover:text-[#A38CE6] transition-all duration-300 flex-1 ${
            activeTab === "FIND FRIENDS" ? "text-[#A38CE6]" : "text-[#3B354D]"
          }`}
        >
          <PersonSearchIcon />
        </button>
      </Tooltip>
    </Stack>
  );
};

export default FriendListActions;
