import React, { useState } from "react";
import { useLocation } from "react-router-dom";

// Importing the necessary content components
import Leaderboards from "./Leaderboards";
import FriendList from "./FriendList";
import EmptyLB from "./EmptyLB";



// Define the possible route paths based on the PrivateRoutes
type RoutePath =
  | "/dashboard/home"
  | "/dashboard/explore"
  | "/dashboard/my-library"
  | "/dashboard/profile"
  | "/dashboard/shop";

const RightSideBar: React.FC = () => {
  const location = useLocation();

  // State to simulate the number of friends (replace with actual logic if dynamic)
  const [friendCount, setFriendCount] = useState<number>(5); // Example: Change this to dynamically update based on data

  // Determine whether to show EmptyLB or Leaderboards
  const leaderboardContent = friendCount >= 5 ? <Leaderboards /> : <EmptyLB />;

  // Mapping route paths to content components
  const contentMap: Record<RoutePath, JSX.Element> = {
    "/dashboard/home": <><FriendList /><div className="my-7"></div>{leaderboardContent}</>,
    "/dashboard/explore": leaderboardContent,
    "/dashboard/my-library": <><FriendList /><div className="my-7"></div>{leaderboardContent}</>,
    "/dashboard/profile": <FriendList />,
    "/dashboard/shop": <><FriendList /><div className="my-7"></div>{leaderboardContent}</>
  };

  // Get the content based on the current route
  const content = contentMap[location.pathname as RoutePath] || <div>No Content</div>;

  return (
    <div className="hidden side-list-navi pr-8 lg:block sm:w-[20rem] md:w-[24rem] mb-10 lg:w-[28rem] p-4 flex-shrink-0">{content}</div>
  );
};

export default RightSideBar;
