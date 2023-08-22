import React from 'react'

import { storiesOf } from '@storybook/react'

import { GridRow, GridCol } from '../Grid'

import { TestComponent } from '.'

storiesOf('RVD', module)
  .add('default', () =>
    <GridRow>
      <GridCol col={{ span: 12 }}>
        <TestComponent
        />
      </GridCol>



    </GridRow>
  )
