/* eslint-disable @typescript-eslint/no-empty-function */
import { Card } from '..'

export function WithButton () {
  return (
    <Card
      title={'Title'}
      onArrowClick={() => {}}
      onMoreClick={() => {}}
    >
      <p>With Button</p>
      <p>More content</p>
      <p>More content</p>
      <p>More content</p>
      <p>More content</p>
    </Card>
  )
}
