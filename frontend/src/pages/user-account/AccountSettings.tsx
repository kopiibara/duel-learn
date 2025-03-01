"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Avatar from "../../assets/profile-picture/bunny-picture.png";

export default function AccountSettings() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <div className="flex min-h-screen bg-[#080511] text-white" style={{ fontFamily: "Nunito, sans-serif" }}>
      {/* Sidebar */}
      <aside className="hidden lg:block pl-4 pr-4 h-screen sticky top-0">
        <Sidebar selectedIndex={selectedIndex} setSelectedIndex={setSelectedIndex} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto" style={{ width: "1137px", height: "calc(100vh - 64px)" }}>
        <div className="h-[5vh]"></div> {/* This pushes the content down */}
        <h1 className="text-2xl font-semibold mb-10" style={{ fontFamily: "Nunito, sans-serif" }}>
          Account Settings
        </h1>
        <div className="flex items-start">
          <div className="bg-[#1a1625]/50 rounded-lg p-8 space-y-10">
            <div className="space-y-4">
              <label className="block text-sm font-medium" style={{ fontFamily: "Nunito, sans-serif", fontSize: "20px" }}>
                Profile Image
              </label>
              <div className="flex items-center gap-6">
                <img
                  src={Avatar || "/placeholder.svg"}
                  alt="Profile"
                  className="w-12 h-12"
                  style={{ width: "198px", height: "194.49px" }}
                />
              </div>
            </div>
            <div className="flex flex-col items-start space-y-4">
              <label
                htmlFor="username"
                className="block text-sm font-medium w-full"
                style={{ fontFamily: "Nunito, sans-serif", fontSize: "20px" }}
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                className="w-[850px] h-[47px] px-3 py-2 bg-[#2a2435] border border-[#3b354d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D18E8]"
                style={{ fontFamily: "Nunito, sans-serif" }}
              />
            </div>
            <div className="flex flex-col items-start space-y-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium w-full"
                style={{ fontFamily: "Nunito, sans-serif", fontSize: "20px" }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-[850px] h-[47px] px-3 py-2 bg-[#2a2435] border border-[#3b354d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D18E8]"
                style={{ fontFamily: "Nunito, sans-serif" }}
              />
            </div>
            <div className="flex flex-col items-start space-y-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium w-full"
                style={{ fontFamily: "Nunito, sans-serif", fontSize: "20px" }}
              >
                Create Password
              </label>
              <input
                id="password"
                type="password"
                className="w-[850px] h-[47px] px-3 py-2 bg-[#2a2435] border border-[#3b354d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D18E8]"
                style={{ fontFamily: "Nunito, sans-serif" }}
              />
            </div>
            <div className="flex flex-col items-start space-y-4">
              <label
                htmlFor="confirm"
                className="block text-sm font-medium w-full"
                style={{ fontFamily: "Nunito, sans-serif", fontSize: "20px" }}
              >
                Confirm Password
              </label>
              <input
                id="confirm"
                type="password"
                className="w-[850px] h-[47px] px-3 py-2 bg-[#2a2435] border border-[#3b354d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D18E8]"
                style={{ fontFamily: "Nunito, sans-serif" }}
              />
            </div>
            <div className="flex gap-2 mt-1">
              <button
                className="px-6 py-2 bg-[#2a2435] text-[#6F658D] rounded-lg hover:bg-[#3b354d] transition-colors"
                style={{ fontFamily: "Nunito, sans-serif", width: "182.45px", height: "45px" }}
              >
                Discard
              </button>
              <button
                className="px-6 py-2 bg-[#4D18E8] text-white rounded-lg hover:bg-[#3b13b3] transition-colors"
                style={{ fontFamily: "Nunito, sans-serif", width: "182.45px", height: "45px" }}
              >
                Save
              </button>
            </div>
            <div className="bg-[#1a1625]/50 rounded-lg p-6 mt-10">
              <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: "Nunito, sans-serif" }}>
                Delete Account
              </h2>
              <p className="text-gray-400 mb-6" style={{ fontFamily: "Nunito, sans-serif" }}>
                This will delete all your data and cannot be undone.
              </p>
              <button
                className="px-6 py-2 bg-[#FF3B3F] text-white rounded-lg hover:bg-red-800 transition-colors"
                style={{ fontFamily: "Nunito, sans-serif", width: "182.45px", height: "45px" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}