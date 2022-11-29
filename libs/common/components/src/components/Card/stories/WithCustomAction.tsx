import { Card } from '..'

export function WithCustomAction () {
  const onActionClick = () => {}
  return (
    <Card
      title='Title'
      action={{
        actionName: 'Details',
        onActionClick: onActionClick
      }}
    >
      With Custom Action
    </Card>
  )
}
