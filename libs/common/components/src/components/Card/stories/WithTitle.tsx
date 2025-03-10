import { Card } from '..'

export function WithTitle () {
  return (
    <>
      <div style={{ width: '200px' }}>
        <Card title={'Long Long Long Long Title'} subTitle={'This is optional subtitle'} >
          With Title
        </Card>
      </div>

      <Card title={{ title: 'Title', icon: <>(icon)</> }} subTitle={'This is optional subtitle'}>
        With Title
      </Card>
    </>
  )
}
