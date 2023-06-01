import userEvent from '@testing-library/user-event'

import { render, screen } from '@acx-ui/test-utils'

import { PasswordInput } from '.'

describe('Input', () => {
  it('should render Input.Password with open eye icon correctly', async () => {
    render(<PasswordInput />)
    const eyeOpenIcon = await screen.findByTestId('EyeOpenSolid')
    expect(eyeOpenIcon).toBeVisible()
  })
  it('should render the eye slash icon correctly', async () => {
    render(<PasswordInput />)
    const eyeOpenIcon = await screen.findByTestId('EyeOpenSolid')
    await userEvent.click(eyeOpenIcon)

    const eyeSlashIcon = await screen.findByTestId('EyeSlashSolid')
    expect(eyeSlashIcon).toBeVisible()
  })
})
