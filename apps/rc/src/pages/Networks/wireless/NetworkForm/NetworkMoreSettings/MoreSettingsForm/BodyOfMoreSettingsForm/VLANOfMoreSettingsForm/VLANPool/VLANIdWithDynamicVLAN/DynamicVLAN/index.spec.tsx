import '@testing-library/jest-dom'

import { render, screen } from '@acx-ui/test-utils'

import DynamicVLAN from 'apps/rc/src/pages/Networks/wireless/NetworkForm/NetworkMoreSettings/MoreSettingsForm/BodyOfMoreSettingsForm/VLANOfMoreSettingsForm/VLANPool/VLANIdWithDynamicVLAN/DynamicVLAN/index'


describe('DynamicVLAN', () => {
  it('should render DynamicVLAN Field correctly', function () {
    // GIVEN
    const enableVxLan = true
    // WHEN
    render(<DynamicVLAN enableVxLan={enableVxLan} />)
    // THEN
    expect(screen.getByTestId('DynamicVLAN')).toBeInTheDocument()
    expect(screen.getByText('Dynamic VLAN')).toBeInTheDocument()
    expect(screen.getByRole('switch')).toBeInTheDocument()
    expect(screen.getByRole('switch')).toBeDisabled()
  })

  it('should be enabled when enableVxLan is false', function () {
    // GIVEN
    const enableVxLan = false
    // WHEN
    render(<DynamicVLAN enableVxLan={enableVxLan} />)
    // THEN
    expect(screen.getByRole('switch')).toBeEnabled()
  })
})
