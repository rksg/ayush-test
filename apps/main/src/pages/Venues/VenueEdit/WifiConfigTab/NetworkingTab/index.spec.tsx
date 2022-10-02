import '@testing-library/jest-dom'


import userEvent from '@testing-library/user-event'
import { Form } from 'antd'
import { rest } from 'msw'

import { CellularNetworkSelectionEnum, CommonUrlsInfo, LteBandRegionEnum, WanConnectionEnum, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'
import { NetworkingTab } from '.'


describe('CellularOptionsForm', () => {
  const params = { venueId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }


  it('should render CellularRadioSimSettings  successfully', async () => {

    const { asFragment } = render(
      <Provider>
        <NetworkingTab />
      </Provider> , {
        route: { params }
      })

    expect(asFragment()).toMatchSnapshot()
  })

})
