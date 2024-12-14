import { CopyToClipboard } from 'react-copy-to-clipboard'
import { ClipboardDocumentIcon } from '@heroicons/react/20/solid'

import React, { FC, useCallback } from 'react'
import { useToasts } from 'react-toast-notifications'
import { cutOut } from '../../utils'

type Prop = {
  addr?: string | null
}
const CopyAddressBtn: FC<Prop> = ({ addr }) => {
  const { addToast } = useToasts()

  const showAddr = addr || ''

  const onCopy = useCallback(() => {
    if (showAddr == undefined) {
      return
    }
    addToast(`Copy ${cutOut(showAddr, 4, 4)} successful`, { appearance: 'success' })
  }, [addToast, showAddr])
  return (
    <CopyToClipboard text={showAddr} onCopy={() => onCopy()}>
      <button
        type="button"
        className="text-blue-700  bg-gray-200
hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 
font-medium rounded-lg text-sm   p-1.5 text-center inline-flex items-center mr-2"
      >
        <ClipboardDocumentIcon data-tooltip-id="tooltip" data-tooltip-content="Copy to clipboard" className=" h-4 w-4 cursor-pointer "></ClipboardDocumentIcon>
      </button>
    </CopyToClipboard>
  )
}

export default CopyAddressBtn
