import React from 'react'

import { storiesOf } from '@storybook/react'

import { ErrorBoundary }    from './ErrorBoundary'
import { SuspenseBoundary } from './SuspenseBoundary'

function ErrorProducer () {
  React.useEffect(() => { throw new Error('oops') }, [])
  return null
}

function PromiseProducer <T> (props: { done: boolean, promise: Promise<T> }) {
  if (!props.done) throw props.promise
  return <div>OK</div>
}

storiesOf('Boundary', module)
  .add('ErrorBoundary', () => <ErrorBoundary>
    <ErrorProducer />
  </ErrorBoundary>)
  .add('SuspenseBoundary', () => {
    const [done, setDone] = React.useState(false)
    const promise = new Promise((resolve) => setTimeout(() => {
      setDone(true)
      resolve(null)
    }, 3_000))
    return <SuspenseBoundary>
      <PromiseProducer {...{ done, promise }} />
    </SuspenseBoundary>
  })

export {}
