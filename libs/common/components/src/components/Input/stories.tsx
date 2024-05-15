import React from 'react'

import { storiesOf } from '@storybook/react'
import { Form }      from 'antd'

import { PasswordInputStrength } from './PasswordInputStrength'

import { PasswordInput } from '.'

function Wrapper (props: { children: React.ReactNode }) {
  return <div {...props} style={{ position: 'absolute', top: 100, left: 500 }} />
}


storiesOf('Input', module).add('Password Input', () => (
  <Wrapper>
    <PasswordInput />
  </Wrapper>
))

storiesOf('Input', module).add('Password Input Strength', () => {
  const [conditionMet, setConditionMet] = React.useState(false)

  return <Wrapper>
    <Form>
      <Form.Item
        name='passwordfield'
        className='password-input-strength'
        style={{ width: '350px' }}
        rules={[
          { validator: () => conditionMet ? Promise.resolve() : Promise.reject() }
        ]}>
        <PasswordInputStrength onConditionCountMet={setConditionMet} />
      </Form.Item>
    </Form>
  </Wrapper>
})


storiesOf('Input', module).add('Password Input Strength - Custom rules', () => {
  const [conditionMet, setConditionMet] = React.useState(false)

  return <Wrapper>
    <Form>
      <Form.Item
        name='passwordfield'
        className='password-input-strength'
        style={{ width: '350px' }}
        rules={[
          { validator: () => conditionMet ? Promise.resolve() : Promise.reject() }
        ]}>
        <PasswordInputStrength
          regExRules={[
            /^.{8,}$/,
            /(?=.*[a-z])(?=.*[A-Z])/,
            /(?=.*\d)/
          ]}
          regExErrorMessages={[
            '8 characters',
            'One uppercase and one lowercase letters',
            'One number'
          ]}
          isAllConditionsMet={3}
          onConditionCountMet={setConditionMet}
        />
      </Form.Item>
    </Form>
  </Wrapper>
})

export {}
