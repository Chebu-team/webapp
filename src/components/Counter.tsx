import React from 'react';

type CounterProps = {
    count: number;
    setCount: (count: number) => void
}
const Counter = (props: CounterProps) => {
    const {count, setCount} = props
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
                <input type='number' className='text-[16px] bg-transparent border-none outline-none text-center' onChange={(event) => {setCount(parseInt(event.target.value))}} value={count}></input>
                <button className='h-[24px]' onClick={() => {
                    setCount(count+1)
                }}>
                    <span>+</span>
                    <span></span>
                </button>
            </div>
        </div>
    );
};

export default Counter;