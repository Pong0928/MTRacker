import { useCallback, useEffect, useState } from "react";
import mtrLoction from "../../src/json/mtr_location.json";

interface NextStaionProps {
  sta: string;
}

export interface StationData {
  line: string;
  line_name: string;
  sta: string;
  sta_name: string;
  latitude: number;
  longitude: number;
}

export interface ArrivalData {
  sta: string;
  up_dest: string | null;
  up_estimate_time: number;
  down_dest: string | null;
  down_estimate_time: number;
}

export interface MTRApiUpNDownData {
  dest: string;
  plat: string;
  seq: string;
  source: string;
  time: string;
  ttnt: string;
  valid: string;
}

export interface MTRApiData {
  DOWN: MTRApiUpNDownData[];
  UP: MTRApiUpNDownData[];
  curr_time: string;
  sys_time: string;
}

function StationInformation({ sta }: NextStaionProps) {
  const [isMultipeLines, setIsMultipeLine] = useState(false);
  const [LinesData, setLinesData] = useState<StationData[]>([]);
  const [arrivalData, setArrivalData] = useState<ArrivalData>();
  const [isLoading, setIsLoading] = useState(true);

  const checkEstimateTime = useCallback((line: string, sta: string) => {
    return fetch(
      `https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=${line}&sta=${sta}`
    )
      .then((res) => res.json())
      .then((res) => {
        let x = Object.values(res.data)[0] as MTRApiData;
        let arrivalData: ArrivalData = {
          sta,
          down_dest: null,
          down_estimate_time: 0,
          up_dest: null,
          up_estimate_time: 0,
        };

        if (x.UP !== undefined) {
          arrivalData.up_dest = getStationNameFromStationID(x.UP[0].dest);
          arrivalData.up_estimate_time = Math.round(
            (+new Date(x.UP[0].time) - +new Date(x.curr_time)) / 1000 / 60
          );
        }

        if (x.DOWN !== undefined) {
          arrivalData.down_dest = getStationNameFromStationID(x.DOWN[0].dest);
          arrivalData.down_estimate_time = Math.round(
            (+new Date(x.DOWN[0].time) - +new Date(x.curr_time)) / 1000 / 60
          );
        }

        setIsLoading(false);

        return arrivalData;
      });
  }, []);

  const checkLineQuantity = useCallback(
    (selectedSta: string) => {
      let lineList: Array<StationData> = mtrLoction.filter(
        ({ sta }) => sta === selectedSta
      );

      setArrivalData({
        sta: selectedSta,
        down_dest: null,
        down_estimate_time: 0,
        up_dest: null,
        up_estimate_time: 0,
      });

      if (lineList.length > 1) {
        setIsMultipeLine(true);
        setLinesData(lineList);
      } else {
        setIsMultipeLine(false);
      }

      checkEstimateTime(lineList[0].line, selectedSta).then(setArrivalData);
    },
    [checkEstimateTime]
  );

  function getStationNameFromStationID(stationID: string) {
    return (
      mtrLoction.find(({ sta }) => {
        return stationID === sta;
      })?.sta_name ?? null
    );
  }

  useEffect(() => {
    checkLineQuantity(sta);
  }, [checkLineQuantity, sta]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-4 md:p-5 rounded-t">
        <h3 className="text-lg font-semibold text-gray-900">
          {getStationNameFromStationID(sta)}
        </h3>
      </div>
      {isMultipeLines && (
        <select
          className="border border-gray-300 text-sm rounded-lg w-full p-2.5 focus:ring-blue-500 focus:border-blue-500"
          onChange={(e) =>
            checkEstimateTime(e.target.value, sta).then(setArrivalData)
          }
        >
          {LinesData.map(({ line, line_name }) => (
            <option value={line}>{line_name}</option>
          ))}
        </select>
      )}
      {isLoading ? (
        <div className="flex items-center justify-center text-center h-80">
          <div role="status">
            <svg
              aria-hidden="true"
              className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="p-4 md:p-5">
          <ol className="relative ms-3.5 mb-4 md:mb-5">
            {arrivalData?.up_dest && (
              <li className="mb-4 ms-8 border-b-4 border-black">
                <span className="absolute flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full -start-3.5 ring-8 ring-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="1em"
                    viewBox="0 0 384 512"
                  >
                    <path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" />
                  </svg>
                </span>
                <h3 className="flex items-start mb-1 text-lg font-semibold text-gray-900">
                  {arrivalData?.up_dest}
                </h3>
                <span className="absolute flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full -start-3.5 ring-8 ring-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="1em"
                    viewBox="0 0 512 512"
                  >
                    <path d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z" />
                  </svg>
                </span>
                <h3 className="flex items-start mb-1 text-lg font-semibold text-gray-900">
                  The next train is scheduled to arrive in{" "}
                  {arrivalData?.up_estimate_time} min
                </h3>
              </li>
            )}
            {arrivalData?.down_dest && (
              <li className="ms-8">
                <span className="absolute flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full -start-3.5 ring-8 ring-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="1em"
                    viewBox="0 0 384 512"
                  >
                    <path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" />
                  </svg>
                </span>
                <h3 className="flex items-start mb-1 text-lg font-semibold text-gray-900">
                  {arrivalData?.down_dest}
                </h3>
                <span className="absolute flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full -start-3.5 ring-8 ring-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="1em"
                    viewBox="0 0 512 512"
                  >
                    <path d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z" />
                  </svg>
                </span>
                <h3 className="flex items-start mb-1 text-lg font-semibold text-gray-900">
                  The next train is scheduled to arrive in{" "}
                  {arrivalData?.down_estimate_time} min
                </h3>
              </li>
            )}
          </ol>
        </div>
      )}
    </div>
  );
}

export default StationInformation;
