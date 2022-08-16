import { Card } from '..'

export function NoBorder () {
  return (
    <Card title={'Title'} subTitle={'This is optional subtitle'} bordered={false}>
      WithTitle
    </Card>
  )
}

