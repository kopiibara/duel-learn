import noLeaderboard from "../../../assets/images/noLeaderboard.svg";

const EmptyLB = () => {
  return (
    <div className="rounded-[0.8rem] shadow-md border-3">
      <div className="px-8 pt-8 pb-2">
        <div className="flex flex-row items-center mb-5">
          <h2 className="text-xl text-[#FFFFFF] font-semibold">Leaderboards</h2>
        </div>
        <hr className="border-t-1 border-[#ffffff] mb-7" />

        <div className="flex flex-col items-center justify-center mb-6">
          <img src={noLeaderboard} alt="" />
          <p className="text-[#6F658D] w-[390px] text-center mt-3 px-7">
            Add more friends to unlock the Leaderboards and compete with them
            for the top spot!
          </p>
        </div>
      </div>
      <button
        style={{ borderColor: "#3B354C", borderWidth: "1px" }}
        className="w-full p-4 text-[#48405f] bg-[#120F1C] text-center"
      >
        FIND FRIENDS
      </button>
    </div>
  );
};

export default EmptyLB;
