/* eslint-disable @typescript-eslint/no-empty-function */
import { Card } from '..'

export function WithButton () {
  return (
    <Card
      title={'Title'}
      onExpandClick={() => {}}
      onMoreClick={() => {}}
    >
      <div>
        <p>With Button</p>
        <p>More content</p>
        <p>More content</p>
        <p>More content</p>
        <p>More content</p>
      </div>
    </Card>
  )
}
