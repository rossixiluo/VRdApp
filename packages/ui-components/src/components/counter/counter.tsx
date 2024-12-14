import { useAppStore } from '../../state'

export function Counter() {
  const count = useAppStore(state => state.counter)
  const increase = useAppStore(state => state.increase)

  return (
    <div>
      <span>{count}</span>
      <button
        onClick={() => {
          increase(1)
        }}
      >
        one up
      </button>
    </div>
  )
}
