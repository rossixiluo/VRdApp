import { useWallet } from '@solana/wallet-adapter-react'
import { AnchorProvider } from '@coral-xyz/anchor'
import { RPC_URLS } from '../constants/networks'
import { Connection, PublicKey } from '@solana/web3.js'
import { SupportedChainId } from '../constants/chains'
import { getAssociatedTokenAddressSync, getAccountInfo } from '../utils/solana-utils'
import { useAppStore } from '../state'
import useSWR from 'swr'

const usdcString = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const usdcAddress = new PublicKey(usdcString)

// 获取solana钱包USDC账户
export default function useSolanaUsdcAccount() {
  const wallet: any = useWallet()
  const setCreateUsdcStatus = useAppStore(state => state.setCreateUsdcStatus)

  const fetcher = async () => {
    const RPC_URL = RPC_URLS[SupportedChainId.SOLANA][0]
    const connection = new Connection(RPC_URL, 'confirmed')
    const provider = new AnchorProvider(connection, wallet as any, AnchorProvider.defaultOptions())

    const findAddress = await getAssociatedTokenAddressSync(usdcAddress, wallet.publicKey)

    const usdtTokenInfo = await getAccountInfo(provider.connection, findAddress)

    if (!usdtTokenInfo) {
      setCreateUsdcStatus('')
    } else {
      setCreateUsdcStatus('1')
    }
    return usdtTokenInfo
  }

  const { data } = useSWR(wallet.publicKey ? ['solanaUsdcAccount', wallet.publicKey] : null, () => wallet.publicKey && fetcher())

  return {
    usdtTokenInfo: data
  }
}
