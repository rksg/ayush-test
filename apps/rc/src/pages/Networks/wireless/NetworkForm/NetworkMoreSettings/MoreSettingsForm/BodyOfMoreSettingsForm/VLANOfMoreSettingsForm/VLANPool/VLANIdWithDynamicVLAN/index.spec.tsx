import '@testing-library/jest-dom'

import { render, screen } from '@acx-ui/test-utils'

import VLANIdWithDynamicVLAN from '.'


describe('VLANIdWithDynamicVLAN', () => {
  it('should render DynamicVLAN Field correctly with default Props value', function () {
    // GIVEN
    const enableVxLan = false
    const isPortalDefaultVLANId = false
    const showDynamicWlan = false
    // WHEN
    render(<VLANIdWithDynamicVLAN
      enableVxLan={enableVxLan}
      isPortalDefaultVLANId={isPortalDefaultVLANId}
      showDynamicWlan={showDynamicWlan}
    />)
    // THEN
    const childrenOfVLANIdWithDynamicVLAN = screen.getByTestId('VLANIdWithDynamicVLAN-children')

    expect(screen.getByTestId('VLANIdWithDynamicVLAN-children')).toBeInTheDocument()
    expect(childrenOfVLANIdWithDynamicVLAN).toBeInTheDocument()
    expect(screen.getByText('VLAN ID')).toBeInTheDocument()
    expect(childrenOfVLANIdWithDynamicVLAN).toBeEnabled()
  })
})
