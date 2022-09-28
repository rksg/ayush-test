/* eslint-disable max-len */
import '@testing-library/jest-dom'
import { useSplitTreatment } from '@acx-ui/feature-toggle'
import {
  RadioTypeEnum,
  RadioEnum,
  WlanSecurityEnum
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { network }              from './index.spec'
import { NetworkApGroupDialog } from './NetworkApGroupDialog'
import { networkVenue_apgroup } from './VlanInput.spec'

const networkVenue_allAps = {
  venueId: 'd7b1a9a350634115a92ee7b0f11c7e75',
  dual5gEnabled: true,
  tripleBandEnabled: false,
  networkId: '373377b0cb6e46ea8982b1c80aabe1fa',
  allApGroupsRadio: RadioEnum.Both,
  isAllApGroups: true,
  allApGroupsRadioTypes: [RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz],
  id: '7a97953dc55f4645b3cdbf1527f3d7cb'
}

const params = {
  tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
  networkId: '373377b0cb6e46ea8982b1c80aabe1fa'
}

const venueName = 'My-Venue'

describe('NetworkApGroupDialog', () => {
  it('should render correctly', async () => {

    const props = {
      formName: 'networkApGroupForm',
      venueName: venueName,
      networkVenue: networkVenue_allAps,
      network: network
    }

    const { rerender } = render(
      <NetworkApGroupDialog
        {...props}
        visible={true}
      />)

    const dialog = await waitFor(async () => screen.findByRole('dialog'))

    expect(dialog).toMatchSnapshot()

    // Show venue's name in the sub-title
    expect(within(dialog).getByText(venueName, { exact: false })).toBeVisible()

    // Select 'All APs' by default
    expect(within(dialog).getByLabelText('All APs', { exact: false, selector: 'input' })).toBeChecked()
    expect(dialog).toHaveTextContent('VLAN-1 (Default)')

    // Switch to 'Select APs by tag' radio
    fireEvent.click(within(dialog).getByLabelText('Select APs by tag', { exact: false }))
    expect(within(dialog).getByLabelText('Tags')).toBeVisible()

    // update the props "visible"
    rerender(<NetworkApGroupDialog {...props} visible={false}/>)
    expect(dialog).not.toBeVisible()
  })

  it('should select specific AP groups', async () => {

    render(<Provider><NetworkApGroupDialog
      visible={true}
      formName={'networkApGroupForm'}
      venueName={venueName}
      networkVenue={networkVenue_apgroup}
      network={network}
    /></Provider>, { route: { params } })

    const dialog = await waitFor(async () => screen.findByRole('dialog'))

    expect(within(dialog).getByLabelText('Select specific AP groups', { exact: false, selector: 'input' })).toBeChecked()

    await waitFor(() => expect(dialog).toHaveTextContent('VLAN Pool: pool1 (Custom)'))
  })

  it('should has 6 GHz and could click apply', async () => {

    jest.mocked(useSplitTreatment).mockReturnValue(true)

    let networkWPA3 = { ...network, wlan: { ...network.wlan, wlanSecurity: WlanSecurityEnum.WPA3 } }

    render(<Provider><NetworkApGroupDialog
      visible={true}
      formName={'networkApGroupForm'}
      venueName={venueName}
      networkVenue={{ ...networkVenue_allAps, allApGroupsRadioTypes: [RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz, RadioTypeEnum._6_GHz] }}
      network={networkWPA3}
    /></Provider>, { route: { params } })

    const dialog = await waitFor(async () => screen.findByRole('dialog'))

    expect(dialog).toHaveTextContent('6 GHz')

    // Switch to 'AP groups' radio
    fireEvent.click(within(dialog).getByLabelText('Select specific AP groups', { exact: false }))

    const checkbox = within(dialog).getByLabelText('APs not assigned to any group')
    expect(checkbox).toBeVisible()
    expect(checkbox).toBeChecked()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Apply' }))
    // eslint-disable-next-line testing-library/no-node-access
    expect(dialog.querySelector('.ant-spin-spinning')).toBeVisible()
  })
})

