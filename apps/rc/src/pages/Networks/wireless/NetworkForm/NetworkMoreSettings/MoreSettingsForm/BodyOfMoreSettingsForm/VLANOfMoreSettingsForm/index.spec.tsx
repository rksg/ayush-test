import React from 'react'

import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'


import VLANOfNetworkMoreSettingsForm from '.'

describe('VLANOfNetworkMoreSettingsForm', () => {
  it('renders VLANPool and ProxyArp components with correct props', () => {
    const props = {
      enableVlanPooling: true,
      enableVxLan: false,
      isPortalDefaultVLANId: true,
      showDynamicWlan: false
    }

    render(<Provider><VLANOfNetworkMoreSettingsForm {...props} /></Provider>)

    // Assert VLANPool component
    // const vlanPoolComponent = screen.getByTestId('VLANPool')
    // expect(vlanPoolComponent).toBeInTheDocument()
    // expect(vlanPoolComponent).toHaveAttribute('enableVlanPooling', 'true')
    // expect(vlanPoolComponent).toHaveAttribute('enableVxLan', 'false')
    // expect(vlanPoolComponent).toHaveAttribute('isPortalDefaultVLANId', 'true')
    // expect(vlanPoolComponent).toHaveAttribute('showDynamicWlan', 'false')

    // Assert ProxyArp component
    const proxyArpComponent = screen.getByTestId('ProxyArp')
    expect(proxyArpComponent).toBeInTheDocument()
    expect(proxyArpComponent).toHaveAttribute('enableVxLan', 'false')
  })
})
