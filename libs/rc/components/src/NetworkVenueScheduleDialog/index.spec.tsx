import '@testing-library/jest-dom'

import { rest } from 'msw'

import { NetworkVenue, SchedulerTypeEnum, WifiUrlsInfo } from '@acx-ui/rc/utils'
import {
  fireEvent,
  render,
  screen,
  mockServer,
  waitFor,
  within
} from '@acx-ui/test-utils'

import {
  venueResponse,
  timezoneResult,
  networkResponse,
  networkVenueResponse,
  networkResponseWithNoSchedule,
  networkVenueResponseWithNoSchedule
} from './__tests__/fixtures'

import { NetworkVenueScheduleDialog } from './index'

describe('NetworkVenueTabScheduleDialog', () => {
  beforeAll(async () => {
    mockServer.use(
      rest.put(
        WifiUrlsInfo.updateNetworkVenue.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({ requestId: 'f229e6d6-f728-4b56-81ce-507877a4f4da' }))
      ),
      rest.get(
        'https://maps.googleapis.com/maps/api/timezone/*',
        (req, res, ctx) => res(ctx.json(timezoneResult))
      )
    )
  })

  it('should render network venue tab schedule dialog successfully', async () => {
    const props = {
      formName: 'networkVenueScheduleForm',
      venue: venueResponse,
      network: networkResponse,
      networkVenue: networkVenueResponse as NetworkVenue
    }

    render(
      <NetworkVenueScheduleDialog
        {...props}
        visible={true} />
    )
    const dialog = await waitFor(async () => screen.findByRole('dialog'))
    const alwaysOn = within(dialog).getByRole('radio', { name: '24/7' })
    fireEvent.click(alwaysOn)
    const customSchedule = within(dialog).getByRole('radio', { name: 'Custom Schedule' })
    fireEvent.click(customSchedule)
    expect(within(dialog).getAllByRole('checkbox')[0]).toBeVisible()
    fireEvent.click(within(dialog).getAllByRole('checkbox')[0])
    fireEvent.click(within(dialog).getAllByRole('checkbox')[0])
    expect(await within(dialog).findByTestId('mon_0')).toBeVisible()
    const mondayTimeSlot = await within(dialog).findByTestId('mon_0')
    fireEvent.click(mondayTimeSlot)
    fireEvent.click(mondayTimeSlot)
    const mondayLastTimeSlot = await within(dialog).findByTestId('mon_95')

    fireEvent.mouseDown(mondayTimeSlot)
    fireEvent.mouseMove(mondayLastTimeSlot)
    fireEvent.mouseUp(mondayLastTimeSlot)

    fireEvent.click(within(dialog).getByRole('button', { name: 'Apply' }))
    // eslint-disable-next-line testing-library/no-node-access
    expect(dialog.querySelector('.ant-spin-spinning')).toBeVisible()
  })

  it('should render network venue tab schedule dialog with ALWAYS_ON successfully', async () => {

    networkVenueResponse.scheduler.type = SchedulerTypeEnum.ALWAYS_ON

    const props = {
      formName: 'networkVenueScheduleForm',
      venue: venueResponse,
      network: networkResponse,
      networkVenue: networkVenueResponse as NetworkVenue
    }

    const { rerender } = render(
      <NetworkVenueScheduleDialog
        {...props}
        visible={true} />
    )

    const dialog = await waitFor(async () => screen.findByRole('dialog'))

    fireEvent.click(within(dialog).getByRole('button', { name: 'See tips' }))
    const tipsDialog = await screen.findAllByRole('dialog')
    fireEvent.click(within(tipsDialog[1]).getByRole('button', { name: 'OK' }))

    // update the props "visible"
    rerender(<NetworkVenueScheduleDialog {...props} visible={false}/>)
    expect(dialog).not.toBeVisible()
  })
  it('should render schedule dialog with schedule NULL successfully', async () => {
    const props = {
      formName: 'networkVenueScheduleForm',
      venue: venueResponse,
      network: networkResponseWithNoSchedule,
      networkVenue: networkVenueResponseWithNoSchedule as NetworkVenue
    }

    const { rerender } = render(
      <NetworkVenueScheduleDialog
        {...props}
        visible={true} />
    )

    const dialog = await waitFor(async () => screen.findByRole('dialog'))

    fireEvent.click(within(dialog).getByRole('button', { name: 'See tips' }))
    const tipsDialog = await screen.findAllByRole('dialog')
    fireEvent.click(within(tipsDialog[1]).getByRole('button', { name: 'OK' }))

    // update the props "visible"
    rerender(<NetworkVenueScheduleDialog {...props} visible={false}/>)
    expect(dialog).not.toBeVisible()
  })
})
