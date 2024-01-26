import { useState } from "react";
import StatinoInformation from "./StationInformation";

interface NearestStationProps {
  sta: string;
}

function NearestStation({ sta }: NearestStationProps): JSX.Element {
  const [show, setShow] = useState(false);

  return (
    <>
      <div className="absolute bottom-10 right-2 mr-5">
        <button
          onClick={() => setShow(!show)}
          type="button"
          className="flex justify-center items-center text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-full text-xl w-12 h-12"
        >
          <svg
            className="w-8 h-8"
            xmlns="http://www.w3.org/2000/svg"
            height="1em"
            viewBox="0 0 320 512"
          >
            <path
              fill="#ffffff"
              d="M112 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm40 304V480c0 17.7-14.3 32-32 32s-32-14.3-32-32V256.9L59.4 304.5c-9.1 15.1-28.8 20-43.9 10.9s-20-28.8-10.9-43.9l58.3-97c17.4-28.9 48.6-46.6 82.3-46.6h29.7c33.7 0 64.9 17.7 82.3 46.6l58.3 97c9.1 15.1 4.2 34.8-10.9 43.9s-34.8 4.2-43.9-10.9L232 256.9V480c0 17.7-14.3 32-32 32s-32-14.3-32-32V352H152z"
            />
          </svg>
        </button>
      </div>
      <div
        className={`${
          show ? "bottom-2" : "-bottom-full"
        } absolute rounded-md p-5 left-1/2 -translate-x-1/2 w-96 z-50 bg-white mx-auto flex flex-col justify-center items-center`}
      >
        <StatinoInformation sta={sta} />
      </div>
    </>
  );
}

export default NearestStation;
