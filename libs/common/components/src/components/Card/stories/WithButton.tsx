/* eslint-disable @typescript-eslint/no-empty-function */
import { Card } from '..'

export function WithButton () {
  return (
    <Card
      title={'Title'}
      onExpandClick={() => {}}
      onMoreClick={() => {}}
    >
      <p>More content.</p>
      <p>More content.</p>
      <p>More content.</p>
      <p>More content.</p>
      <p>More content.</p>
    </Card>
  )
}
