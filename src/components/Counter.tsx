import React, {useEffect, useRef, useState} from 'react';
import { NumericFormat } from 'react-number-format';

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
    return (
        <div>
            <span className='pl-3 text-[#CCC] mb-[4px] block'>Amount Chebu</span>
            <div className='p-[18px] bg-[#131925] flex justify-between text-white rounded-[16px]'>
                <button className='h-[24px] cursor-pointer' onClick={() => {
                    if(count < 1) return
                    setCount(count-1)
                }}>
                    <span>-</span>
                </button>
                <NumericFormat
                    type="text"
                    className='text-[16px] bg-transparent border-none outline-none text-center'
                    onChange={(event) => {
                        console.log(event.target.value)
                        setCurr(event.target.value)
                    }}
                    value={curr}
                    thousandsGroupStyle="thousand"
                    thousandSeparator=","
                />
                {/*<label>*/}
                {/*    /!*<p className='text-[16px] bg-transparent border-none outline-none text-center'>{count ? count.toLocaleString('en') : '0'}</p>*!/*/}
                {/*    <input type='number'*/}
                {/*                         className='text-[16px] bg-transparent border-none outline-none text-center '*/}
                {/*                         onChange={(event) => {*/}
                {/*                             setCount(parseInt(event.target.value))*/}
                {/*                         }} value={count}></input>*/}
                {/*</label>*/}

                <button className='h-[24px]' onClick={() => {
                    setCount(count + 1)
                }}>
                    <span>+</span>
                    <span></span>
                </button>
            </div>
        </div>
    );
};

export default Counter;