import React from 'react';

interface NextStaionProps {
  // Define your component's props here
  upArrivalTime: string,
  downArrivalTime: String;
}

function NextStaion({ upArrivalTime, downArrivalTime }: NextStaionProps): JSX.Element {
  return (
    <div className='absolute rounded bottom-36 h-20 left-1/2 -translate-x-1/2 w-96 z-50 bg-white/75 mx-auto flex flex-col justify-center items-center'>
      <div className='text-2xl'>Hello, {upArrivalTime}!</div>
      <div className='text-2xl'>Hello, {downArrivalTime}!</div>
    </div>
  );
}

export default NextStaion;