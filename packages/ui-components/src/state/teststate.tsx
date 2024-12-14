import { useAppStore } from './index'

export const TestApp = function () {
  const counter = useAppStore(state => state.counter)
  const inc = useAppStore(state => state.increase)

  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <button
        onClick={() => {
          inc(1)
        }}
      >
        Click to increment counter by 1
      </button>
      <h5>{`the counter value is ${counter}`}</h5>
    </div>
  )
}
