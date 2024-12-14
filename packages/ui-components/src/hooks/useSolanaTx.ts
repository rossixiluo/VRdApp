import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppStore } from '../state'
import { Connection, PublicKey, Keypair, Transaction, SystemProgram, TransactionMessage, VersionedTransaction, ComputeBudgetProgram } from '@solana/web3.js'
import * as spl from '@solana/spl-token'
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor'
import { IDL } from '../constants/ABI/value_router'
import { Buffer } from 'buffer'
import useSWR from 'swr'
import { useWallet } from '@solana/wallet-adapter-react'
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes/index.js'

import useRelayerAddress from './useRelayer'
import { Circle_Chainid } from '../constants/relayer'
import { RPC_URLS, COSMOS_CHAIN_CONFIG } from '../constants/networks'
import { SupportedChainId, isCosmosChain } from '../constants/chains'
import { useGetForwardingAddress } from '../hooks/useCosmosForwarding'
import {
  getPrograms,
  getSwapAndBridgePdas,
  getQuote,
  getSwapIx,
  evmAddressToBytes32,
  getBytes,
  getAssociatedTokenAddressSync,
  getAdressLookupTableAccounts,
  instructionDataToTransactionInstruction,
  convertSolToWsol,
  createWsolAccountAndConvertSolToWsol,
  getAccountInfo,
  pollTransaction,
  createUSDCAccount,
  sendJitoBundle,
  pollBundleStatuses
} from '../utils/solana-utils'
import { bech32Tobytes32 } from '../utils/index'
import useUSDCAddress from '../hooks/useUsdc'
import { useCusRecipientAddress } from './useCusRecipientAddress'
import { useToasts } from 'react-toast-notifications'
import { Relayer_IDS_TO_ADDR } from '../constants/relayer'
const relayer = Relayer_IDS_TO_ADDR['solana']

export const JitoEndpoints = [
  'https://mainnet.block-engine.jito.wtf/api/v1/'
  // 'https://amsterdam.mainnet.block-engine.jito.wtf/api/v1/',
  // 'https://frankfurt.mainnet.block-engine.jito.wtf/api/v1/',
  // 'https://ny.mainnet.block-engine.jito.wtf/api/v1/',
  // 'https://tokyo.mainnet.block-engine.jito.wtf/api/v1/'
]

const tips = [
  'ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt',
  'DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL',
  'HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe',
  'DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh',
  '3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT',
  '96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5',
  'ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49',
  'Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY'
].map(pubkey => new PublicKey(pubkey))

function getRandomInt(length: number): number {
  return Math.floor(Math.random() * length)
}

const usdcString = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const usdcAddress = new PublicKey(usdcString)

const jupiterProgramId = new PublicKey('JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4')

const LOOKUP_TABLE_2_ADDRESS = new PublicKey('G6XcDmLhLDBDxeYpCiumt1KCRiNEDoFh3JEdTXu5H4kf')

const programId = new PublicKey(relayer) // 智能合约的 program ID

const feeReceiver = new PublicKey('6m9RuGeKMYcJwY7YPCFecQECwfy3JKfDbN4HgR91sFpZ')

const fetcher = (url: string) => fetch(url).then(res => res.json()) // Define fetcher function

const useTipsStream = (url: string, autoBundleFee: boolean) => {
  // Check if autoBundleFee is false
  const { data, error } = useSWR(autoBundleFee ? url : null, fetcher) // Use SWR for data fetching

  const tips = data || [] // Use fetched data or an empty array if there's no data

  return tips // Return tips
}

export default function useSolanaTx() {
  const { addToast } = useToasts()
  const fromChainID = useAppStore(state => state.fromChainID)
  const originalinput = useAppStore(state => state.originalinput)
  const input = useAppStore(state => state.input)
  const fromToken = useAppStore(state => state.fromToken)
  const toToken = useAppStore(state => state.toToken)
  const destMinimumReceived = useAppStore(state => state.destMinimumReceived)
  const bundleFee = useAppStore(state => state.bundleFee)
  const setBundleFee = useAppStore(state => state.setBundleFee)
  const autoBundleFee = useAppStore(state => state.autoBundleFee)

  const { getRecipientAddressForChain } = useCusRecipientAddress()
  const CusRecipientAddress: string = getRecipientAddressForChain()
  const [createUsdcAccountHash, setCreateUsdcAccountHash] = useState<null | string>(null)
  const tipsArr = useTipsStream('https://apiproxy.valuerouter.com/api/tip_floor', autoBundleFee)

  useEffect(() => {
    if (autoBundleFee && tipsArr && tipsArr.length > 0) {
      try {
        const landed_tips_50th_percentile = tipsArr[0]?.landed_tips_50th_percentile
        if (landed_tips_50th_percentile && Number(landed_tips_50th_percentile)) {
          const fee = Math.floor(landed_tips_50th_percentile * 1e9)
          setBundleFee(fee.toString())
        }
      } catch (error) {
        console.error('Error processing tips:', error)
      }
    }
  }, [tipsArr, autoBundleFee, setBundleFee])

  const wallet = useWallet()
  const useJitoBundle = useAppStore(state => state.useJitoBundle)
  const toChainID = useAppStore(state => state.toChainID)
  const toChainRelayerAddress = useRelayerAddress(toChainID)
  const toUSDC = useUSDCAddress(toChainID)

  const fromIsSol = fromToken?.symbol === 'SOL' && fromToken?.address === ''
  const fromIsUSDC = fromToken?.symbol === 'USDC'
  const destIsUSDC = toToken?.symbol === 'USDC'

  const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 30000
  })
  const computeBudgetUnitLimit = ComputeBudgetProgram.setComputeUnitLimit({
    units: 1000000
  })

  // const remoteValueRouter = toChainRelayerAddress && new PublicKey(
  //   getBytes(evmAddressToBytes32(toChainRelayerAddress))
  // );
  const remoteValueRouter = useMemo(() => {
    if (isCosmosChain(toChainID)) {
      return SystemProgram.programId
    }
    return toChainRelayerAddress && new PublicKey(getBytes(evmAddressToBytes32(toChainRelayerAddress)))
  }, [toChainRelayerAddress, toChainID])

  // const SwapParameter = useSwapBuildParameter()
  const channel = toChainID ? COSMOS_CHAIN_CONFIG[toChainID as keyof typeof COSMOS_CHAIN_CONFIG]?.channel : ''
  const { address: fowardingAddress } = useGetForwardingAddress(channel, CusRecipientAddress || '')
  // mintRecipient is a bytes32 type so pad with 0's then convert to a solana PublicKey
  const mintRecipient = useMemo(() => {
    try {
      if (toChainID === SupportedChainId.NOBLE && CusRecipientAddress) {
        return new PublicKey(bech32Tobytes32(CusRecipientAddress))
      }
      if (isCosmosChain(toChainID) && fowardingAddress) {
        return new PublicKey(bech32Tobytes32(fowardingAddress))
      }
      return new PublicKey(getBytes(evmAddressToBytes32(CusRecipientAddress)))
    } catch (error) {
      return new PublicKey('So11111111111111111111111111111111111111112')
    }
  }, [toChainID, CusRecipientAddress, fowardingAddress])

  let memoBytes: Buffer = Buffer.alloc(0)
  if (toChainID && toChainID !== SupportedChainId.NOBLE && isCosmosChain(toChainID)) {
    const cosmosChainConfig = COSMOS_CHAIN_CONFIG[toChainID as keyof typeof COSMOS_CHAIN_CONFIG]
    memoBytes = Buffer.from(JSON.stringify({ destChainName: cosmosChainConfig.destChainName, recipient: CusRecipientAddress }))
  }

  const sendTx = useCallback(async () => {
    console.info('fromToken:', fromToken)
    console.info('toToken:', toToken)
    console.info('toChainID:', toChainID)
    console.info('toChainRelayerAddress:', toChainRelayerAddress)
    console.info('destMinimumReceived', destMinimumReceived)
    console.info('wallet', wallet)
    console.info('fowardingAddress', fowardingAddress)
    console.info('input', input)

    if (toToken == null || toChainID == null || toChainRelayerAddress == null || !wallet.publicKey || !wallet.signTransaction) {
      return
    }

    // 原链 token address
    // const sourceMint = fromToken?.address === '' ? new PublicKey('So11111111111111111111111111111111111111112') : new PublicKey(fromToken?.address || '')

    // sourceMint改动，原链如果不是USDC ，sourceMint 就传 WSOL，token2022问题，后续会删掉sourceMint
    const sourceMint = fromIsUSDC ? new PublicKey(fromToken?.address || '') : new PublicKey('So11111111111111111111111111111111111111112')
    // const bridgeUsdcAmount = new BN(input)
    const destinationDomain = Number(Circle_Chainid[toChainID])

    const toTokenAddress = toToken.address || '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    const buyToken = new PublicKey(getBytes(toChainID === SupportedChainId.NOBLE ? toUSDC : evmAddressToBytes32(toTokenAddress))) // 目标链 Token

    const guaranteedBuyAmount_num: BN = new BN(destIsUSDC ? 0 : destMinimumReceived) // 目标链是 token 返回计算的destMinimumReceived， 如果是 USDC 用 0
    const guaranteedBuyAmount_hex = guaranteedBuyAmount_num.toString(16)
    const paddedHexString: string = guaranteedBuyAmount_hex.padStart(64, '0')
    const guaranteedBuyAmount: Buffer = Buffer.from(paddedHexString, 'hex')

    // Generate a new keypairs for the MessageSent event account.
    const messageSentEventAccountKeypair1 = Keypair.generate()
    const messageSentEventAccountKeypair2 = Keypair.generate()

    const RPC_URL = RPC_URLS[SupportedChainId.SOLANA][0]

    const connection = new Connection(RPC_URL, 'confirmed')

    const rpc = JitoEndpoints[getRandomInt(JitoEndpoints.length)]
    const connection2 = new Connection(rpc, 'confirmed')

    const provider = new AnchorProvider(connection, wallet as any, AnchorProvider.defaultOptions())

    const program = new Program(IDL, programId, provider)

    const { messageTransmitterProgram, tokenMessengerMinterProgram, valueRouterProgram } = getPrograms(provider)

    // 可能会有多个usdc account ？
    const programUsdcAccount = // new PublicKey("CAs2n4nPp5u7UYrfxq9G3uugMLT7QcLPXsbndiHcSkV")
      PublicKey.findProgramAddressSync([Buffer.from('usdc')], valueRouterProgram.programId)[0]

    const pdas = getSwapAndBridgePdas(
      {
        messageTransmitterProgram,
        tokenMessengerMinterProgram,
        valueRouterProgram
      },
      usdcAddress,
      destinationDomain
    )

    const seed = Buffer.from('__event_authority')
    const eventAuthority = (() => {
      for (let b = 255; b > 0; b--) {
        const bump = new Uint8Array([b])
        try {
          return PublicKey.createProgramAddressSync([seed, bump], tokenMessengerMinterProgram.programId)
        } catch (error) {
          continue
        }
      }
    })()

    const findAddress = await getAssociatedTokenAddressSync(usdcAddress, wallet.publicKey)

    const userTokenAccount: PublicKey = findAddress

    const tipIx = SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: tips[Math.floor(Math.random() * tips.length)],
      lamports: Number(bundleFee) || 20000
    })

    const accounts = {
      payer: provider.wallet.publicKey,

      messageTransmitterProgram: messageTransmitterProgram.programId,
      tokenMessengerMinterProgram: tokenMessengerMinterProgram.programId,
      valueRouterProgram: valueRouterProgram.programId,
      tokenProgram: spl.TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,

      messageTransmitter: pdas.messageTransmitterAccount.publicKey,
      tokenMessenger: pdas.tokenMessengerAccount.publicKey,
      tokenMinter: pdas.tokenMinterAccount.publicKey,
      valueRouter: pdas.valueRouterAccount.publicKey,

      senderAuthorityPda: pdas.authorityPda.publicKey,
      senderAuthorityPda2: pdas.authorityPda2.publicKey,

      remoteTokenMessenger: pdas.remoteTokenMessengerKey.publicKey,
      localToken: pdas.localToken.publicKey,
      burnTokenMint: usdcAddress,

      messageSentEventData1: messageSentEventAccountKeypair1.publicKey,
      messageSentEventData2: messageSentEventAccountKeypair2.publicKey,
      remoteValueRouter: remoteValueRouter,

      eventAuthority: eventAuthority,

      programAuthority: PublicKey.findProgramAddressSync([Buffer.from('authority')], valueRouterProgram.programId)[0],

      programUsdcAccount: programUsdcAccount,

      senderUsdcAccount: userTokenAccount,

      jupiterProgram: jupiterProgramId,

      sourceMint: sourceMint,

      feeReceiver: feeReceiver
    }
    // 用户没有 USDC 账户，创建一个，再进行后面逻辑
    if (!userTokenAccount) {
      try {
        const instructions = await createUSDCAccount(provider)
        // 获取最近的区块哈希
        const {
          value: { blockhash, lastValidBlockHeight },
          context: { slot: minContextSlot }
        } = await connection.getLatestBlockhashAndContext()

        const transaction = new Transaction()
        // 设置交易的最近区块哈希
        transaction.recentBlockhash = blockhash
        transaction.lastValidBlockHeight = lastValidBlockHeight
        transaction.feePayer = wallet.publicKey
        instructions.forEach(instruction => {
          transaction.add(instruction)
        })
        instructions.unshift(addPriorityFee)

        const signedTransaction = await wallet.signTransaction(transaction)

        if (useJitoBundle) {
          const encodedTx = bs58.encode(signedTransaction.serialize())
          const txSig = await sendJitoBundle(encodedTx, rpc)
          const res = await pollBundleStatuses([txSig], rpc, 3000, 120000)
          if (res && res[0]) {
            return { hash: res[0] }
          }
        }
        const txid = await connection.sendRawTransaction(signedTransaction.serialize(), {
          minContextSlot
        })

        console.info('Transaction Signature:', txid)
        // 确认交易成功后
        await pollTransaction(connection, txid, 3000, 120000)

        setCreateUsdcAccountHash(txid)
        return { hash: txid }
      } catch (error) {
        return { hash: null }
      }
    }

    // 如果原链是SOL，要包装成WSOL
    if (fromIsSol) {
      // 找到用户的wsol账户
      const findWsolAddress = await getAssociatedTokenAddressSync(new PublicKey('So11111111111111111111111111111111111111112'), wallet.publicKey)

      const tokenInfo = await getAccountInfo(provider.connection, findWsolAddress)
      console.info(tokenInfo)

      const transaction = new Transaction()

      const {
        value: { blockhash, lastValidBlockHeight },
        context: { slot: minContextSlot }
      } = await connection.getLatestBlockhashAndContext()

      transaction.recentBlockhash = blockhash
      transaction.lastValidBlockHeight = lastValidBlockHeight
      transaction.feePayer = wallet.publicKey
      // 如果用户已经有wsol账户，直接转账，没有则创建后再转账
      const instructions = tokenInfo
        ? await convertSolToWsol(Number(input), provider, findWsolAddress)
        : await createWsolAccountAndConvertSolToWsol(Number(input), provider)

      if (useJitoBundle) {
        instructions.unshift(tipIx)
      }

      instructions.forEach(instruction => {
        transaction.add(instruction)
      })

      instructions.unshift(addPriorityFee)

      const signedTransaction = await wallet.signTransaction(transaction)

      if (useJitoBundle) {
        const encodedTx = bs58.encode(signedTransaction.serialize())
        const txSig = await sendJitoBundle(encodedTx, rpc)
        const res = await pollBundleStatuses([txSig], rpc, 3000, 120000)
        if (res && res[0]) {
          return { hash: res[0] }
        }
      }

      const txid = await connection.sendRawTransaction(signedTransaction.serialize(), {
        minContextSlot
      })

      console.info('Transaction Signature:', txid)
      // 确认交易成功后
      const res = await pollTransaction(connection, txid, 3000, 120000)
      if (res) {
        return { hash: txid }
      }
      if (res === null) {
        return { hash: null }
      }

      try {
        const confirmation = await connection.confirmTransaction(
          {
            blockhash: blockhash,
            lastValidBlockHeight: lastValidBlockHeight,
            signature: txid
          },
          'confirmed'
        )
        console.info(confirmation)
        return { hash: txid }
      } catch (error) {
        return { hash: null }
      }
    }
    // 如果原链是USDC，直接swap
    if (fromIsUSDC) {
      const addressLookupTableAccounts = await getAdressLookupTableAccounts(provider.connection, [])

      const lookupTable2: any = (await provider.connection.getAddressLookupTable(LOOKUP_TABLE_2_ADDRESS)).value

      addressLookupTableAccounts.push(lookupTable2)

      const instruction = await program.methods
        .swapAndBridgeShareEventAccounts({
          jupiterSwapData: Buffer.alloc(0),
          buyArgs: {
            buyToken: buyToken,
            guaranteedBuyAmount: guaranteedBuyAmount
          },
          bridgeUsdcAmount: new BN(input),
          destDomain: destinationDomain,
          recipient: mintRecipient,
          memo: memoBytes
        })
        .accounts(accounts)
        .instruction()

      const instructions = [instruction]
      instructions.unshift(tipIx)

      // 构建交易
      const transaction = new Transaction()

      // 获取最近的区块哈希
      const {
        value: { blockhash, lastValidBlockHeight },
        context: { slot: minContextSlot }
      } = await connection.getLatestBlockhashAndContext()

      // 设置交易的最近区块哈希
      transaction.recentBlockhash = blockhash
      transaction.lastValidBlockHeight = lastValidBlockHeight
      transaction.feePayer = wallet.publicKey

      instructions.forEach(instruction => {
        transaction.add(instruction)
      })

      try {
        const messageV0 = new TransactionMessage({
          payerKey: wallet.publicKey,
          recentBlockhash: blockhash,
          instructions
        }).compileToV0Message(addressLookupTableAccounts)

        const transaction = new VersionedTransaction(messageV0)
        transaction.sign([messageSentEventAccountKeypair1, messageSentEventAccountKeypair2])
        const signedTransaction = await wallet.signTransaction(transaction)

        if (useJitoBundle) {
          console.info('useJitoBundle')
          const encodedTx = bs58.encode(signedTransaction.serialize())
          const txSig = await sendJitoBundle(encodedTx, rpc)
          const res = await pollBundleStatuses([txSig], rpc, 3000, 120000)
          if (res && res[0]) {
            return { hash: res[0] }
          }
        }

        const txid = await connection.sendRawTransaction(signedTransaction.serialize(), {
          minContextSlot
        })
        console.info('Transaction Signature:', txid)
        // await connection.confirmTransaction(txid, 'confirmed');
        await connection.confirmTransaction(
          {
            blockhash: blockhash,
            lastValidBlockHeight: lastValidBlockHeight,
            signature: txid
          },
          'confirmed'
        )
        console.info('Transaction confirmed')

        return { hash: txid }
      } catch (error) {
        console.info(error)
        addToast(String(error), { appearance: 'error', autoDismissTimeout: 1000 * 5 })
        return { hash: '' }
      }
    }

    // 如果原链是其他token，直接swap
    const inputString = fromIsSol ? 'So11111111111111111111111111111111111111112' : fromToken?.address || ''

    /// 1. 获取 Jupiter 报价
    const quote = await getQuote(
      inputString, // from token
      usdcString, // USDC
      Number(input)
    )

    /// 2. 获取 local swap 的 data 和 accounts
    const swapIx = await getSwapIx(wallet.publicKey, programUsdcAccount, quote)

    const addressLookupTableAddresses = swapIx.addressLookupTableAddresses

    const swapInstruction: any = instructionDataToTransactionInstruction(swapIx.swapInstruction)

    /// 4. Organize accounts in address lookup tables
    /// 4.1 Jupiter ALT
    const addressLookupTableAccounts = await getAdressLookupTableAccounts(provider.connection, addressLookupTableAddresses)

    /// 4.2 ValueRouter ALT
    const lookupTable2: any = (await provider.connection.getAddressLookupTable(LOOKUP_TABLE_2_ADDRESS)).value

    addressLookupTableAccounts.push(lookupTable2)

    const instruction = await program.methods
      .swapAndBridgeShareEventAccounts({
        jupiterSwapData: swapInstruction.data,
        buyArgs: {
          buyToken: buyToken,
          guaranteedBuyAmount: guaranteedBuyAmount
        },
        bridgeUsdcAmount: new BN(quote.otherAmountThreshold),
        destDomain: destinationDomain,
        recipient: mintRecipient,
        memo: memoBytes
      })
      .accounts(accounts)
      .remainingAccounts(swapInstruction.keys)
      .instruction()

    const instructions = [instruction]

    // 构建交易
    const transaction = new Transaction()

    instructions.unshift(tipIx)
    instructions.push(computeBudgetUnitLimit)
    // 获取最近的区块哈希
    const {
      value: { blockhash, lastValidBlockHeight },
      context: { slot: minContextSlot }
    } = await connection.getLatestBlockhashAndContext()

    // 设置交易的最近区块哈希
    transaction.recentBlockhash = blockhash
    transaction.lastValidBlockHeight = lastValidBlockHeight
    transaction.feePayer = wallet.publicKey
    instructions.forEach(instruction => {
      transaction.add(instruction)
    })

    // transaction.partialSign(messageSentEventAccountKeypair1, messageSentEventAccountKeypair2);
    try {
      const messageV0 = new TransactionMessage({
        payerKey: wallet.publicKey,
        recentBlockhash: blockhash,
        instructions
      }).compileToV0Message(addressLookupTableAccounts)

      const transaction = new VersionedTransaction(messageV0)
      transaction.sign([messageSentEventAccountKeypair1, messageSentEventAccountKeypair2])
      const signedTransaction = await wallet.signTransaction(transaction)

      if (useJitoBundle) {
        const encodedTx = bs58.encode(signedTransaction.serialize())
        const txSig = await sendJitoBundle(encodedTx, rpc)
        const res = await pollBundleStatuses([txSig], rpc, 3000, 120000)
        if (res && res[0]) {
          return { hash: res[0] }
        }
      }

      const txid = await connection.sendRawTransaction(signedTransaction.serialize(), {
        minContextSlot
      })
      console.info('Transaction Signature:', txid)
      // await connection.confirmTransaction(txid, 'confirmed');
      await connection.confirmTransaction(
        {
          blockhash: blockhash,
          lastValidBlockHeight: lastValidBlockHeight,
          signature: txid
        },
        'confirmed'
      )
      console.info('Transaction confirmed')

      return { hash: txid }
    } catch (error) {
      console.info(error)
      addToast(String(error), { appearance: 'error', autoDismissTimeout: 1000 * 5 })
      return { hash: '' }
    }
  }, [
    destMinimumReceived,
    fromToken,
    input,
    toChainID,
    toChainRelayerAddress,
    toToken,
    toUSDC,
    wallet,
    addToast,
    destIsUSDC,
    fromIsUSDC,
    remoteValueRouter,
    fromIsSol,
    addPriorityFee,
    mintRecipient,
    fowardingAddress,
    bundleFee,
    computeBudgetUnitLimit,
    memoBytes,
    useJitoBundle
  ])

  return {
    sendTx,
    createUsdcAccountHash
  }
}
