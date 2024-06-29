import React, {useEffect, useRef, useState} from 'react';
import { NumericFormat } from 'react-number-format';
import {strings} from "@/utils/strings";

type CounterProps = {
    count: number;
    setCount: (count: number) => void
}
const Counter = (props: CounterProps) => {
    const {count, setCount} = props
    const [curr, setCurr] = useState('0')

    useEffect(() => {
        setCount(parseInt(curr.replaceAll(',','')))
    }, [curr]);

    const change = (incr: number) => {
        const num = strings.addCommas((parseInt(curr.replaceAll(',', ''))+incr).toString())
        setCurr(num)
    }

    const substract = () => {

    }

    return (
        <div>
            <span className='pl-3 text-[#CCC] mb-[4px] block'>Amount Chebu</span>
            <div className='p-[18px] bg-[#131925] flex justify-between text-white rounded-[16px]'>
                <button className='h-[24px] cursor-pointer' onClick={() => {
                    if(count < 1) return
                    change(-1)
                }}>
                    <span>-</span>
                </button>
                <NumericFormat
                    type="text"
                    className='text-[16px] bg-transparent border-none outline-none text-center'
                    onChange={(event) => {
                        setCurr(event.target.value)
                    }}
                    value={curr}
                    thousandsGroupStyle="thousand"
                    thousandSeparator=","
                />

                <button className='h-[24px]' onClick={() => {
                    change(1)
                }}>
                    <span>+</span>
                    <span></span>
                </button>
            </div>
        </div>
    );
};

export default Counter;