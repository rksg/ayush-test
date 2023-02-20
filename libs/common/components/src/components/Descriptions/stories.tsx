import { storiesOf } from '@storybook/react'
import { Divider }   from 'antd'

import { Button } from '../Button'
import { Card }   from '../Card'
import { Drawer } from '../Drawer'

import { Descriptions } from '.'

export function DescriptionsContent () {
  return <>
    <Descriptions>
      <Descriptions.Item
        label='Venue'
        children={<Button type='link' size='small'>BDCSZ</Button>}
      />
      <Descriptions.Item
        label='AP Group'
        children='None'
      />
      <Descriptions.Item
        label='GPS Coordinates'
        children={<>
          {'37.411275, -122.019191'}<br />
          {'(As venue)'}
        </>}
      />
    </Descriptions>
    <Divider />
    <Descriptions>
      <Descriptions.Item
        label='S/N'
        children='932173000117'
      />
      <Descriptions.Item
        label='MAC Address'
        children='58:FB:96:01:9A:30'
      />
      <Descriptions.Item
        label='MAC Address'
        children=''
      />
      <Descriptions.Item
        children={<Descriptions.NoLabel>
          <div style={{
            padding: '3px 6px',
            fontWeight: 'bold',
            background: 'black',
            color: 'white'
          }}>Another Component</div>
        </Descriptions.NoLabel>}
      />
    </Descriptions>
  </>
}

storiesOf('Descriptions', module)

  .add('In Drawer', () => (
    <Drawer title='Descriptions In Drawer' visible>
      <DescriptionsContent />
    </Drawer>
  ))

  .add('In Card', () => (
    <div style={{ width: '350px' }}>
      <Card title='Descriptions In Card'>
        <DescriptionsContent />
      </Card>
    </div>
  ))
