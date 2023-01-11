import React from 'react'

import { storiesOf }               from '@storybook/react'
import { Radio, RadioChangeEvent } from 'antd'
import { defineMessage }           from 'react-intl'

import { RadioCard } from '.'

storiesOf('RadioCard', module)
  .add('default', () => <div style={{ width: '238px', display: 'inline-block' }}>
    <RadioCard
      value='service'
      title='Service'
      description={
        'Fas pysuhet såväl som sedora. Val tingar mer. Ock whataboutism. Tiktigt syss rena.'
      }
      categories={['WiFi', 'Switch', 'Edge']}
      // eslint-disable-next-line no-console
      onClick={()=>console.log('Button clicked!')}
    />
  </div>)
  .add('radio', () =>
    <Radio.Group
      // eslint-disable-next-line no-console
      onChange={(e: RadioChangeEvent) => console.log( e.target.value)}
    >
      <div style={{ width: '238px', display: 'inline-block', padding: '10px' }}>
        <RadioCard
          type='radio'
          value='service1'
          title='Service1'
          // eslint-disable-next-line max-len
          description='Fas pysuhet såväl som sedora. Val tingar mer. Ock whataboutism. Tiktigt syss rena.'
          categories={['WiFi', 'Switch', 'Edge']}
        />
      </div>
      <div style={{ width: '238px', display: 'inline-block', padding: '10px' }}>
        <RadioCard
          type='radio'
          value='service2'
          title='Service2'
          // eslint-disable-next-line max-len
          description='Fas pysuhet såväl som sedora. Val tingar mer. Ock whataboutism. Tiktigt syss rena.'
          categories={['WiFi', 'Switch', 'Edge']}
        />
      </div>
      <div style={{ width: '238px', display: 'inline-block', padding: '10px' }}>
        <RadioCard
          type='radio'
          value='service3'
          title='Service3'
          // eslint-disable-next-line max-len
          description='Fas pysuhet såväl som sedora. Val tingar mer. Ock whataboutism. Tiktigt syss rena.'
          categories={['WiFi', 'Switch', 'Edge']}
          disabled
        />
      </div>
    </Radio.Group>
  )
  .add('button', () => <div style={{ width: '238px', display: 'inline-block' }}>
    <RadioCard
      type='button'
      value='service'
      title='Service'
      description={
        'Fas pysuhet såväl som sedora. Val tingar mer. Ock whataboutism. Tiktigt syss rena.'
      }
      categories={['WiFi', 'Switch', 'Edge']}
      buttonText={defineMessage({ defaultMessage: 'Add' })}
      // eslint-disable-next-line no-console
      onClick={()=>console.log('Button clicked!')}
    />
  </div>)

export {}
