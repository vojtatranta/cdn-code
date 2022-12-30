import * as React from 'react'
import ReactDOM from 'react-dom'

export default function App() {
  return (
    <>
      <h1>Start the test to see the result!</h1>
      <code>
        $ yarn test variable-utils.spec.ts
      </code>
      <h2>See the code!</h2>
      <code style={{ 'display': 'block', 'whiteSpace':'pre-wrap' }}>
        ./src/variable-utils.ts{"\n"}
        ./src/variable-utils.spec.ts
      </code>
    </>
  )
}


ReactDOM.render(<App />, document.getElementById('root'))
