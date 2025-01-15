import * as React from "react";
import { Tag } from "./Tag";  // Assuming you have a Tag component already

const CardComponent = () => {
  // Local data inside the component
  const title = "Networking L2";
  const itemCount = 50;
  const tags = ["Network", "Data Communication"];
  const creator = "You";

  return (
    <article className="flex flex-col justify-between px-6 py-6 text-black rounded-2xl bg-[linear-gradient(180deg,#ECE6FF_0%,#DDD3FF_100%)] max-w-[380px] h-[300px]">
      <section className="flex flex-col w-full min-h-[200px] flex-grow justify-between">
        <div className="flex flex-col mt-auto space-y-2">     
          
          {/* Item count section */}
          <h2 className="text-xs font-medium">{itemCount} ITEMS</h2>

          {/* Title section */}
          <h1 className="mt-2 text-lg font-semibold">{title}</h1>

          {/* Tags section */}
            <div className="flex gap-2 items-start text-sm font-medium">
              {tags.map((tag, index) => (
                <Tag key={index}>{tag}</Tag>
              ))}
            </div>

            {/* Creator section */}
            <p className="mt-4 text-xs font-medium">
              <span className="text-violet-950">Made by</span>{" "}
              <span className="font-semibold">{creator}</span>
            </p>
          </div>
        {/* Item count section */}

      </section>
    </article>

  );
};

export default CardComponent;
