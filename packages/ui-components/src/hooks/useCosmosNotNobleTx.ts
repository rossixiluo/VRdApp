import { StargateClient } from '@cosmjs/stargate'
import { SearchTxQuery } from '@cosmjs/stargate'

import { SupportedChainId, isCosmosChain } from '../constants/chains'
import { useCallback } from 'react'
import { useAppStore } from '../state'
import useRelayerAddress from './useRelayer'
import { useCusRecipientAddress } from './useCusRecipientAddress'
import { bech32 } from 'bech32'
import { COSMOS_CHAIN_CONFIG, Cosmos_Network } from '../constants/networks'
import { Any } from 'cosmjs-types/google/protobuf/any'
import { PubKey } from 'cosmjs-types/cosmos/crypto/secp256k1/keys'
import { PublicKey } from '@solana/web3.js'
import {  Solana_Config, cosmosFee } from '../constants/relayer'

export function encodePubkeyToAny(pubkey: { typeUrl: string; value: string }, chainId?: string): Any {
  console.info('pubkey', pubkey)
  if (pubkey.typeUrl === '/ethermint.crypto.v1.ethsecp256k1.PubKey' || pubkey.typeUrl === 'ethsecp256k1') {
    const pubkeyProto = PubKey.fromPartial({
      key: Buffer.from(pubkey.value, 'base64')
    })

    return Any.fromPartial({
      typeUrl: '/ethermint.crypto.v1.ethsecp256k1.PubKey',
      value: PubKey.encode(pubkeyProto).finish()
    })
  } else {
    // Handle other pubkey types if needed
    throw new Error(`Unsupported pubkey type: ${pubkey.typeUrl}`)
  }
}

function calculateTimeoutTimestamp(): string {
  const timeoutInNanoseconds = (BigInt(Date.now() + 10 * 60 * 1000) * BigInt(1000000)).toString()
  return timeoutInNanoseconds
}

function convertEvmosAddressToHex(evmosAddress: string): string {
  // 去掉前缀并转换为十六进制
  const hexAddress = '0x' + evmosAddress.slice(6).toLowerCase()
  return hexAddress
}
function convertOsmosisToNobleAddress(osmosisAddress: string): string {
  // 解码 Osmosis 地址
  const decoded = bech32.decode(osmosisAddress)

  // 提取公钥哈希
  const pubkeyHash = decoded.words

  // 使用 Noble 的前缀重新编码地址
  const nobleAddress = bech32.encode('noble', pubkeyHash)

  return nobleAddress
}
const resolveAddress = 'noble1fg9nduaafh2e0fw8xwmk6em97ze2evfr92qgwt';
const CHANNEL_MAP = {
  [`${SupportedChainId.EVMOS}-${SupportedChainId.NOBLE}`]: 'channel-64',
  [`${SupportedChainId.COREUM}-${SupportedChainId.NOBLE}`]: 'channel-19',
  [`${SupportedChainId.SEI}-${SupportedChainId.NOBLE}`]: 'channel-45',
  [`${SupportedChainId.OSMOSIS}-${SupportedChainId.NOBLE}`]: 'channel-750',
  [`${SupportedChainId.DYDX}-${SupportedChainId.NOBLE}`]: 'channel-0',
  [`${SupportedChainId.NOBLE}-${SupportedChainId.OSMOSIS}`]: 'channel-1',
  [`${SupportedChainId.NOBLE}-${SupportedChainId.SEI}`]: 'channel-39',
  [`${SupportedChainId.NOBLE}-${SupportedChainId.COREUM}`]: 'channel-49',
  [`${SupportedChainId.NOBLE}-${SupportedChainId.EVMOS}`]: 'channel-7',
  [`${SupportedChainId.NOBLE}-${SupportedChainId.DYDX}`]: 'channel-33',
} as const;

const sourceChannel = (fromChainID?: string, toChainID?: string) => {
  const key = `${fromChainID}-${toChainID}` as keyof typeof CHANNEL_MAP;
  return CHANNEL_MAP[key];
}

const FEE_CONFIG = {
  [`${SupportedChainId.NOBLE}`]: {
    amount: [{ denom: 'uusdc', amount: '1000' }],
    gas: '300000'
  },
  [`${SupportedChainId.OSMOSIS}`]: {
    amount: [{ denom: 'uosmo', amount: '2000' }],
    gas: '300000'
  },
  [`${SupportedChainId.SEI}`]: {
    amount: [{ denom: 'usei', amount: '300000' }],
    gas: '300000'
  },
  [`${SupportedChainId.EVMOS}`]: {
    amount: [{ denom: 'aevmos', amount: '22400000000000000' }],
    gas: '280000'
  },
  [`${SupportedChainId.COREUM}`]: {
    amount: [{ denom: 'ucore', amount: '2000' }],
    gas: '300000'
  },
  [`${SupportedChainId.DYDX}`]: {
    amount: [{ denom: 'udydx', amount: '1000' }],
    gas: '300000'
  }
} as const;

const sourceFee = (fromChainID: string) => {
  const key = fromChainID as keyof typeof FEE_CONFIG;
  return FEE_CONFIG[key] ?? null;
}

export default function useCosmosNotNobleTx() {
  const fromChainID = useAppStore(state => state.fromChainID)
  const cosmosAddress = useAppStore(state => state.getCosmosAddress(fromChainID as string))
  const input = useAppStore(state => state.input)
  const fromToken = useAppStore(state => state.fromToken)
  const toToken = useAppStore(state => state.toToken)

  const { getRecipientAddressForChain } = useCusRecipientAddress()
  const CusRecipientAddress = getRecipientAddressForChain()
  const toChainID = useAppStore(state => state.toChainID)
  const toChainRelayerAddress = useRelayerAddress(toChainID)

  const fee = sourceFee(fromChainID as string)

  const channel = !isCosmosChain(toChainID) ? sourceChannel(fromChainID as string, SupportedChainId.NOBLE) : sourceChannel(fromChainID as string, toChainID as string)

  const denom = fromChainID === SupportedChainId.NOBLE ? fromToken?.address.toLocaleLowerCase() : fromToken?.address

  const sendTx = useCallback(async () => {
    console.info('cosmosAddress:', cosmosAddress)
    console.info('fromToken?.address:', fromToken?.address)
    console.info('channel:', channel)
    console.info('CusRecipientAddress:', CusRecipientAddress)
    console.info('toChainID:', toChainID)
    console.info('toChainRelayerAddress:', toChainRelayerAddress)
    console.info('fee', fee)
    console.info('input', input)

    if (toToken == null || cosmosAddress == null || !CusRecipientAddress || toChainID == null) {
      return
    }

    const inputAddFee = (Number(input) + Number(cosmosFee)).toString()

    const memo = {
      senderAddress: cosmosAddress,
      recipient: CusRecipientAddress,
      srcChainId: fromChainID,
      destChainId: toChainID,
      targetToken: toToken?.address,
      amount: inputAddFee,
      minReceivedAmount: Math.floor(Number('0') * 0.95).toString()
    }

    if (toChainID === SupportedChainId.SOLANA) {
      let accounthex32 = ''
      if (toToken?.address === '') {
        accounthex32 = Solana_Config.SOL_IN_NOBLE_HEX
      } else {
        const publicKey = new PublicKey(toToken?.address)
        const hexAddress = Array.from(publicKey.toBytes())
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')
        accounthex32 = '0x' + hexAddress
      }
      memo.targetToken = accounthex32
      const publicKeyRecipient = new PublicKey(CusRecipientAddress)
      const hexAddressRecipient = Array.from(publicKeyRecipient.toBytes())
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
      memo.recipient = '0x' + hexAddressRecipient
    }

    const toAddress = !isCosmosChain(toChainID) ? resolveAddress : CusRecipientAddress

    console.info('memo', JSON.stringify(memo))
    const msg = {
      typeUrl: '/ibc.applications.transfer.v1.MsgTransfer',
      value: {
        sourcePort: 'transfer',
        sourceChannel: channel,
        token: {
          denom: denom,
          amount: inputAddFee
        },
        sender: cosmosAddress,
        receiver: toAddress,
        timeoutHeight: undefined,
        timeoutTimestamp: calculateTimeoutTimestamp(),
        memo: !isCosmosChain(toChainID) ? JSON.stringify(memo) : ''
      }
    }

    try {
      let result
      if (fromChainID === SupportedChainId.EVMOS) {
        await new Promise(resolve => setTimeout(resolve, 3000))
        const { client } = (window as any).signingKeplrEthermintClient

        // 获取账户信息
        const account = await client.client.getAccount(cosmosAddress)

        // 添加 SignerData
        const signerData = {
          accountNumber: account.accountNumber,
          sequence: account.sequence,
          chainId: 'evmos_9001-2' // 确保使用正确的 chainId
        }

        // 使用 signerData 进行签名
        const txBytes = await client.sign(
          cosmosAddress,
          [msg],
          fee,
          '', // memo
          signerData
        )

        result = await client.client.broadcastTx(txBytes)
      } else {
        const signingCosmosClient = (window as any).signingCosmosClient[(fromChainID as Cosmos_Network) + 'Client'] || null
        if (signingCosmosClient) {
          result = await signingCosmosClient.signAndBroadcast(cosmosAddress, [msg], fee)
        } else {
          throw new Error('signingCosmosClient is not found')
        }
      }
      console.info(result)
      const packetSequence = result.events
        .find((event: any) => event.type === 'send_packet')
        ?.attributes.find((attr: any) => attr.key === 'packet_sequence')?.value
      const packetSrcPort = result.events
        .find((event: any) => event.type === 'send_packet')
        ?.attributes.find((attr: any) => attr.key === 'packet_src_port')?.value
      const packetSrcChannel = result.events
        .find((event: any) => event.type === 'send_packet')
        ?.attributes.find((attr: any) => attr.key === 'packet_src_channel')?.value
      const query = [
        {
          key: 'write_acknowledgement.packet_sequence',
          value: packetSequence
        },
        {
          key: 'write_acknowledgement.packet_src_port',
          value: packetSrcPort
        },
        {
          key: 'write_acknowledgement.packet_src_channel',
          value: packetSrcChannel
        }
      ]
      return { hash: result.transactionHash, query }
    } catch (error) {
      console.error('Transaction error:', error)
      throw error
    }
  }, [cosmosAddress, toChainID, CusRecipientAddress, toToken, toChainRelayerAddress, input, channel, fromToken?.address, fee, fromChainID, denom])

  const searchTx = useCallback(async (searchQuery: SearchTxQuery, toChainID: string, maxAttempts = 60) => {
    const nobleRpcUrl = COSMOS_CHAIN_CONFIG[toChainID as Cosmos_Network].rpc
    const nobleClient = await StargateClient.connect(nobleRpcUrl)

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        console.info(`Attempt ${attempt + 1}: searchQuery:`, searchQuery)
        const txs = await nobleClient.searchTx(searchQuery)

        if (txs.length > 0) {
          console.info('Found transactions:', txs)
          return txs // Return the found transactions
        }

        console.info('No transactions found, retrying in 5 seconds...')
        await delay(5000) // Wait for 5 seconds before the next attempt
      } catch (error) {
        console.error('Error searching for transactions:', error)
        await delay(5000) // Wait for 5 seconds before the next attempt
      }
    }

    console.warn('Max attempts reached. No transactions found.')
    return null // Return null if no transactions are found after max attempts
  }, [])

  return {
    sendTx,
    searchTx
  }
}
