
import { storiesOf } from '@storybook/react'

import { GridRow, GridCol } from '@acx-ui/components'

import { SlidingDoor } from '.'

storiesOf('SlidingDoor', module)
  .add('default', () =>
    <GridRow>
      <GridCol col={{ span: 8 }} style={{ maxWidth: 240 }}>
        <SlidingDoor
          data={{
            id: '1',
            name: 'network',
            type: 'network',
            children: [
              {
                id: '2', name: 'child1', type: 'system',
                children: [{ id: '4', name: 'child3', type: 'domain' },
                  { id: '4', name: 'child5', type: 'domain' }]
              },
              {
                id: '3', name: 'child2', type: 'system',
                children: [{ id: '5', name: 'child4', type: 'domain' }]
              }
            ]
          }}
          setNetworkPath={() => {}}
          defaultSelectedNode={[{
            name: 'Network',
            type: 'network'
          }]}
        />
      </GridCol>
    </GridRow>
  )
