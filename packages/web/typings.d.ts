import { providers } from '@monorepo/ui-components'
import { Window as KeplrWindow } from '@keplr-wallet/types'

declare global {
  interface Window extends KeplrWindow {
    ethereum: providers.ExternalProvider
    connectPhantom: () => Promise<void>
  }
}
