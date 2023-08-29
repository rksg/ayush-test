import React from 'react'

import { storiesOf } from '@storybook/react'

import { GridRow, GridCol } from '../Grid'

import { TestComponent } from '.'

storiesOf('RVD', module)
  .add('default', () =>
    <GridRow>
      <GridCol col={{ span: 8 }} style={{ maxWidth: 240 }}>
        <TestComponent
        />
      </GridCol>
    </GridRow>
  )
