import { useAppStore } from '../../state'
import { SupportedChainId } from '../../constants/chains'

const ProtectedError = ({ children, className }: { children: JSX.Element; className?: string }) => {
  const error = useAppStore(state => state.error)
  const fromChainID = useAppStore(state => state.fromChainID)
  const toChainID = useAppStore(state => state.toChainID)
  if (fromChainID === SupportedChainId.SOLANA && toChainID === SupportedChainId.SOLANA) {
    return children
  }
  if (error !== '') {
    return (
      <button
        disabled
        className="px-6 py-3.5 text-white flex-1 bg-red-400 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto  text-center "
      >
        {' '}
        {error}
      </button>
    )
  }
  return children
}

export default ProtectedError
