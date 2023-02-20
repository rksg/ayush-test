import React from 'react'

import { storiesOf }               from '@storybook/react'
import { Radio, RadioChangeEvent } from 'antd'
import { defineMessage }           from 'react-intl'

import { GridRow, GridCol } from '../Grid'

import { RadioCard, RadioCardCategory as Category } from '.'

storiesOf('RadioCard', module)
  .add('default', () =>
    <GridRow>
      <GridCol col={{ span: 6 }}>
        <RadioCard
          value='service'
          title='Service'
          description={
            'Fas pysuhet såväl som sedora. Val tingar mer. Ock whataboutism. Tiktigt syss rena.'
          }
          categories={[Category.WIFI, Category.SWITCH, Category.EDGE]}
          // eslint-disable-next-line no-console
          onClick={()=>console.log('Button clicked!')}
        />
      </GridCol>
    </GridRow>
  )
  .add('radio', () =>
    <Radio.Group
      // eslint-disable-next-line no-console
      onChange={(e: RadioChangeEvent) => console.log( e.target.value)}
    >
      <GridRow>
        <GridCol col={{ span: 6 }}>
          <RadioCard
            type='radio'
            value='service1'
            title='Service1'
            // eslint-disable-next-line max-len
            description='Fas pysuhet såväl som sedora. Val tingar mer. Ock whataboutism. Tiktigt syss rena.'
            categories={[Category.WIFI, Category.SWITCH, Category.EDGE]}
          />
        </GridCol>
        <GridCol col={{ span: 6 }}>
          <RadioCard
            type='radio'
            value='service2'
            title='Service2 (where title should run into the next line)'
            // eslint-disable-next-line max-len
            description='Fas pysuhet såväl som sedora. Val tingar mer. Ock whataboutism. Tiktigt syss rena.'
            categories={[Category.WIFI, Category.SWITCH, Category.EDGE]}
          />
        </GridCol>
        <GridCol col={{ span: 6 }}>
          <RadioCard
            type='radio'
            value='service3'
            title='Service3'
            // eslint-disable-next-line max-len
            description='Fas pysuhet såväl som sedora. Val tingar mer. Ock whataboutism. Tiktigt syss rena.'
            categories={[Category.WIFI, Category.SWITCH, Category.EDGE]}
            disabled
          />
        </GridCol>
      </GridRow>
    </Radio.Group>
  )
  .add('button', () =>
    <GridRow>
      <GridCol col={{ span: 6 }}>
        <RadioCard
          type='button'
          value='service'
          title='Service'
          description={
            'Fas pysuhet såväl som sedora. Val tingar mer. Ock whataboutism. Tiktigt syss rena.'
          }
          categories={[Category.WIFI, Category.SWITCH, Category.EDGE]}
          buttonText={defineMessage({ defaultMessage: 'Add' })}
          // eslint-disable-next-line no-console
          onClick={()=>console.log('Button clicked!')}
        />
      </GridCol>
    </GridRow>
  )

export {}
