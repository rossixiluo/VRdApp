import '@emotion/react'

import createTheme from '@monorepo/design-tokens'

export type ThemeType = typeof createTheme

declare module '@emotion/react' {
  export interface Theme extends ThemeType {}
}

declare global {
  interface Window {
    ethereum: import('ethers').providers.ExternalProvider
    connectPhantom: () => Promise<void>
  }
}
