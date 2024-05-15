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

storiesOf('Input', module).add('Password Input Strength', () => (
  <Wrapper>
    <Form.Item
      className='password-input-strength'>
      <PasswordInputStrength />
    </Form.Item>
  </Wrapper>
))


storiesOf('Input', module).add('Password Input Strength - Custom rules', () => (
  <Wrapper>
    <Form.Item
      className='password-input-strength'>
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
      />
    </Form.Item>
  </Wrapper>
))

export {}
