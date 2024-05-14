import { storiesOf } from '@storybook/react'

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
    <PasswordInputStrength />
  </Wrapper>
))


storiesOf('Input', module).add('Password Input Strength - Custom rules', () => (
  <Wrapper>
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
      minlevel={3}
    />
  </Wrapper>
))

export {}
