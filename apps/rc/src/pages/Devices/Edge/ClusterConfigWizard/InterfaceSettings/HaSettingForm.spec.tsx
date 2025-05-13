import { ReactNode } from 'react'

import { render, screen } from '@acx-ui/test-utils'

import { HaSettingForm } from './HaSettingForm'

jest.mock('@acx-ui/rc/components', () => ({
  TypeForm: ({ header, content }: { header: string, content: ReactNode }) =>
    <div data-testid='TypeForm'>{header}{content}</div>,
  EdgeHaSettingsForm: () => <div data-testid='EdgeHaSettingsForm' />
}))

describe('InterfaceSettings - HaSettingForm', () => {
  it('should render correctly', async () => {
    render(<HaSettingForm />)

    expect(screen.getByTestId('TypeForm')).toBeVisible()
    expect(screen.getByText('HA Settings')).toBeVisible()
    expect(screen.getByTestId('EdgeHaSettingsForm')).toBeVisible()
  })
})