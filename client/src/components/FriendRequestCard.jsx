import * as React from "react";
import Avatar from "@mui/material/Avatar";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import RejectRoundedIcon from "@mui/icons-material/DisabledByDefaultRounded";

export function FriendRequestCard({ name, level }) {
  return (
    <div className="flex items-center justify-between bg-transparent gap-8 rounded-lg w-full">
      <div className="flex items-center space-x-4 ">
        <Avatar src="/broken-image.jpg" variant="rounded" />
        <div>
          <h3
            className="text-lg font-medium truncate overflow-hidden whitespace-nowrap text-ellipsis"
            style={{ maxWidth: "7.813rem" }}
          >
            {name}
          </h3>
          <p className="text-sm text-gray-400">Lvl {level}</p>
        </div>
      </div>
      <div className="flex">
        <button className="text-green-400 hover:text-green-600">
          <CheckBoxIcon fontSize="large" />
        </button>
        <button className="text-red-400 hover:text-red-600">
          <RejectRoundedIcon fontSize="large" />
        </button>
      </div>
    </div>
  );
}
