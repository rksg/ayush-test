/* eslint-disable @typescript-eslint/no-empty-function */
import { Card } from '..'

const Content = ({ title }: { title: string }) => (
  <>
    <p>{title}</p>
    <p>More content.</p>
    <p>More content.</p>
    <p>More content.</p>
    <p>More content.</p>
    <p>More content.</p>
  </>
)

export function WithTabOnly () {
  return (
    <Card
      tabs={[
        {
          value: 'tab1',
          label: 'tab - 1',
          component: <Content title={'Tab 1'} />
        },
        {
          value: 'tab2',
          label: 'tab - 2',
          component: <Content title={'Tab 2'} />
        },
        {
          value: 'tab3',
          label: 'tab - 3',
          component: <Content title={'Tab 3'} />
        }
      ]}
      defaultTab={'tab2'}
      onExpandClick={() => {}}
      onMoreClick={() => {}}
    />
  )
}
