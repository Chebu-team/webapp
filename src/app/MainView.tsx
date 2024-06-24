"use client";
import React, {useEffect, useState} from "react";
import Navbar from "@/components/Navbar";
import "../css/style.css";
import NetworkModal from "@/components/NetworkModal";
import Footbar from "@/components/Footbar";
import Socialbar from "@/components/Socialbar";
import { useData } from "@/context/DataContext";
import NetSelectModal from "@/components/NetSelectModal";
import Theme from "../theme";
import {
    useBalance,
    useAccount,
    useReadContract,
    useWriteContract,
    useWaitForTransactionReceipt,
    useSwitchChain
} from 'wagmi'

import config from "@/config/general";
import Counter from "@/components/Counter";
import {useWeb3Modal} from "@web3modal/wagmi/react";
import {ToastContainer, toast} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {bsc, mainnet, sepolia} from "wagmi/chains";
import {createPublicClient, http, parseAbiItem, parseEventLogs} from 'viem'
import BigNumber from "bignumber.js";


const client= createPublicClient({
    chain: sepolia,
    transport: http(),
})

const defaultTransaction = {
    amountUSD: '0',
    amountChebu: '0',
    amountSol: '0'
}

export default function App() {
    const [viewMode, setViewMode] = useState(true);
    const { address: walletAddress, isConnecting, isDisconnected, chain: walletChain } = useAccount()
    const [spendCountChebu, setSpendCountChebu] = useState(0)
    const { open } = useWeb3Modal()
    const [toastId, setToastId] = useState<any>(null)
    const [buyToastId, setBuyToastId] = useState<any>(0)
    const [sellToastId, setSellToastId] = useState<any>(0)
    const [deals, setDeals] = useState({sell:[defaultTransaction,defaultTransaction,defaultTransaction], buy:[defaultTransaction,defaultTransaction,defaultTransaction]})
    const {switchChain} = useSwitchChain()

    const getNormalValue = (num: bigint, decimals: number, format: number) => {
        const x = new BigNumber(num.toString())
        const y = new BigNumber(decimals)
        return(x.div(y).toFormat(format))
    }

    const getDeals = async () => {
        const blockNumber = await client.getBlockNumber()
        const logs = await client.getLogs({
            address: config.chebuAddress,
            fromBlock: blockNumber - BigInt(30000),
            toBlock: blockNumber
        })

        const res = parseEventLogs({
            logs,
            abi: config.chebuAbi,
            eventName: 'Deal'
        })

       const normalizedRes = res.reduce((acc: any, item) => {
           // @ts-ignore
           if(item.args.assetIn === config.chebuAddress){
               acc.sell.push({
                   // @ts-ignore
                   amountUSD: getNormalValue(item.args.amountOut, config.decimalTradeToken, 3),
                   // @ts-ignore
                   amountChebu: getNormalValue(item.args.amountIn, config.decimalChebu, 0),
                   // @ts-ignore
                   amountSol: getNormalValue(item.args.amountOut, config.decimalTradeToken*132, 5)
               })
           } else {
               acc.buy.push({
                   // @ts-ignore
                   amountUSD: getNormalValue(item.args.amountIn, config.decimalTradeToken, 3),
                   // @ts-ignore
                   amountChebu: getNormalValue(item.args.amountOut, config.decimalChebu, 0),
                   // @ts-ignore
                   amountSol: getNormalValue(item.args.amountIn, config.decimalTradeToken*132, 5)
               })
           }
           return acc
       }, {sell: [], buy:[]})

        normalizedRes.sell = normalizedRes.sell.sort((a: any,b: any) => {
            if(a.amountUSD < b.amountUSD) return -1
            if(a.amountUSD > b.amountUSD) return 1
            return 0
        }).reverse()
        normalizedRes.buy = normalizedRes.buy.sort((a: any,b: any) => {
            if(a.amountUSD < b.amountUSD) return -1
            if(a.amountUSD > b.amountUSD) return 1
            return 0
        }).reverse()

        return normalizedRes
    }

    useEffect(() => {
        getDeals().then(item => {
            setDeals(item)
        })
        const interval = setInterval(() => {
            getDeals().then(item => {
                setDeals(item)
            })
        }, 60*1000)
        return () => {
            clearInterval(interval)
        }
    }, []);

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

    const balanceChebu = useBalance({
        address: walletAddress,
        token: config.chebuAddress
    })


    const tradeToken = useReadContract({
        abi: config.chebuAbi,
        address: config.chebuAddress,
        functionName: 'tradeToken',
    })

    const {data: conversionRateForOneDollar, isPending, status} = useReadContract({
        abi: config.chebuAbi,
        address: config.chebuAddress,
        functionName: 'calcMintTokensForExactStable',
        args:[config.decimalTradeToken],
    })
    // @ts-ignore
    const chebuToDollar = conversionRateForOneDollar ? parseFloat((Number(conversionRateForOneDollar[0])/config.decimalChebu + Number(conversionRateForOneDollar[1])/config.decimalChebu).toFixed(2)) : 4715
    // @ts-ignore
    const chebuToDollar2 = conversionRateForOneDollar ? BigNumber(conversionRateForOneDollar[0]).dividedBy(BigInt(config.decimalChebu)).plus(BigNumber(conversionRateForOneDollar[1]).dividedBy(BigNumber(config.decimalChebu))) : BigNumber(4715)

    const balanceTradeToken = useBalance({
        address: walletAddress,
        token: tradeToken.data as any
    })

    const {data: allowanceData, refetch: refetchAllowance, isLoading: isAllowanceLoading, isFetching: isAllowanceFetching, status: allowanceStatus, isPending: isAllowancePending}: any = useReadContract({
        abi: config.tetherAbi,
        address: tradeToken.data as any,
        functionName: 'allowance',
        args: [walletAddress, config.chebuAddress]
    })

    const allowance = allowanceData || 0
    const allowanceWithDecimals = Number(allowance)/config.decimalTradeToken

    const roundWithDecimals = (number: string) => (Math.round(Number((parseFloat(number)*1000).toFixed(2)))/100).toString()
    const roundWithDecimals2 = (number: string) => (Math.round(Number((parseFloat(number)*1000).toFixed(2)))/100).toString()

    const { writeContract: sellChebu, isPending: isSellPending, data: sellHash,} = useWriteContract()
    const { writeContract: buyChebu, isPending: isChebuBuyPending, data: buyChebuHash} = useWriteContract()
    const { writeContract: approveTradeToken, isPending: approvePending, data: approveTradeTokenHash } = useWriteContract()

    const {isSuccess: isSellDone } = useWaitForTransactionReceipt({
        hash: sellHash,
        pollingInterval: 1_000
    })
    const {isSuccess: isApproveDone } = useWaitForTransactionReceipt({
        hash: approveTradeTokenHash,
        pollingInterval: 1_000
    })
    const {isSuccess: isBuyDone, isFetched: fet } = useWaitForTransactionReceipt({
        hash: buyChebuHash,
        pollingInterval: 1_000
    })

    useEffect(() => {
        if(sellHash && !isSellDone){
            setSellToastId(toast.loading('Transaction in progress'))
        }
        if(isSellDone) {
            balanceTradeToken.refetch()
            balanceChebu.refetch()
            toast.update(sellToastId || 0, { render: "SELL Confirmed!", type: "success", isLoading: false, autoClose: 2000 });
            setSellToastId(null)
        }
    }, [isSellDone, sellHash]);

    useEffect(() => {
        if(approveTradeTokenHash && !isApproveDone){
            setToastId(toast.loading('Waiting for approve'))
        }
        if(isApproveDone) {
            toast.update(toastId || 0, { render: "Approve confirmed!", type: "success", isLoading: false, autoClose: 2000 });
            setToastId(null)
            buyChebu({
                abi: config.chebuAbi,
                address: config.chebuAddress,
                functionName: 'mintTokensForExactStable',
                args: [BigNumber(spendCountChebu).dividedBy(BigNumber(chebuToDollar2).multipliedBy(BigNumber(config.decimalTradeToken)))]
            })
        }
    }, [isApproveDone, approveTradeTokenHash]);

    useEffect(() => {
        if(buyChebuHash && !isBuyDone){
            setBuyToastId(toast.loading('Transaction processing'))
        }
        if(isBuyDone){
            toast.update(buyToastId || 0, { render: "Purchase confirmed!", type: "success", isLoading: false, autoClose: 2000 });
            balanceTradeToken.refetch()
            balanceChebu.refetch()
        }
    }, [isBuyDone, buyChebuHash]);

    const chainName = ["black", "solana", "binance", "ethereum"];
    const context = useData();
    if (!context) {
        throw new Error("useData must be used within a DataProvider");
    }

    const { chain, setChain } = context;
    const [visibleMenuModal, setVisibleMenuModal] = useState(false);

    return (
        <div
            style={{backgroundColor: Theme[chainName[chain] as keyof typeof Theme].bg}}
            className={`w-full min-h-[100vh] ${Theme[chainName[chain] as keyof typeof Theme].backgroundColor}`}
        >
            {/*@ts-ignore*/}
            {/*<p className='fixed top-[100px] left-1/3 z-50 text-white'>{status} {allowanceWithDecimals} {chebuToDollar}</p>*/}
            <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
            {visibleMenuModal ? (
                <NetSelectModal
                    onCloseClicked={() => {
                        setVisibleMenuModal(false);
                    }}
                />
            ) : (
                <div className='relative'>
                    {/* Website Landing */}
                    <div className="absolute top-0 left-0 pointer-events-none">
                        <img src={Theme[chainName[chain] as keyof typeof Theme].effect}/>
                    </div>
                    <div className="fixed bottom-0 right-0 pointer-events-none">
                        <img src={Theme[chainName[chain] as keyof typeof Theme].bottomBlur2}
                        />
                    </div>
                    {/* WebSite Container */}
                    <div className="relative max-w-[1440px] w-full m-auto min-h-[100vh] overflow-hidden flex flex-col">
                        <Navbar onMenuClicked={setVisibleMenuModal}/>
                        <div
                            className="grow w-full flex px-[71px] flex-row justify-between items-center md:flex-col md:items-center md:p-[16px] md:gap-5">
                            <div className='flex justify-center grow'>
                                <div className=''>
                                    <img
                                        className='md:h-auto h-[17vh]'
                                        src={Theme[chainName[chain] as keyof typeof Theme].title}
                                    />
                                    <img
                                        className='md:h-auto h-[50vh]'
                                        src={Theme[chainName[chain] as keyof typeof Theme].hero}
                                    />
                                </div>
                            </div>
                            <div className="hidden md:block cursor-pointer">
                                {chain === 0 ? (
                                    <div onClick={() => {
                                        window.scrollTo({
                                            top: document.body.scrollHeight,
                                            behavior: 'smooth'
                                    });
                                    }}>
                                        <p className="text-[#BBBBBB]">Choose Network</p>
                                    </div>
                                ) : (
                                    <div
                                        className="flex flex-row gap-[13px]"
                                        onClick={() => {
                                            window.scrollTo({
                                                top: document.body.scrollHeight,
                                                behavior: 'smooth'
                                            });
                                            setViewMode(true);
                                        }}
                                    >
                                        <p className="text-[#BBBBBB]">View Price</p>
                                        <img src="./assets/button/ScrollDown.svg"/>
                                    </div>
                                )}
                            </div>
                            {chain === 0 ? (
                                <div className="flex flex-col gap-3 pr-[50px] md:hidden md:pr-0">
                                    <p className="text-[32px] text-white select-none md:hidden">
                                        Choose your Chebu
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 md:grid-cols-1 md:grid md:gap-[14px] md:w-full">
                                        <NetworkModal chain="ethereum" onClick={null}/>
                                        <NetworkModal chain="solana" onClick={null}/>
                                        <NetworkModal chain="binance" onClick={null}/>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className={`flex flex-col gap-[16px] p-6 buysell-modal md:w-full ${chain ? chainName[chain] : ""
                                    } ${viewMode ? "" : "md:hidden"}`}
                                >
                                    <table className="price-table">
                                        <tr className="table-row-head">
                                            <td className="text-left">Price (SOL)</td>
                                            <td className="text-center">Amount (Chebu)</td>
                                            <td className="text-right">Amount (USD)</td>
                                        </tr>
                                        <tr className="table-row-item-red">
                                            {/*@ts-ignore*/}
                                            <td className="text-left">{deals.sell[3]?.amountSol || 0}</td>
                                            {/*@ts-ignore*/}
                                            <td className="text-center">{deals.sell[3]?.amountChebu || 0}</td>
                                            {/*@ts-ignore*/}
                                            <td className="text-right text-white">{deals.sell[3]?.amountUSD || 0}</td>
                                        </tr>
                                        <tr className="table-row-item-red">
                                            {/*@ts-ignore*/}
                                            <td className="text-left">{deals.sell[2]?.amountSol || 0}</td>
                                            {/*@ts-ignore*/}
                                            <td className="text-center">{deals.sell[2]?.amountChebu || 0}</td>
                                            {/*@ts-ignore*/}
                                            <td className="text-right text-white">{deals.sell[2]?.amountUSD || 0}</td>
                                        </tr>
                                        <tr className="table-row-item-red">
                                            {/*@ts-ignore*/}
                                            <td className="text-left">{deals.sell[1]?.amountSol || 0}</td>
                                            {/*@ts-ignore*/}
                                            <td className="text-center">{deals.sell[1]?.amountChebu || 0}</td>
                                            {/*@ts-ignore*/}
                                            <td className="text-right text-white">{deals.sell[1]?.amountUSD || 0}</td>
                                        </tr>
                                        <tr className="table-row-item-selected">
                                            {/*@ts-ignore*/}
                                            <td className="text-left">{deals.sell[0]?.amountSol || 0}</td>
                                            {/*@ts-ignore*/}
                                            <td className="text-center">{deals.sell[0]?.amountChebu || 0}</td>
                                            {/*@ts-ignore*/}
                                            <td className="text-right text-white">{deals.sell[0]?.amountUSD || 0}</td>
                                        </tr>
                                        <tr className="table-row-item-green">
                                            {/*@ts-ignore*/}
                                            <td className="text-left">{deals.buy[0]?.amountSol || 0}</td>
                                            {/*@ts-ignore*/}
                                            <td className="text-center">{deals.buy[0]?.amountChebu || 0}</td>
                                            {/*@ts-ignore*/}
                                            <td className="text-right text-white">{deals.buy[0]?.amountUSD || 0}</td>
                                        </tr>
                                        <tr className="table-row-item-green">
                                            {/*@ts-ignore*/}
                                            <td className="text-left">{deals.buy[1]?.amountSol || 0}</td>
                                            {/*@ts-ignore*/}
                                            <td className="text-center">{deals.buy[1]?.amountChebu || 0}</td>
                                            {/*@ts-ignore*/}
                                            <td className="text-right text-white">{deals.buy[1]?.amountUSD || 0}</td>
                                        </tr>
                                        <tr className="table-row-item-green">
                                            {/*@ts-ignore*/}
                                            <td className="text-left">{deals.buy[2]?.amountSol || 0}</td>
                                            {/*@ts-ignore*/}
                                            <td className="text-center">{deals.buy[2]?.amountChebu || 0}</td>
                                            {/*@ts-ignore*/}
                                            <td className="text-right text-white">{deals.buy[2]?.amountUSD || 0}</td>
                                        </tr>
                                    </table>
                                    <div className='flex flex-col gap-[4px]'>
                                        <Counter count={spendCountChebu} setCount={setSpendCountChebu}/>
                                        <div className='mb-[6px]'>
                                            <p className="text-[#CCC] pl-3 mb-[4px] block">Your balance</p>
                                            <div className="rounded-[16px] w-full bg-[#141515]">
                                                <div
                                                    className="flex flex-row justify-between items-center w-full text-[16px] p-5">
                                                    <div className="flex flex-row gap-[5px] w-1/2 truncate">
                                                        {/*@ts-ignore*/}
                                                        <p className="text-[#E4E4E4] truncate">{balanceChebu.data?.value ? BigNumber(balanceChebu.data.value).div(BigNumber(config.decimalChebu)).toFormat(0) : 0}</p>
                                                        <p className="text-[#797489] mr-[5px]">Chebu</p>
                                                    </div>
                                                    <div className="flex flex-row gap-[5px] w-1/2 truncate">
                                                        {/*@ts-ignore*/}
                                                        <p className="text-[#E4E4E4] truncate">{balanceTradeToken.data?.value ? BigNumber(balanceTradeToken.data.value).div(BigNumber(config.decimalTradeToken)).toFormat(2) : 0}</p>
                                                        <p className="text-[#797489] mr-[5px]">USD</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className="w-full rounded-full flex flex-row text-white text-[16px] overflow-hidden border-[#0A0A0A] border-4 relative">
                                            <button
                                                className={`${isAllowanceFetching || isChebuBuyPending || approvePending ? 'opacity-30' : ''} w-full bg-[#21DB60] flex justify-center items-center p-3 cursor-pointer hover:bg-green-600 hover:scale-105 hover:shadow-lg transition duration-300 ease-in-out`}
                                                disabled={isAllowanceFetching || isChebuBuyPending || approvePending}
                                                onClick={async () => {
                                                    if (!walletAddress) {
                                                        open()
                                                        return
                                                    }
                                                    const {data: currAllowance} = await refetchAllowance()
                                                    if (currAllowance < spendCountChebu / chebuToDollar * config.decimalTradeToken) {
                                                        approveTradeToken({
                                                            abi: config.tetherAbi,
                                                            address: tradeToken.data as any,
                                                            functionName: 'approve',
                                                            args: [
                                                                config.chebuAddress,
                                                                Math.ceil(spendCountChebu / chebuToDollar * 100) / 100 * config.decimalTradeToken
                                                            ]
                                                        })
                                                        return
                                                    }
                                                    buyChebu({
                                                        abi: config.chebuAbi,
                                                        address: config.chebuAddress,
                                                        functionName: 'mintTokensForExactStable',
                                                        args: [Math.round(spendCountChebu / chebuToDollar * config.decimalTradeToken)]
                                                    })
                                                }}>
                                                <p>{isChebuBuyPending || approvePending || isAllowanceFetching ? 'Loading...' : 'BUY'}</p>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (!walletAddress) {
                                                        open()
                                                        return
                                                    }
                                                    sellChebu({
                                                        abi: config.chebuAbi,
                                                        address: config.chebuAddress,
                                                        functionName: 'burnExactTokensForStable',
                                                        args: [spendCountChebu * config.decimalChebu]
                                                    })
                                                }}
                                                className={`${isSellPending && 'opacity-30'} w-full bg-[#FF2A2A] flex justify-center items-center p-3 cursor-pointer hover:bg-red-600 hover:scale-105 hover:shadow-lg transition duration-300 ease-in-out`}>
                                                <p>{isSellPending ? 'Loading...' : 'SELL'}</p>
                                            </button>
                                            <div className="boost-middle-btn flex justify-center items-center">
                                                <img
                                                    src={
                                                        Theme[chainName[chain] as keyof typeof Theme].herohead
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={`${viewMode ? "" : "md:hidden"}`}>
                            <Footbar/>
                            {chain === 0 && <div className="hidden md:grid gap-[14px] p-[16px]">
                                <NetworkModal chain="ethereum" onClick={() => changeChain('Ethereum')}/>
                                <NetworkModal chain="solana" onClick={() => changeChain('Solana')}/>
                                <NetworkModal chain="binance" onClick={() => changeChain('Binance')}/>
                            </div>}
                        </div>
                    </div>
                    <div className={`${viewMode ? "md:p-[26px]" : "md:hidden"}`}>
                        <Socialbar/>
                    </div>
                </div>
            )}
        </div>
    );
}
