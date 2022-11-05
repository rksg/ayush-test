import '@testing-library/jest-dom'

import { NetworkSaveData, NetworkVenue, SchedulerTypeEnum, Venue } from '@acx-ui/rc/utils'
import { Provider }                                                from '@acx-ui/store'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import {
  venueResponse,
  networkResponse,
  networkVenueResponse
} from '../../__test__/fixtures'

import { NetworkVenueScheduleDialog } from './index'

describe('NetworkVenueTabScheduleDialog', () => {
  it('should render network venue tab schedule dialog successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    const props = {
      formName: 'networkVenueScheduleForm',
      venue: venueResponse as Venue,
      network: networkResponse as NetworkSaveData,
      networkVenue: networkVenueResponse as NetworkVenue
    }

    const { asFragment } = render(
      <Provider>
        <NetworkVenueScheduleDialog
          {...props} />
      </Provider>, {
        route: { params }
      })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render network venue tab schedule dialog with ALWAYS_ON successfully', async () => {

    networkVenueResponse.scheduler.type = SchedulerTypeEnum.ALWAYS_ON

    const props = {
      formName: 'networkVenueScheduleForm',
      venue: venueResponse as Venue,
      network: networkResponse as NetworkSaveData,
      networkVenue: networkVenueResponse as NetworkVenue
    }

    render(
      <NetworkVenueScheduleDialog
        {...props}
        visible={true} />
    )
    const dialog = await waitFor(async () => screen.findByRole('dialog'))
    fireEvent.click(await within(dialog).findByTestId('checkbox_mon', { exact: false }))
    fireEvent.click(await within(dialog).findByTestId('checkbox_mon', { exact: false }))
    const mondayTimeSlot = await within(dialog).findByTestId('mon_0')
    fireEvent.click(mondayTimeSlot)
    fireEvent.click(mondayTimeSlot)
    fireEvent.click(within(dialog).getByLabelText('24/7'))
  })
})
