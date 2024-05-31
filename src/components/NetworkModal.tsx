import { propagateServerField } from "next/dist/server/lib/render-server";
import { useData } from "@/context/DataContext";

interface NetworkModalProps {
  chain: string;
  onClick: any;
}

export default function NetworkModal(props: NetworkModalProps) {
  const context = useData();
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  const { chain, setChain } = context;

  function setCurrentNetHandle(index: any) {
    console.log("=====================", index);
    setChain(index);
  }

  let ImageContent;
  let TitleContent;
  let ValueContent;

  if (props.chain === "ethereum") {
    ImageContent = (
      <img className="w-[42px] h-[42px]" src="./assets/chain/Ethereum.svg" />
    );
    TitleContent = (
      <p className="text-[24px] text-white select-none">Ethereum</p>
    );
    ValueContent = (
      <p className="text-[18px] text-[#CBCBCB] select-none truncate">12,232.23 $</p>
    );
  } else if (props.chain === "solana") {
    ImageContent = (
      <img className="w-[42px] h-[42px]" src="./assets/chain/Solana.svg" />
    );
    TitleContent = <p className="text-[24px] text-white select-none">Solana</p>;
    ValueContent = (
      <p className="text-[18px] text-[#CBCBCB] select-none truncate">133,232.23 $</p>
    );
  } else if (props.chain === "binance") {
    ImageContent = (
      <img className="w-[42px] h-[42px]" src="./assets/chain/Binance.svg" />
    );
    TitleContent = (
      <p className="text-[24px] text-white select-none">Binance</p>
    );
    ValueContent = (
      <p className="text-[18px] text-[#CBCBCB] select-none truncate">7,232.23 $</p>
    );
  }

  return (
    <>
      <div className='relative choose-network-wrapper'>
        <div className='border-imitate absolute w-[calc(100%+1px)] h-[calc(100%+1px)] left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 p-[1px] rounded-[32px] bg-gradient-to-b from-[#DBDBDB] to-[#39504E] hover:from-[#19FB9B] hover:to-[#8C01FA] transition-all box-border'></div>
        <div className="choose-network-btn">
          <div
              className="flex flex-col gap-5 md:flex-row md:items-center relative"
              onClick={() => {
                setCurrentNetHandle(
                    props.chain === "ethereum"
                        ? 3
                        : props.chain === "solana"
                            ? 1
                            : props.chain === "binance"
                                ? 2
                                : 0
                );
                if (props.onClick) props.onClick();
                // props.onClick();
              }}
          >
            {ImageContent}
            <div className="flex flex-col gap-3">
              {TitleContent}
              {ValueContent}
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
