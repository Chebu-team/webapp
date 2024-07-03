'use client'
import React from 'react';
import Link from "next/link";
import NetworkModal from "@/components/NetworkModal";
import {bsc, mainnet, sepolia} from "wagmi/chains";
import {useReadContract, useSwitchChain} from "wagmi";
import config from "@/config/general";

const MobileMenu = ({chainName, onClose}:{chainName: string, onClose: () => void}) => {
    const {switchChain} = useSwitchChain()
    const changeChain = (name: string) => {
        switch (name) {
            case 'Solana' :
                switchChain({chainId: sepolia.id})
                break;
            case 'Ethereum' :
                switchChain({chainId: mainnet.id})
                break;
            case 'Binance' :
                switchChain({chainId:bsc.id})
                break
        }
    }

    const onChainClick = (name: string) => {
        changeChain(name)
        onClose()
    }

    const {data: tvlEther}: any = useReadContract({
        abi: config.tetherAbi,
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        functionName: 'balanceOf',
        args: [config.chebuAddress[3]]
    })

    return (
        <div className='fixed left-0 top-0 z-50 w-[100vw] h-[100vh] bg-[#121216] pt-[8px] px-[15px]'>
            <div className='relative flex w-full justify-center mb-[32px]'>
                <img
                    className="w-[54.22px] h-[44.62px]"
                    src={`./assets/theme/${chainName}/TitleLogo.svg`}
                    alt='titleLogo'
                />
                <button onClick={onClose} className='absolute right-0 top-1/2 -translate-y-1/2'>
                    <img src="/assets/button/CloseButton.svg" alt="close" className='w-[24px] h-[24px]'/>
                </button>
            </div>
            <div className='flex justify-center w-full mb-[22px]'>
                <Link href='/about'
                      className='text-white w-[172px] py-[13px] bg-[#050505] text-center rounded-full text-[15px]'>How it
                    works</Link>
            </div>
            <div className="grid grid-cols-1 gap-[14px]">
                <NetworkModal tvl={tvlEther} chain="ethereum" onClick={() => onChainClick('Ethereum')}/>
                <NetworkModal chain="solana" onClick={() => onChainClick('Solana')}/>
                <NetworkModal chain="binance" onClick={() => onChainClick('Binance')}/>
            </div>
        </div>
    );
};

export default MobileMenu;