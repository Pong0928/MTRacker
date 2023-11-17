import { useEffect, useState } from 'react';
import mtrLoction from '../../src/json/mtr_location.json'; 

interface NextStaionProps {
    sta: string,
}

export interface StationData {
    line: string
    line_name: string
    sta: string
    sta_name: string
    latitude: number
    longitude: number
  }
  
  export interface ArrivalData {
    sta: string
    up_dest: string | null
    up_estimate_time: number
    down_dest: string | null
    down_estimate_time: number
  }
  
  export interface MTRApiUpNDownData {
    dest: string
    plat: string
    seq: string
    source: string
    time: string
    ttnt: string
    valid: string
  }
  
  export interface MTRApiData {
    DOWN: MTRApiUpNDownData[]
    UP: MTRApiUpNDownData[]
    curr_time: string
    sys_time: string
  }

function StatinoInformation({ sta }: NextStaionProps){

    const [isMultipeLines, setIsMultipeLine] = useState(false)
    const [LinesData, setLinesData] = useState<StationData[]>([])
    const [arrivalData, setArrivalData] = useState<ArrivalData>()

    function checkLineQuantity(selectedSta:string) {
      let lineList: Array<StationData> = mtrLoction.filter(({ sta }) => sta === selectedSta)
  
      setArrivalData({
        sta: selectedSta,
        down_dest: null,
        down_estimate_time: 0,
        up_dest: null,
        up_estimate_time: 0
      })
  
      if(lineList.length > 1) {
        setIsMultipeLine(true)
        setLinesData(lineList)
      } else {
        setIsMultipeLine(false)
      }
  
      checkEstimateTime(lineList[0].line, selectedSta).then(setArrivalData)
    }
    
    function getStationNameFromStationID(stationID: string) {
      return mtrLoction.find(({ sta }) => {
        return stationID === sta
      })?.sta_name ?? null
    }
    
    function checkEstimateTime(line: string, sta: string) {
      return fetch(`https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=${line}&sta=${sta}`)
        .then((res) => res.json())
        .then((res) => {
          let x = Object.values(res.data)[0] as MTRApiData;
          let arrivalData: ArrivalData = {
              sta,
              down_dest: null,
              down_estimate_time: 0,
              up_dest: null,
              up_estimate_time: 0
          };
  
          if(x.UP !== undefined) {
            arrivalData.up_dest = getStationNameFromStationID(x.UP[0].dest)
            arrivalData.up_estimate_time = Math.round((+new Date(x.UP[0].time) - +new Date(x.curr_time)) / 1000 / 60)
          }
  
          if(x.DOWN !== undefined) {
            arrivalData.down_dest = getStationNameFromStationID(x.DOWN[0].dest)
            arrivalData.down_estimate_time = Math.round((+new Date(x.DOWN[0].time) - +new Date(x.curr_time)) / 1000 / 60)
          }
  
          return arrivalData
        })
    }

    useEffect(() => 
    {
      checkLineQuantity(sta);
    },[checkLineQuantity, sta])

    return (
        <div className='w-full'>
            <div className="flex items-center justify-between p-4 md:p-5 rounded-t">
                <h3 className="text-lg font-semibold text-gray-900">
                    {getStationNameFromStationID(sta)}
                </h3>
            </div>
            { isMultipeLines && <select className="border border-gray-300 text-sm rounded-lg w-full p-2.5 focus:ring-blue-500 focus:border-blue-500" onChange={(e) => checkEstimateTime(e.target.value, sta).then(setArrivalData)}>
            {LinesData.map(({line, line_name}) => (
                <option value={line}>{line_name}</option>
            ))}
            </select>
            }
            <div className="p-4 md:p-5">
                <ol
                    className="relative border-s border-gray-200 dark:border-gray-600 ms-3.5 mb-4 md:mb-5">
                    { arrivalData?.up_dest &&
                    <li className="mb-10 ms-8">
                        <span
                            className="absolute flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full -start-3.5 ring-8 ring-white">
                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>
                        </span>
                        <h3 className="flex items-start mb-1 text-lg font-semibold text-gray-900">{arrivalData?.up_dest}</h3>
                        <span
                            className="absolute flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full -start-3.5 ring-8 ring-white">
                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/></svg>
                        </span>
                        <h3 className="flex items-start mb-1 text-lg font-semibold text-gray-900">The next train is scheduled to arrive in {arrivalData?.up_estimate_time} min</h3>
                    </li>
                    }
                    { arrivalData?.down_dest &&
                    <li className="mb-10 ms-8">
                        <span
                            className="absolute flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full -start-3.5 ring-8 ring-white">
                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>
                        </span>
                        <h3 className="flex items-start mb-1 text-lg font-semibold text-gray-900">{arrivalData?.down_dest}</h3>
                        <span
                            className="absolute flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full -start-3.5 ring-8 ring-white">
                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/></svg>
                        </span>
                        <h3 className="flex items-start mb-1 text-lg font-semibold text-gray-900">The next train is scheduled to arrive in {arrivalData?.down_estimate_time} min</h3>
                    </li>
                    }
                </ol>
            </div>
        </div>
    )

}



export default StatinoInformation;