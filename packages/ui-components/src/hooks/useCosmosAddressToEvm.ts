import { Buffer } from 'buffer'
import { bech32 } from 'bech32'

function getBytes(address: string) {
  const decoded = bech32.decode(address)

  return Buffer.from(bech32.fromWords(decoded.words))
}

export default function useCosmosAddressToEvm(address: string | null | undefined) {
  try {
    const cosmosAddressToEvm = (address: string) => {
      const bytes = getBytes(address)
      const prefix = '0x'
      const hex = bytes.toString('hex')
      return prefix + hex
    }
    if (address !== undefined && address !== null) {
      return cosmosAddressToEvm(address)
    }
  } catch (error) {
    return ''
  }

}
