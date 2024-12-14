/*
 * Copyright (c) 2024, Circle Internet Financial LTD All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as anchor from '@coral-xyz/anchor'
import { PublicKey, AddressLookupTableAccount, TransactionInstruction, SystemProgram, Transaction, LAMPORTS_PER_SOL, Connection } from '@solana/web3.js'
import * as spl from '@solana/spl-token'
import { utils } from 'ethers'
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes/index.js'
// import { getAssociatedTokenAddressSync } from '@solana/spl-token';
// import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

import { MessageTransmitter, IDL as MessageTransmitterIDL } from '../constants/ABI/message_transmitter'
import { TokenMessengerMinter, IDL as TokenMessengerMinterIDL } from '../constants/ABI/token_messenger_minter'
import { ValueRouter, IDL as ValueRouterIDL } from '../constants/ABI/value_router'
import { Circle_Chainid } from '../constants/relayer'
import { SupportedChainId } from '../constants/chains'
import { Relayer_IDS_TO_ADDR } from '../constants/relayer'
import { amountThreshold } from '../constants/relayer'
const relayer = Relayer_IDS_TO_ADDR['solana']

export const IRIS_API_URL = 'https://iris-api-sandbox.circle.com'
export const SOLANA_SRC_DOMAIN_ID = Circle_Chainid[SupportedChainId.SOLANA]

export interface FindProgramAddressResponse {
  publicKey: anchor.web3.PublicKey
  bump: number
}

export const wsolMint = new PublicKey('So11111111111111111111111111111111111111112')

// Configure client to use the provider and return it.
// Must set ANCHOR_WALLET (solana keypair path) and ANCHOR_PROVIDER_URL (node URL) env vars
export const getAnchorConnection = () => {
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  return provider
}

export const getPrograms = (provider: anchor.AnchorProvider) => {
  const messageTransmitterProgram = new anchor.Program<MessageTransmitter>(
    MessageTransmitterIDL,
    new PublicKey('CCTPmbSD7gX1bxKPAmg77w8oFzNFpaQiQUWD43TKaecd'),
    provider
  )

  const tokenMessengerMinterProgram = new anchor.Program<TokenMessengerMinter>(
    TokenMessengerMinterIDL,
    new PublicKey('CCTPiPYPc6AsJuwueEnWgSgucamXDZwBd53dQ11YiKX3'),
    provider
  )

  const valueRouterProgram = new anchor.Program<ValueRouter>(ValueRouterIDL, new PublicKey(relayer), provider)

  return {
    messageTransmitterProgram,
    tokenMessengerMinterProgram,
    valueRouterProgram
  }
}

export const getDepositForBurnPdas = (
  { messageTransmitterProgram, tokenMessengerMinterProgram }: ReturnType<typeof getPrograms>,
  usdcAddress: PublicKey,
  destinationDomain: number
) => {
  const messageTransmitterAccount = findProgramAddress('message_transmitter', messageTransmitterProgram.programId)
  const tokenMessengerAccount = findProgramAddress('token_messenger', tokenMessengerMinterProgram.programId)
  const tokenMinterAccount = findProgramAddress('token_minter', tokenMessengerMinterProgram.programId)
  const localToken = findProgramAddress('local_token', tokenMessengerMinterProgram.programId, [usdcAddress])
  const remoteTokenMessengerKey = findProgramAddress('remote_token_messenger', tokenMessengerMinterProgram.programId, [destinationDomain.toString()])
  const authorityPda = findProgramAddress('sender_authority', tokenMessengerMinterProgram.programId)

  return {
    messageTransmitterAccount,
    tokenMessengerAccount,
    tokenMinterAccount,
    localToken,
    remoteTokenMessengerKey,
    authorityPda
  }
}

export const getInitializePdas = ({ valueRouterProgram }: ReturnType<typeof getPrograms>) => {
  const valueRouterAccount = findProgramAddress('value_router', valueRouterProgram.programId)
  const authorityPda = findProgramAddress('sender_authority', valueRouterProgram.programId)

  return {
    authorityPda,
    valueRouterAccount
  }
}

export const getSwapAndBridgePdas = (
  { messageTransmitterProgram, tokenMessengerMinterProgram, valueRouterProgram }: ReturnType<typeof getPrograms>,
  usdcAddress: PublicKey,
  destinationDomain: number
) => {
  const valueRouterAccount = findProgramAddress('value_router', valueRouterProgram.programId)
  const messageTransmitterAccount = findProgramAddress('message_transmitter', messageTransmitterProgram.programId)
  const tokenMessengerAccount = findProgramAddress('token_messenger', tokenMessengerMinterProgram.programId)
  const tokenMinterAccount = findProgramAddress('token_minter', tokenMessengerMinterProgram.programId)
  const localToken = findProgramAddress('local_token', tokenMessengerMinterProgram.programId, [usdcAddress])
  const remoteTokenMessengerKey = findProgramAddress('remote_token_messenger', tokenMessengerMinterProgram.programId, [destinationDomain.toString()])
  const authorityPda = findProgramAddress('sender_authority', tokenMessengerMinterProgram.programId)
  const authorityPda2 = findProgramAddress('sender_authority', valueRouterProgram.programId)
  const eventAuthority = findProgramAddress('__event_authority', valueRouterProgram.programId)

  return {
    valueRouterAccount,
    messageTransmitterAccount,
    tokenMessengerAccount,
    tokenMinterAccount,
    localToken,
    remoteTokenMessengerKey,
    authorityPda,
    authorityPda2,
    eventAuthority
  }
}

export const getReceiveMessagePdas = async (
  { messageTransmitterProgram, tokenMessengerMinterProgram }: ReturnType<typeof getPrograms>,
  solUsdcAddress: PublicKey,
  remoteUsdcAddressHex: string,
  remoteDomain: string,
  nonce: string
) => {
  const tokenMessengerAccount = findProgramAddress('token_messenger', tokenMessengerMinterProgram.programId)
  const messageTransmitterAccount = findProgramAddress('message_transmitter', messageTransmitterProgram.programId)
  const tokenMinterAccount = findProgramAddress('token_minter', tokenMessengerMinterProgram.programId)
  const localToken = findProgramAddress('local_token', tokenMessengerMinterProgram.programId, [solUsdcAddress])
  const remoteTokenMessengerKey = findProgramAddress('remote_token_messenger', tokenMessengerMinterProgram.programId, [remoteDomain])
  const remoteTokenKey = new PublicKey(hexToBytes(remoteUsdcAddressHex))
  const tokenPair = findProgramAddress('token_pair', tokenMessengerMinterProgram.programId, [remoteDomain, remoteTokenKey])
  const custodyTokenAccount = findProgramAddress('custody', tokenMessengerMinterProgram.programId, [solUsdcAddress])
  const authorityPda = findProgramAddress('message_transmitter_authority', messageTransmitterProgram.programId, [
    tokenMessengerMinterProgram.programId
  ]).publicKey
  const tokenMessengerEventAuthority = findProgramAddress('__event_authority', tokenMessengerMinterProgram.programId)

  const usedNonces = await messageTransmitterProgram.methods
    .getNoncePda({
      nonce: new anchor.BN(nonce),
      sourceDomain: Number(remoteDomain)
    })
    .accounts({
      messageTransmitter: messageTransmitterAccount.publicKey
    })
    .view()

  return {
    messageTransmitterAccount,
    tokenMessengerAccount,
    tokenMinterAccount,
    localToken,
    remoteTokenMessengerKey,
    remoteTokenKey,
    tokenPair,
    custodyTokenAccount,
    authorityPda,
    tokenMessengerEventAuthority,
    usedNonces
  }
}

export const getRelayPdas = async (
  { messageTransmitterProgram, tokenMessengerMinterProgram, valueRouterProgram }: ReturnType<typeof getPrograms>,
  solUsdcAddress: PublicKey,
  remoteUsdcAddressHex: string,
  remoteDomain: string,
  nonce1: string,
  nonce2: string
) => {
  const tokenMessengerAccount = findProgramAddress('token_messenger', tokenMessengerMinterProgram.programId)
  const messageTransmitterAccount = findProgramAddress('message_transmitter', messageTransmitterProgram.programId)
  const tokenMinterAccount = findProgramAddress('token_minter', tokenMessengerMinterProgram.programId)
  const localToken = findProgramAddress('local_token', tokenMessengerMinterProgram.programId, [solUsdcAddress])
  const remoteTokenMessengerKey = findProgramAddress('remote_token_messenger', tokenMessengerMinterProgram.programId, [remoteDomain])
  const remoteTokenKey = new PublicKey(hexToBytes(remoteUsdcAddressHex))
  const tokenPair = findProgramAddress('token_pair', tokenMessengerMinterProgram.programId, [remoteDomain, remoteTokenKey])
  const custodyTokenAccount = findProgramAddress('custody', tokenMessengerMinterProgram.programId, [solUsdcAddress])
  const authorityPda = findProgramAddress('message_transmitter_authority', messageTransmitterProgram.programId, [
    tokenMessengerMinterProgram.programId
  ]).publicKey
  const tokenMessengerEventAuthority = findProgramAddress('__event_authority', tokenMessengerMinterProgram.programId)

  const usedNonces1 = await messageTransmitterProgram.methods
    .getNoncePda({
      nonce: new anchor.BN(nonce1),
      sourceDomain: Number(remoteDomain)
    })
    .accounts({
      messageTransmitter: messageTransmitterAccount.publicKey
    })
    .view()

  const usedNonces2 = await messageTransmitterProgram.methods
    .getNoncePda({
      nonce: new anchor.BN(nonce2),
      sourceDomain: Number(remoteDomain)
    })
    .accounts({
      messageTransmitter: messageTransmitterAccount.publicKey
    })
    .view()

  return {
    messageTransmitterAccount,
    tokenMessengerAccount,
    tokenMinterAccount,
    localToken,
    remoteTokenMessengerKey,
    remoteTokenKey,
    tokenPair,
    custodyTokenAccount,
    authorityPda,
    tokenMessengerEventAuthority,
    usedNonces1,
    usedNonces2
  }
}

export const evmAddressToBytes32 = (address: string): string => `0x000000000000000000000000${address.replace('0x', '')}`

export const hexToBytes = (hex: string): Uint8Array => hexStringToUint8Array(hex.replace('0x', ''))

// Convenience wrapper for PublicKey.findProgramAddressSync
export const findProgramAddress = (
  label: string,
  programId: PublicKey,
  extraSeeds: (string | number[] | Uint8Array | PublicKey)[] | null = null
): FindProgramAddressResponse => {
  const encoder = new TextEncoder()
  const seeds = [encoder.encode(label)] // Encode the label as UTF-8 and store as Uint8Array
  if (extraSeeds) {
    for (const extraSeed of extraSeeds) {
      if (typeof extraSeed === 'string') {
        seeds.push(encoder.encode(extraSeed)) // Encode extra strings as UTF-8
      } else if (Array.isArray(extraSeed)) {
        seeds.push(new Uint8Array(extraSeed)) // Convert number array to Uint8Array
      } else if (extraSeed instanceof Uint8Array) {
        seeds.push(extraSeed) // Use Uint8Array directly
      } else {
        seeds.push(new Uint8Array(extraSeed.toBytes())) // Convert PublicKey to Uint8Array
      }
    }
  }
  const [publicKey, bump] = PublicKey.findProgramAddressSync(seeds, programId)
  return { publicKey, bump }
}

// Fetches attestation from attestation service given the txHash
export const getMessages = async (txHash: string) => {
  let attestationResponse: any = {}
  while (attestationResponse.error || !attestationResponse.messages || attestationResponse.messages?.[0]?.attestation === 'PENDING') {
    const response = await fetch(`${IRIS_API_URL}/messages/${SOLANA_SRC_DOMAIN_ID}/${txHash}`)
    attestationResponse = await response.json()
    // Wait 2 seconds to avoid getting rate limited
    if (attestationResponse.error || !attestationResponse.messages || attestationResponse.messages?.[0]?.attestation === 'PENDING') {
      await new Promise(r => setTimeout(r, 2000))
    }
  }

  return attestationResponse
}

export const decodeEventNonceFromMessage = (messageHex: string): string => {
  const nonceIndex = 12
  const nonceBytesLength = 8
  const message = hexToBytes(messageHex)
  const eventNonceBytes = message.subarray(nonceIndex, nonceIndex + nonceBytesLength)
  const eventNonceHex = utils.hexlify(eventNonceBytes)
  return BigInt(eventNonceHex).toString()
}

export function hexStringToUint8Array(hexstring: string): Uint8Array {
  return new Uint8Array(hexstring.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16)))
}

export async function findAssociatedTokenAddress(walletAddress: string | PublicKey, mintAddress: string | PublicKey) {
  const walletPublicKey = typeof walletAddress === 'string' ? new PublicKey(walletAddress) : walletAddress

  const mintPublicKey = typeof mintAddress === 'string' ? new PublicKey(mintAddress) : mintAddress

  const associatedTokenAddress = await getAssociatedTokenAddressSync(mintPublicKey, walletPublicKey)

  return associatedTokenAddress.toBase58()
}

export function getAssociatedTokenAddressSync(
  mint: PublicKey,
  owner: PublicKey,
  allowOwnerOffCurve = false,
  programId = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
  associatedTokenProgramId = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
): PublicKey {
  // if (!allowOwnerOffCurve && !PublicKey.isOnCurve(owner.toBuffer())) return new PublicKey('Invalid owner');

  const [address] = PublicKey.findProgramAddressSync([owner.toBuffer(), programId.toBuffer(), mint.toBuffer()], associatedTokenProgramId)

  return address
}

export const getQuote = async (fromMint: string, toMint: string, amount: number) => {
  return fetch(
    `https://quote-api.jup.ag/v6/quote?outputMint=${toMint}&inputMint=${fromMint}&amount=${amount}&slippageBps=${amountThreshold}&maxAccounts=15`
  ).then(response => response.json())
}

export const getSwapIx = async (user: PublicKey, outputAccount: PublicKey, quote: any) => {
  const data = {
    quoteResponse: quote,
    userPublicKey: user.toBase58(),
    destinationTokenAccount: outputAccount.toBase58(),
    useSharedAccounts: false,
    wrapAndUnwrapSol: true
  }
  return fetch(`https://quote-api.jup.ag/v6/swap-instructions`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then(response => response.json())
}

export const getAdressLookupTableAccounts = async (connection: any, keys: string[]): Promise<AddressLookupTableAccount[]> => {
  const addressLookupTableAccountInfos = await connection.getMultipleAccountsInfo(keys.map(key => new PublicKey(key)))

  return addressLookupTableAccountInfos.reduce((acc: any, accountInfo: any, index: number) => {
    const addressLookupTableAddress = keys[index]
    if (accountInfo) {
      const addressLookupTableAccount = new AddressLookupTableAccount({
        key: new PublicKey(addressLookupTableAddress),
        state: AddressLookupTableAccount.deserialize(accountInfo.data)
      })
      acc.push(addressLookupTableAccount)
    }

    return acc
  }, new Array<AddressLookupTableAccount>())
}

export const instructionDataToTransactionInstruction = (instructionPayload: any) => {
  if (instructionPayload === null) {
    return null
  }

  return new TransactionInstruction({
    programId: new PublicKey(instructionPayload.programId),
    keys: instructionPayload.accounts.map((key: any) => ({
      pubkey: new PublicKey(key.pubkey),
      isSigner: key.isSigner,
      isWritable: key.isWritable
    })),
    data: Buffer.from(instructionPayload.data, 'base64')
  })
}

export function getBytes(value: any) {
  if (value instanceof Uint8Array) {
    return value
  }

  if (typeof value === 'string' && value.match(/^0x([0-9a-f][0-9a-f])*$/i)) {
    const result = new Uint8Array((value.length - 2) / 2)
    let offset = 2
    for (let i = 0; i < result.length; i++) {
      result[i] = parseInt(value.substring(offset, offset + 2), 16)
      offset += 2
    }
    return result
  }
  return new Uint8Array(value)
}

const usdcString = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const usdcAddress = new PublicKey(usdcString)
export async function createUSDCAccount(provider: any) {
  const associatedToken = spl.getAssociatedTokenAddressSync(
    usdcAddress,
    provider.wallet.publicKey,
    false,
    spl.TOKEN_PROGRAM_ID,
    spl.ASSOCIATED_TOKEN_PROGRAM_ID
  )

  const instructions = [
    spl.createAssociatedTokenAccountInstruction(
      provider.wallet.publicKey,
      associatedToken,
      provider.wallet.publicKey,
      usdcAddress,
      spl.TOKEN_PROGRAM_ID,
      spl.ASSOCIATED_TOKEN_PROGRAM_ID
    )
  ]

  return instructions
}

export async function createWsolAccountAndConvertSolToWsol(amount: number, provider: any) {
  const associatedToken = spl.getAssociatedTokenAddressSync(wsolMint, provider.wallet.publicKey, false, spl.TOKEN_PROGRAM_ID, spl.ASSOCIATED_TOKEN_PROGRAM_ID)

  const instructions = [
    spl.createAssociatedTokenAccountInstruction(
      provider.wallet.publicKey,
      associatedToken,
      provider.wallet.publicKey,
      wsolMint,
      spl.TOKEN_PROGRAM_ID,
      spl.ASSOCIATED_TOKEN_PROGRAM_ID
    ),
    SystemProgram.transfer({
      fromPubkey: provider.wallet.publicKey,
      toPubkey: associatedToken,
      lamports: amount
    }),
    spl.createSyncNativeInstruction(associatedToken, spl.TOKEN_PROGRAM_ID)
  ]

  return instructions
}

export async function convertSolToWsol(amount: number, provider: any, associatedToken: PublicKey) {
  const instructions = [
    SystemProgram.transfer({
      fromPubkey: provider.wallet.publicKey,
      toPubkey: associatedToken,
      lamports: amount
    }),
    spl.createSyncNativeInstruction(associatedToken, spl.TOKEN_PROGRAM_ID)
  ]

  return instructions
}

export async function getAccountInfo(connection: Connection, publicKey: PublicKey) {
  try {
    const accountInfo = await connection.getAccountInfo(publicKey)
    if (accountInfo === null) {
      return
    }
    return accountInfo
  } catch (error) {
    console.error('Error fetching account info:', error)
  }
}

export async function pollTransaction(connection: Connection, transactionSignature: string, interval: number, timeout: number): Promise<boolean | null> {
  return new Promise(resolve => {
    const endTime = Date.now() + timeout

    const intervalId = setInterval(async () => {
      if (Date.now() >= endTime) {
        clearInterval(intervalId)
        resolve(null)
        return
      }

      try {
        const transaction = await connection.getTransaction(transactionSignature, { commitment: 'confirmed', maxSupportedTransactionVersion: 0 })

        if (transaction) {
          clearInterval(intervalId)
          resolve(true)
        }
      } catch (error) {
        console.error('Error fetching transaction:', error)
      }
    }, interval)

    setTimeout(() => {
      clearInterval(intervalId)
      resolve(false)
    }, timeout)
  })
}

export const solanaAddressToHex = (solanaAddress: string) => utils.hexlify(bs58.decode(solanaAddress))

export async function sendJitoBundle(encodedTx: string, rpcBundles: string): Promise<string> {
  const payload = {
    jsonrpc: '2.0',
    id: Math.floor(Math.random() * 1000),
    method: 'sendBundle',
    params: [[encodedTx]]
  }

  const response = await fetch(rpcBundles + 'bundles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  return data.result
}

export async function pollBundleStatuses(bundleIds: string[], jitoApiUrl: string, interval: number, timeout: number): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const endTime = Date.now() + timeout

    const checkBundleStatuses = async () => {
      if (Date.now() >= endTime) {
        clearInterval(intervalId)
        reject(new Error('Polling timed out'))
        return
      }

      try {
        const response = await fetch(jitoApiUrl + 'bundles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: Math.floor(Math.random() * 1000),
            method: 'getBundleStatuses',
            params: [bundleIds]
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.error) {
          throw new Error(`Error getting bundle statuses: ${JSON.stringify(data.error, null, 2)}`)
        }

        // Check if value array exists and has items
        if (data.result?.value && data.result.value.length > 0) {
          const bundle = data.result.value[0]
          if (bundle.confirmation_status === 'confirmed' || bundle.confirmation_status === 'finalized') {
            clearInterval(intervalId)
            resolve(bundle.transactions)
          }
        }
      } catch (error) {
        console.error('Error fetching bundle statuses:', error)
      }
    }

    const intervalId = setInterval(checkBundleStatuses, interval)
    checkBundleStatuses() // Initial check

    setTimeout(() => {
      clearInterval(intervalId)
      reject(new Error('Polling timed out'))
    }, timeout)
  })
}
