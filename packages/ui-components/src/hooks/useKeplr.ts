import { useCallback, useEffect, useState } from 'react'
import { Keplr, AccountData, OfflineAminoSigner, OfflineDirectSigner } from '@keplr-wallet/types'
import { COSMOS_CHAIN_CONFIG, Cosmos_Network } from '../constants/networks'
import { useAppStore } from '../state'
import { SigningStargateClient, defaultRegistryTypes, AminoTypes, accountFromAny } from '@cosmjs/stargate'
import SigningKeplerEthermintClient from '../utils/signingKeplrEthermintClient'

// var Buffer = require('buffer/').Buffer
// import { Buffer } from 'buffer'
// import { bech32 } from 'bech32'

//https://github.com/chainapsis/keplr-wallet/blob/master/packages/extension/src/config.ts
// import from '@keplr-wallet/types/build/'
// node_modules/@keplr-wallet/types/build/cosmjs.d.ts

import { MsgDepositForBurn, MsgDepositForBurnWithCaller, MsgSendMessageWithCaller } from '../generated/circle/cctp/v1/tx'
import { EthAccount } from '../generated/circle/cctp/v1/account'
import { GeneratedType, Registry } from '@cosmjs/proto-signing'

const cctpTypes: ReadonlyArray<[string, GeneratedType]> = [
  ['/circle.cctp.v1.MsgDepositForBurn', MsgDepositForBurn],
  ['/circle.cctp.v1.MsgDepositForBurnWithCaller', MsgDepositForBurnWithCaller],
  ['/circle.cctp.v1.MsgSendMessageWithCaller', MsgSendMessageWithCaller],
  ['/ethermint.types.v1.EthAccount', EthAccount],
  ...defaultRegistryTypes
]
function createDefaultRegistry(): Registry {
  return new Registry(cctpTypes)
}

const aminoTypes = new AminoTypes({
  ...Object.fromEntries(
    cctpTypes.map(([key, value]) => [
      key,
      {
        aminoType: key,
        toAmino: (value: any) => value,
        fromAmino: (value: any) => value
      }
    ])
  )
})
export const accountParser: any = (acc: any) => {
  switch (acc.typeUrl) {
    case '/ethermint.types.v1.EthAccount': {
      const account = EthAccount.decode(acc.value as Uint8Array)
      const baseEthAccount = account.baseAccount!
      const pubKeyEth = baseEthAccount.pubKey

      const res = {
        address: baseEthAccount.address,
        pubkey: pubKeyEth
          ? {
              type: '/ethermint.crypto.v1.ethsecp256k1.PubKey',
              value: Buffer.from(pubKeyEth.value).toString('base64')
            }
          : null,
        accountNumber: Number(baseEthAccount.accountNumber),
        sequence: Number(baseEthAccount.sequence)
      }
      console.info('res', res)
      return res
    }
    default:
      return accountFromAny(acc)
  }
}
// function getBytes(address) {
//   const decoded = bech32.decode(address)

//   return Buffer.from(bech32.fromWords(decoded.words))
// }
//https://tutorials.cosmos.network/hands-on-exercise/3-cosmjs-adv/2-cosmjs-messages.html
//https://github.com/bd21/noble-tutorials/tree/149d629c5d2897eb55af360a128e059c3ff4668e/tutorials/03-noble-eth-js

const getKeplr = async (): Promise<Keplr | undefined> => {
  if (window.keplr) {
    return (window as any).keplr
  }

  if (document.readyState === 'complete') {
    return (window as any).keplr
  }

  return new Promise(resolve => {
    const documentStateChange = (event: Event) => {
      if (event.target && (event.target as Document).readyState === 'complete') {
        resolve((window as any).keplr)
        document.removeEventListener('readystatechange', documentStateChange)
      }
    }

    document.addEventListener('readystatechange', documentStateChange)
  })
}
let init = false

export default function useKeplr() {
  const { cosmosAddresses, setCosmosAddresses } = useAppStore(state => state)
  const [accounts, setAccounts] = useState<readonly AccountData[]>()
  const [offlineSigner, setOfflineSigner] = useState<OfflineAminoSigner & OfflineDirectSigner>()
  const isKeplr = useAppStore(state => {
    return state.getEnableKeplr()
  })
  const { cosmosAddressConnected, setCosmosAddressConnected } = useAppStore(state => state)

  const setKeplr = useAppStore(state => {
    return state.setEnableKeplr
  })

  const getActiveAccount = useCallback(async (chainId: string) => {
    const Keplr = await getKeplr()
    Keplr?.enable(chainId)

    const offlineSigner = Keplr?.getOfflineSigner(chainId)
    const accounts = await offlineSigner?.getAccounts()
    const activeAccount = accounts?.[0].address
    
    if (!activeAccount) {
      return null;
    }

    return {
      address: activeAccount
    };
  }, []);


  const enableKeplr = useCallback(
    async (network: string) => {
      const { chainId, rpc } = COSMOS_CHAIN_CONFIG[network as Cosmos_Network]

      const Keplr = await getKeplr()
      Keplr?.enable(chainId)

      const offlineSigner = Keplr?.getOfflineSigner(chainId)
      const accounts = await offlineSigner?.getAccounts()
      setCosmosAddressConnected(true)
      if (accounts) {
        setAccounts(accounts)
      }
      if (offlineSigner) {
        if (network === 'evmos_9001-2') {
          console.info('evmos_9001-2', offlineSigner)
          const signer = await Keplr?.getOfflineSigner('evmos_9001-2')

          // 创建 registry
          const registry = createDefaultRegistry()

          // 传入 registry 到 SigningKeplrEthermintClient
          const signingKeplrEthermintClient =
            signer &&
            (await SigningKeplerEthermintClient.online(rpc, signer, {
              registry,
              aminoTypes,
              accountParser
            }))

          ;(window as any).signingKeplrEthermintClient = {
            client: signingKeplrEthermintClient,
            signer: offlineSigner,
            registry // 保存 registry 供后续使用
          }
        } else {
          setOfflineSigner(offlineSigner)
        }
      }

      if (accounts !== undefined && accounts?.length > 0) {
        setCosmosAddresses(chainId, accounts[0].address, true)
      }

      if (accounts !== undefined && accounts?.length > 0 && offlineSigner) {
        const cosmJS = await SigningStargateClient.connectWithSigner(rpc, offlineSigner, {
          registry: createDefaultRegistry(),
          aminoTypes: aminoTypes,
          accountParser: accountParser
        })

        ;(window as any).signingCosmosClient = (window as any).signingCosmosClient || {}

        const clientName = `${network}Client`
        ;(window as any).signingCosmosClient[clientName] = cosmJS
      }

      setKeplr(true)
    },
    [setKeplr, setCosmosAddressConnected, setCosmosAddresses]
  )

  useEffect(() => {
    const connectedChains = cosmosAddresses.filter(addr => addr.connected)
    if (!init && connectedChains.length > 0) {
      connectedChains.forEach(chain => {
        enableKeplr(chain.chainId as Cosmos_Network)
      })
      init = true
    }
  }, [enableKeplr, cosmosAddressConnected, cosmosAddresses])

  const disconnectKeplr = (network: string) => {
    setCosmosAddresses(network, '', false)
    setCosmosAddressConnected(false)
  }

  return {
    accounts,
    offlineSigner,
    enableKeplr,
    disconnectKeplr,
    getActiveAccount,
  }
}
