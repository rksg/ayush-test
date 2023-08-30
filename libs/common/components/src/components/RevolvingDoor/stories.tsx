
import { storiesOf } from '@storybook/react'

import { GridRow, GridCol } from '../Grid'

import { RevolvingDoor } from '.'

storiesOf('RVD', module)
  .add('default', () =>
    <GridRow>
      <GridCol col={{ span: 8 }} style={{ maxWidth: 240 }}>
        <RevolvingDoor
        />
      </GridCol>
    </GridRow>
  )
