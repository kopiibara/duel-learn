import * as React from "react";

function ChooseYourChallenge() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      {/* Peaceful Mode */}
      <div className="flex flex-col items-center px-6 py-6 rounded-2xl max-w-[300px] h-[200px] bg-gradient-to-b from-[#ECE6FF] to-[#DDD3FF] hover:scale-105 transition-all duration-300">
        <header className="mt-auto flex flex-col w-full text-left">
          <h1 className="text-lg font-semibold text-black">Peaceful Mode</h1>
          <p className="text-sm text-violet-950">
            Study your way, no rush, just flow!
          </p>
        </header>
      </div>

      {/* Time Pressured Mode */}
      <div className="flex flex-col items-center px-6 py-6 rounded-2xl max-w-[300px] h-[200px] bg-gradient-to-b from-[#ECE6FF] to-[#DDD3FF] hover:scale-105 transition-all duration-300">
        <header className="mt-auto flex flex-col w-full text-left">
          <h1 className="text-lg font-semibold text-black">Time Pressured</h1>
          <p className="text-sm text-violet-950">
            Beat the clock, challenge your speed!
          </p>
        </header>
      </div>

      {/* PvP Mode */}
      <div className="flex flex-col items-center px-6 py-6 rounded-2xl max-w-[300px] h-[200px] bg-gradient-to-b from-[#ECE6FF] to-[#DDD3FF] hover:scale-105 transition-all duration-300">
        <header className="mt-auto flex flex-col w-full text-left">
          <h1 className="text-lg font-semibold text-black">PvP Mode</h1>
          <p className="text-sm text-violet-950">
          Face off, outsmart your opponent, and win!
          </p>
        </header>
      </div>
    </section>
  );
}

export default ChooseYourChallenge;
