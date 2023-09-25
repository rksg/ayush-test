
import { storiesOf } from '@storybook/react'

import { GridRow, GridCol } from '../Grid'

import { RevolvingDoor } from '.'
const data = {
  name: 'parent',
  type: 'parent',
  children: [{
    name: 'child-1',
    type: 'child-1',
    children: [{
      name: 'child-2',
      type: 'child-2',
      children: [{
        name: 'child-3',
        type: 'child-3',
        children: [{
          name: 'child-4',
          type: 'child-4'
        }]

      }]

    }]

  }]
}
storiesOf('RVD', module)
  .add('default', () =>
    <GridRow>
      <GridCol col={{ span: 8 }} style={{ maxWidth: 240 }}>
        <RevolvingDoor data={data}
          setNetworkPath={()=>{}}
        />
      </GridCol>
    </GridRow>
  )
