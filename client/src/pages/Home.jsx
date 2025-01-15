import React from "react";
import Header from "../components/Header";
import ChooseYourChallenge from "../components/ChooseYourChallenge";
import RecentlyOpened from "../components/RecentlyOpened";
import DiscoverMore from "../components/DiscoverMore";
import { FriendRequestCard } from "../components/FriendRequestCard";
import "../index.css";

const Home = () => {
  const friendRequests = [
    { name: "John Doe", level: 5 },
    { name: "John Doejgshdgjshdgjshdhgkjsd", level: 5 },
    { name: "John Doe", level: 5 }, // More friend requests can go here
  ];

  return (
    <div className="flex w-full mt-0 pt-0 flex-col">
      {/* Header */}
      <Header />

      {/* Main content with center and right side */}
      <div className="flex w-full flex-1">
        {/* Main content area (center) */}
        <div className="flex-2 mr-12 ">
          {/* Premium promotion section */}
          <section className="flex flex-col px-6 py-6 text-lg font-bold text-violet-100 rounded-2xl max-w-[939px] max-md:px-4 bg-gradient-to-t from-[#A38CE6] to-[#9675F4]">
            <h2 className="text-xl max-md:max-w-full leading-snug">
              Those gaps in your materials? <br /> Let's fill 'em up!
            </h2>
            <p className="mt-3 max-md:max-w-full text-sm">
              <span className="font-medium">AI cross-referencing</span>{" "}
              available in Duel-Learn premium!
            </p>
            <button
              className="gap-2.5 self-start px-4 py-2 mt-4 text-base text-violet-400 bg-violet-100 rounded-2xl max-md:px-5 hover:bg-violet-200 transition-all duration-200"
              tabIndex="0"
              aria-label="Learn more about Duel-Learn premium features"
            >
              Learn More
            </button>
          </section>

          {/* Label for Choose Your Challenge */}
          <div className="mt-4 text-left">
            <h2 className="text-lg font-semibold text-[#E2DDF3] ">
              Choose your Challenge
            </h2>
          </div>

          {/* Insert the ChooseYourChallenge component */}
          <ChooseYourChallenge />

          {/* Label for Recently Opened */}
          <div className="mt-4 text-left">
            <h2 className="text-lg font-semibold text-[#E2DDF3] ">
              Recently Opened
            </h2>
          </div>

          {/* Insert the RecentlyOpened component */}
          <RecentlyOpened />

          {/* Label for Discover More Materials */}
          <div className="mt-8 text-left">
            <h2 className="text-lg font-semibold text-[#E2DDF3] ">
              Discover More Materials
            </h2>
          </div>

          {/* Insert the DiscoverMore component */}
          <DiscoverMore />
        </div>

        <div className="flex flex-col space-y-6">
          {/* Right side - Friend Requests Container */}
          <div className="text-[#E2DDF3] rounded-2xl max-w-sm space-y-6 p-8 border-[#3B354D] border-2">
            {/* Section Header for Friend Requests */}
            <header className="flex flex-col w-full text-xl font-bold text-[#E2DDF3]  max-md:px-5 max-md:max-w-full">
              <h1 className="self-start">Friend Requests</h1>
              <div className="shrink-0 mt-5 h-px border border-[#3B354D] border-solid max-md:max-w-full" />
            </header>

            {/* Space for Friend Request Cards */}
            <div className="space-y-4 mt-6">
              {friendRequests.map((request, index) => (
                <FriendRequestCard
                  key={index}
                  name={request.name}
                  level={request.level}
                />
              ))}
            </div>

            {/* Full-Width Button */}
            <div className="">
              <button
                className="p-4 font-extrabold text-center bg-zinc-700 bg-opacity-20 text-zinc-700 w-full rounded-lg "
                onClick={() => {}}
                tabIndex={0}
              >
                SEE ALL FRIEND REQUESTS
              </button>
            </div>
          </div>

          {/* Right side - Leaderboard Container */}

          <div className="text-[#E2DDF3] rounded-2xl max-w-sm space-y-6 p-8 border-[#3B354D] border-2">
            {/* Section Header for Friend Requests */}
            <header className="flex flex-col w-full text-xl font-bold text-[#E2DDF3]  max-md:px-5 max-md:max-w-full">
              <h1 className="self-start">Leaderboard</h1>
              <div className="shrink-0 mt-5 h-px border border-[#3B354D] border-solid max-md:max-w-full" />
            </header>

            {/* Space for Friend Request Cards */}
            <div className="space-y-4 mt-6">
              {friendRequests.map((request, index) => (
                <FriendRequestCard
                  key={index}
                  name={request.name}
                  level={request.level}
                />
              ))}
            </div>

            {/* Full-Width Button */}
            <div className="">
              <button
                className="p-4 font-extrabold text-center bg-zinc-700 bg-opacity-20 text-zinc-700 w-full rounded-lg "
                onClick={() => {}}
                tabIndex={0}
              >
                SEE ALL FRIEND REQUESTS
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="flex justify-between text-[#5A5076] mt-6">
        <div className="flex space-x-2">
          <span>Privacy</span>
          <span>Terms</span>
        </div>
        <p>© 2024 Duel-Learn Inc.</p>
      </footer>
    </div>
  );
};

export default Home;
