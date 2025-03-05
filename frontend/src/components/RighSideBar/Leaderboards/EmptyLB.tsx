const EmptyLB = () => {
  return (
    <div
      className="rounded-md shadow-md border-3"
      style={{ borderColor: "#3B354C", borderWidth: "3px" }}
    >
      <div className="px-8 pt-8 pb-2">
        <div className="flex flex-row items-center mb-5">
          <div className="bg-white w-9 h-8 rounded mr-3"></div>
          <h2 className="text-xl text-[#FFFFFF] font-semibold">Leaderboards</h2>
        </div>
        <hr className="border-t-1 border-[#ffffff] mb-7" />
        {/* Empty State Placeholder */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-20 h-20 bg-white rounded mt-4 mb-6"></div>
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
