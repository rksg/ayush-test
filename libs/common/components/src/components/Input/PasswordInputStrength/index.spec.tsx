import userEvent    from '@testing-library/user-event'
import { debounce } from 'lodash'

import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { cssStr } from '../../../theme/helper'

import { PasswordInputStrength } from '.'

describe('Input', () => {
  it('should render the PasswordInputStrength correctly', async () => {
    const { asFragment } = render(<PasswordInputStrength placeholder='Password'/>)
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector(`path[fill="${cssStr('--acx-neutrals-20')}"]`))
      .not.toBeNull()
    const passwordInput = await screen.findByPlaceholderText('Password')
    await userEvent.type(passwordInput, '1234abC!')
    expect(screen.queryByTestId('tooltipInfo')).toBeNull()
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector(`path[fill="${cssStr('--acx-semantics-green-50')}"]`))
      .not.toBeNull()
  })
  it('should render where the password does not meet the specified rule', async () => {
    const { asFragment } = render(<PasswordInputStrength placeholder='Password'/>)
    const passwordInput = await screen.findByPlaceholderText('Password')
    await userEvent.type(passwordInput, '1234abC')
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector(`path[fill="${cssStr('--acx-semantics-yellow-50')}"]`))
      .not.toBeNull()
  })
  it('should render the PasswordInputStrength tooltip correctly', async () => {
    render(<PasswordInputStrength
      placeholder='Password'
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
    />)
    const tooltipIcon = await screen.findByTestId('tooltipIcon')
    const passwordInput = await screen.findByPlaceholderText('Password')
    await userEvent.type(passwordInput, '1234abC')
    expect(screen.queryByTestId('tooltipInfo')).toBeNull()
    debounce(async () => {
      fireEvent.mouseEnter(tooltipIcon)
      expect(await screen.findByTestId('tooltipInfo')).toBeVisible()
    }, 1000)
  })
  it('should render the PasswordInputStrength with value correctly', async () => {
    const { asFragment } = render(
      <PasswordInputStrength
        name={'authPassword'}
        isAllConditionsMet={4}
        onConditionCountMet={jest.fn()}
        value='1234abC!'/>)
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector(`path[fill="${cssStr('--acx-semantics-green-50')}"]`))
      .not.toBeNull()
    const tooltipIcon = await screen.findByTestId('tooltipIcon')
    fireEvent.mouseEnter(tooltipIcon)
    debounce(async () => {
      const tooltip = await screen.findByTestId('tooltipInfo')
      expect(tooltip).toBeVisible()
    }, 100)
  })
  it('should render the PasswordInputStrength with mouseLeave tooltip icon correctly', async () => {
    const { asFragment } = render(
      <PasswordInputStrength
        name={'authPassword'}
        isAllConditionsMet={4}
        onChange={jest.fn()}
        value='1234abC!'/>)
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector(`path[fill="${cssStr('--acx-semantics-green-50')}"]`))
      .not.toBeNull()
    const tooltipIcon = await screen.findByTestId('tooltipIcon')
    fireEvent.mouseLeave(tooltipIcon)
    debounce(async () => {
      const tooltip = await screen.findByTestId('tooltipInfo')
      expect(tooltip).not.toBeVisible()
    }, 100)
  })
  it('should render the PasswordInputStrength eye icon correctly', async () => {
    render(<PasswordInputStrength />)
    const eyeOpenIcon = await screen.findByTestId('EyeOpenSolid')
    await userEvent.click(eyeOpenIcon)
    const eyeSlashIcon = await screen.findByTestId('EyeSlashSolid')
    expect(eyeSlashIcon).toBeVisible()
  })

  it('should call setForceFocusOn(false) when input is blurred', async () => {
    const setForceFocusOn = jest.fn()
    render(
      <PasswordInputStrength
        placeholder='Password'
        setForceFocusOn={setForceFocusOn}
      />
    )
    const input = await screen.findByPlaceholderText('Password')
    fireEvent.focus(input)  // simulate focus first
    fireEvent.blur(input)   // then blur it
    expect(setForceFocusOn).toHaveBeenCalledWith(false)
  })
})
