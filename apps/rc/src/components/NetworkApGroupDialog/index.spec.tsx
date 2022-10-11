/* eslint-disable max-len */
import '@testing-library/jest-dom'
import { rest } from 'msw'

import { useSplitTreatment } from '@acx-ui/feature-toggle'
import {
  CommonUrlsInfo,
  RadioTypeEnum,
  WlanSecurityEnum
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import {
  network,
  networkVenue_apgroup,
  networkVenue_allAps,
  params
} from './__tests__/NetworkVenueTestData'

import { NetworkApGroupDialog } from './index'


const venueName = 'My-Venue'

describe('NetworkApGroupDialog', () => {
  beforeAll(async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (req, res, ctx) => res(ctx.json(networkVenue_apgroup))
      )
    )
  })

  it('should render correctly', async () => {

    const props = {
      name: 'xxx',
      formName: 'networkApGroupForm',
      venueName: venueName,
      networkVenue: networkVenue_allAps,
      wlan: network.wlan
    }

    const { rerender } = render(
      <Provider><NetworkApGroupDialog
        {...props}
        visible={true}
      /></Provider>, { route: { params } })

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
    rerender(<Provider><NetworkApGroupDialog {...props} visible={false}/></Provider>)
    expect(dialog).not.toBeVisible()
  })

  it('should select specific AP groups', async () => {

    render(<Provider><NetworkApGroupDialog
      name='xxx'
      visible={true}
      formName={'networkApGroupForm'}
      venueName={venueName}
      networkVenue={networkVenue_apgroup}
      wlan={network.wlan}
    /></Provider>, { route: { params } })

    const dialog = await waitFor(async () => screen.findByRole('dialog'))

    expect(within(dialog).getByLabelText('Select specific AP groups', { exact: false, selector: 'input' })).toBeChecked()

    await waitFor(() => expect(dialog).toHaveTextContent('VLAN Pool: pool1 (Custom)'))
  })

  it('should has 6 GHz and could click apply', async () => {

    jest.mocked(useSplitTreatment).mockReturnValue(true)

    let wlanWPA3 = { ...network.wlan, wlanSecurity: WlanSecurityEnum.WPA3 }

    render(<Provider><NetworkApGroupDialog
      name='xxx'
      visible={true}
      formName={'networkApGroupForm'}
      venueName={venueName}
      networkVenue={{ ...networkVenue_allAps, allApGroupsRadioTypes: [RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz, RadioTypeEnum._6_GHz] }}
      wlan={wlanWPA3}
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

