/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";

const OfferTimer = ({endDate}) => {

    const [timerDays, setTimerDays] = useState('00');
    const [timerHours, setTimerHours] = useState('00');
    const [timerMinutes, setTimerMinutes] = useState('00');
    const [timerSeconds, setTimerSeconds] = useState('00');

    const interval = useRef();

    const startTimer = () => {
        const countdownDate = new Date(endDate).getTime();

        interval.current = setInterval(()=>{
            let nowTime = new Date().getTime();
            let distance = countdownDate - nowTime;

            const days = Math.floor(distance/(24*60*60*1000)),
            hours = Math.floor((distance % (24*60*60*1000))/(60*60*1000)),
            minutes = Math.floor((distance % (60*60*1000))/(60*1000)),
            seconds = Math.floor((distance % (60*1000)) / (1000));

            if(distance < 0){
                clearInterval(interval.current);
                setTimerDays('00');
                setTimerHours('00');
                setTimerMinutes('00');
                setTimerSeconds('00');
            }else{
                setTimerDays(days < 10 ? `0${days}` : days);
                setTimerHours(hours < 10 ? `0${hours}` : hours);
                setTimerMinutes(minutes < 10 ? `0${minutes}` : minutes);
                setTimerSeconds(seconds < 10 ? `0${seconds}` : seconds);
            }
        },1000)
    };


    useEffect(()=>{
        startTimer();
        return()=>{
            clearInterval(interval.current)
        };
    }, [endDate]);

  return (
    <>
      <p className="text-xs sm:text-sm md:text-[14px] font-semibold tracking-wide text-[#343434]">
        HURRY UP! OFFER END IN:
      </p>

      <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <div className="h-14 w-14 sm:h-16 sm:w-16 md:h-17 md:w-17 text-center flex flex-col justify-center rounded-[10px] bg-[#EDEDED]">
          <h1 className="text-base sm:text-lg md:text-[20px] font-medium">{timerDays}</h1>
          <p className="text-[10px] sm:text-[11px] md:text-[12px] text-[#4d4d4d]">Days</p>
        </div>
        <div className="h-14 w-14 sm:h-16 sm:w-16 md:h-17 md:w-17 text-center flex flex-col justify-center rounded-[10px] bg-[#EDEDED]">
          <h1 className="text-base sm:text-lg md:text-[20px] font-medium">{timerHours}</h1>
          <p className="text-[10px] sm:text-[11px] md:text-[12px] text-[#4d4d4d]">Hours</p>
        </div>
        <div className="h-14 w-14 sm:h-16 sm:w-16 md:h-17 md:w-17 text-center flex flex-col justify-center rounded-[10px] bg-[#EDEDED]">
          <h1 className="text-base sm:text-lg md:text-[20px] font-medium">{timerMinutes}</h1>
          <p className="text-[10px] sm:text-[11px] md:text-[12px] text-[#4d4d4d]">Min</p>
        </div>
        <div className="h-14 w-14 sm:h-16 sm:w-16 md:h-17 md:w-17 text-center flex flex-col justify-center rounded-[10px] bg-[#EDEDED]">
          <h1 className="text-base sm:text-lg md:text-[20px] font-medium">{timerSeconds}</h1>
          <p className="text-[10px] sm:text-[11px] md:text-[12px] text-[#4d4d4d]">Sec</p>
        </div>
      </div>
    </>
  );
};

export default OfferTimer;
