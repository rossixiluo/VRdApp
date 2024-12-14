import { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { RPC_URLS } from '../constants/networks';
import { useAppStore } from '../state/index';
import { Connection, PublicKey } from '@solana/web3.js';
import { SupportedChainId } from '../constants/chains';
import useSWR from 'swr';

// 获取solana钱包关联账户
export default function useSolanaAccount() {
  const wallet = useWallet();
  const setSolanaMyTokenList = useAppStore(state => state.setSolanaMyTokenList)

  const fetcher = async (address: PublicKey) => {
    const RPC_URL = RPC_URLS[SupportedChainId.SOLANA][0];
    const connection = new Connection(RPC_URL, 'confirmed');
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(address, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    });

    return tokenAccounts.value.map((item: any) => item.account.data.parsed.info.mint);
  };

  const { data: pubkeyArray, error } = useSWR(wallet.publicKey ? ['solanaAccount', wallet.publicKey] : null, () => wallet.publicKey && fetcher(wallet.publicKey));

  useEffect(() => {
    if (pubkeyArray) {
      setSolanaMyTokenList(pubkeyArray);
    }
  }, [pubkeyArray, setSolanaMyTokenList]);

  return {
    publicKey: wallet.publicKey,
    connected: wallet.connected,
    pubkeyArray,
    error,
    isLoading: !pubkeyArray && !error,
  };
}