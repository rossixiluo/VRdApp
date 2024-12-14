import { useWeb3React } from '@web3-react/core'
import { Contract } from 'ethers'
import { useAppStore } from '../state'

const WETH_ABI = [
  // Minimal ABI to interact with WETH contract
  "function deposit() payable",
  "function withdraw(uint wad)"
];

export default function useEthWrapWeth() {
  const { account, library } = useWeb3React()
  const input = useAppStore(state => state.input)

  const sendWrapTx = async ({ address, amount }: { address?: string, amount?: string }) => {
    if (!address) return null;
    const signer = library.getSigner()
    const contract = new Contract(address, WETH_ABI, signer)
    const tx = await contract.deposit({ value: input });
    await tx.wait(); // Wait for transaction to be mined

    return tx;
  }

  return {
    account,
    sendWrapTx
  }
}
