import { assertIsDeliverTxSuccess } from '@cosmjs/stargate'

import { useCallback, useMemo } from 'react'
import { useAppStore } from '../state'

import { ethers } from 'ethers'
import { Buffer } from 'buffer'
import { PublicKey } from '@solana/web3.js'
import { Circle_Chainid, Solana_Config } from '../constants/relayer'
import useRelayerAddress from './useRelayer'
import { nobleFee } from '../constants/relayer'
import { useCusRecipientAddress } from './useCusRecipientAddress'
import { SupportedChainId } from '../constants/chains'
import { Cosmos_Network } from '../constants/networks'
/**
 * 
 * var text = "hello world";
var bytes = ethers.utils.toUtf8Bytes(text);
var textAgain = ethers.utils.toUtf8String(bytes);
*/

const makeAddressBytes = (account: string) => {
  const cleanedMintRecipient = account.replace(/^0x/, '')
  const zeroesNeeded = 64 - cleanedMintRecipient.length
  const mintRecipient = '0'.repeat(zeroesNeeded) + cleanedMintRecipient
  const buffer = Buffer.from(mintRecipient, 'hex')
  const mintRecipientBytes = new Uint8Array(buffer)
  return mintRecipientBytes
}
const makeAddress64 = (account: string) => {
  const cleanedMintRecipient = account.replace(/^0x/, '')
  const zeroesNeeded = 64 - cleanedMintRecipient.length

  const mintRecipient = '0'.repeat(zeroesNeeded) + cleanedMintRecipient

  return '0x' + mintRecipient
}
export default function useCosmosTx() {
  const fromChainID = useAppStore(state => state.fromChainID)
  const cosmosAddress = useAppStore(state => state.getCosmosAddress(fromChainID as string))
  const input = useAppStore(state => state.input)
  const toToken = useAppStore(state => state.toToken)
  const destMinimumReceived = useAppStore(state => state.destMinimumReceived)

  const { getRecipientAddressForChain } = useCusRecipientAddress()
  const CusRecipientAddress: string = getRecipientAddressForChain()
  const toChainID = useAppStore(state => state.toChainID)
  const toChainRelayerAddress = useRelayerAddress(toChainID)

  const toChainIsSolana = toChainID === SupportedChainId.SOLANA

  const client = (window as any).signingCosmosClient

  const signingCosmosClient = (client && client[(fromChainID as Cosmos_Network) + 'Client']) || null

  const buyToken = useMemo(() => {
    if (toToken?.address === '' && !toChainIsSolana) {
      return Solana_Config.GAS_ETH
    }
    if (toToken?.address === '' && toChainIsSolana) {
      return Solana_Config.SOL_IN_NOBLE_HEX
    }
    if (toToken && toToken?.address.indexOf('ibc') > -1 && !toChainIsSolana) {
      return Solana_Config.GAS_ETH
    }
    if (toToken?.address) return makeAddress64(toToken?.address)
  }, [toChainIsSolana, toToken])

  const sendTx = useCallback(async () => {
    console.info('toToken:', toToken)
    console.info('cosmosAddress:', cosmosAddress)
    console.info('CusRecipientAddress:', CusRecipientAddress)
    console.info('toChainID:', toChainID)
    console.info('toChainRelayerAddress:', toChainRelayerAddress)
    console.info('destMinimumReceived', destMinimumReceived)
    console.info('signingCosmosClient:', signingCosmosClient)
    // return { hash: '5C1B9E81B926CA104D0E6CCB6515017C59819C6980A34C7EF655C70BD1635CAE'}
    if (signingCosmosClient == null || toToken == null || cosmosAddress == null || !CusRecipientAddress || toChainID == null || toChainRelayerAddress == null) {
      return
    }
    console.info(toToken)
    const nFee = nobleFee[toChainID]
    const msg = {
      typeUrl: '/cosmos.bank.v1beta1.MsgSend',
      value: {
        fromAddress: cosmosAddress,
        toAddress: 'noble1ex6x4qgtttjzkrztm85e2uqhmtkz7akqduvqdy',
        amount: [
          {
            denom: 'uusdc',
            amount: toToken && toToken.decimals === 6 && toToken.symbol.indexOf('USDC') > -1 ? nFee[0].toString() : nFee[1].toString()
          }
        ]
      }
    }

    // var bytes = ethers.utils.toUtf8Bytes(account)
    // let strACount = `000000000000000000000000${account.slice(2)}`

    // let msg2value = window.NewMsgBridge(
    //   cosmosAddress, // wallet address
    //   input, // 1 usdc
    //   0, // destination domain 这个值怎么来
    //   strACount // destination vr contract address
    // )
    // const msg2 = {
    //   typeUrl: '/circle.cctp.v1.MsgDepositForBurn',
    //   value: msg2value
    // }

    // const gasCoin = '0x000000000000000000000000EeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    // const mintRecipientBytes = makeAddressBytes(account)
    //目标区块链执行合约的地址
    const destinationCallerBytes = makeAddressBytes(toChainRelayerAddress)

    const destDomain = Circle_Chainid[toChainID]

    const msg2 = {
      typeUrl: '/circle.cctp.v1.MsgDepositForBurnWithCaller',
      value: {
        from: cosmosAddress,
        amount: input,
        destinationDomain: destDomain,
        mintRecipient: toChainIsSolana ? makeAddressBytes(Solana_Config.VR_program_usdc_account) : destinationCallerBytes,
        burnToken: 'uusdc',
        destinationCaller: toChainIsSolana ? makeAddressBytes(Solana_Config.VR_caller) : destinationCallerBytes
      }
    }

    const messageBody = {
      version: 1,
      bridgeNonceHash: makeAddress64(''),
      sellAmount: parseInt(input),
      buyToken: buyToken,
      guaranteedBuyAmount: destMinimumReceived, // isDestSwap ? destMinimumReceived : parseInt(input),
      recipient: makeAddress64(CusRecipientAddress),
      callgas: 0,
      swapdata: '0x'
    }

    /**
    * struct SwapMessage {    
      uint32 version;
      bytes32 bridgeNonceHash;    
      uint256 sellAmount;
      bytes32 buyToken;    
      uint256 guaranteedBuyAmount;
      bytes32 recipient;    
      uint256 callgas;
      bytes swapdata;
    }
   */
    /*
    const parameters = ['uint256','bytes','bytes'];
const data = '0x000000000000000000000000000000000000000000000000840e6997d866bceb0000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
const defaultAbiCoder = new ethers.AbiCoder();

const values = defaultAbiCoder.decode(parameters, data);

console.log(values);
    */
    // ethers.utils.defaultAbiCoder.decode('',)
    const parameters = ['uint32', 'bytes32', 'uint256', 'bytes32', 'uint256', 'bytes32']
    let messageBodyEncode: any

    if (toChainIsSolana) {
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

      const publicKey2 = new PublicKey(CusRecipientAddress)
      const hexAddress2 = Array.from(publicKey2.toBytes())
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
      const accounthex322 = '0x' + hexAddress2

      messageBodyEncode = ethers.utils
        .solidityPack(parameters, [
          messageBody.version,
          messageBody.bridgeNonceHash,
          messageBody.sellAmount,
          accounthex32,
          messageBody.guaranteedBuyAmount,
          accounthex322
        ])
        .slice(2)
    } else {
      messageBodyEncode = ethers.utils
        .solidityPack(parameters, [
          messageBody.version,
          messageBody.bridgeNonceHash,
          messageBody.sellAmount,
          messageBody.buyToken,
          messageBody.guaranteedBuyAmount,
          messageBody.recipient
          // messageBody.callgas,
          // messageBody.swapdata
        ])
        .slice(2)
    }

    const msg3 = {
      typeUrl: '/circle.cctp.v1.MsgSendMessageWithCaller',
      value: {
        from: cosmosAddress,
        destinationDomain: destDomain,
        recipient: toChainIsSolana ? makeAddressBytes(Solana_Config.VR_message_receiver) : destinationCallerBytes,
        messageBody: Buffer.from(messageBodyEncode, 'hex'),
        destinationCaller: toChainIsSolana ? makeAddressBytes(Solana_Config.VR_caller) : destinationCallerBytes
      }
    }

    const fee = {
      amount: [
        {
          denom: 'usdc',
          amount: '2000'
        }
      ],
      gas: '180000' // 180k
    }

    console.info(cosmosAddress, [msg2, msg3, msg], fee)
    const result = await signingCosmosClient.signAndBroadcast(cosmosAddress, [msg2, msg3, msg], fee)
    console.info(result)
    const flag = assertIsDeliverTxSuccess(result)
    console.info(flag)
    return { hash: result.transactionHash }
  }, [
    signingCosmosClient,
    cosmosAddress,
    toChainID,
    input,
    CusRecipientAddress,
    toToken,
    toChainRelayerAddress,
    destMinimumReceived,
    toChainIsSolana,
    buyToken
  ])

  return {
    sendTx
  }
}
