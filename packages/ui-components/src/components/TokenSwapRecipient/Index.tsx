import RecipientModel from './RecipientModel'
const TokenSwapRecipient = () => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-valuerouter-primary font-medium">Recipient Address</span>
      <RecipientModel></RecipientModel>
    </div>
  )
}

export default TokenSwapRecipient
