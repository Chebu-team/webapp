import React from 'react';
import Link from "next/link";
import NetworkModal from "@/components/NetworkModal";

const MobileMenu = ({chainName, onClose}:{chainName: string, onClose: () => void}) => {
    return (
        <div className='fixed left-0 top-0 z-50 w-[100vw] h-[100vh] bg-[#121216] pt-[8px] px-[15px]'>
            <div className='relative flex w-full justify-center mb-[32px]'>
                <img
                    className="w-[54.22px] h-[44.62px]"
                    src={`./assets/theme/${chainName}/TitleLogo.svg`}
                />
                <button onClick={onClose} className='absolute right-0 top-1/2 -translate-y-1/2'>
                    <img src="/assets/button/CloseButton.svg" alt="" className='w-[24px] h-[24px]'/>
                </button>
            </div>
            <div className='flex justify-center w-full mb-[22px]'>
                <Link href='/about'
                      className='text-white w-[172px] py-[13px] bg-[#050505] text-center rounded-full text-[15px]'>How it
                    works</Link>
            </div>
            <div className="grid grid-cols-1 gap-[14px]">
                <NetworkModal chain="ethereum" onClick={null}/>
                <NetworkModal chain="solana" onClick={null}/>
                <NetworkModal chain="binance" onClick={null}/>
            </div>
        </div>
    );
};

export default MobileMenu;