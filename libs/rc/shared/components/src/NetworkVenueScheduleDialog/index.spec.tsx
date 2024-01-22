import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import * as config                                       from '@acx-ui/config'
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
  beforeEach(async () => {
    const env = {
      GOOGLE_MAPS_KEY: 'FAKE_GOOGLE_MAPS_KEY'
    }

    const requestSpy = jest.fn()
    mockServer.use(
      rest.put(
        WifiUrlsInfo.updateNetworkVenue.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({ requestId: 'f229e6d6-f728-4b56-81ce-507877a4f4da' }))
      ),
      rest.get(
        'https://maps.googleapis.com/maps/api/timezone/json',
        (req, res, ctx) => {
          requestSpy()
          return res(ctx.status(200), ctx.json(timezoneResult))
        }
      ),
      rest.get('/globalValues.json', (_, r, c) => r(c.json(env)))
    )
    await config.initialize('r1')
  })

  it('should render network venue tab schedule dialog successfully', async () => {
    const props = {
      formName: 'networkVenueScheduleForm',
      venue: venueResponse,
      network: networkResponse,
      networkVenue: networkVenueResponse as NetworkVenue
    }

    render(<NetworkVenueScheduleDialog {...props} visible={true} />)
    const dialog = await waitFor(async () => await screen.findByRole('dialog'))
    const alwaysOn = await within(dialog).findByRole('radio', { name: '24/7' })
    await userEvent.click(alwaysOn)
    await userEvent.click(await within(dialog).findByRole('button', { name: 'Apply' }))
    // eslint-disable-next-line testing-library/no-node-access
    expect(dialog.querySelector('.ant-spin-spinning')).toBeVisible()
  })

  it('should render network venue tab schedule monday checkbox options successfully', async () => {
    const props = {
      formName: 'networkVenueScheduleForm',
      venue: venueResponse,
      network: networkResponse,
      networkVenue: networkVenueResponse as NetworkVenue
    }

    render(<NetworkVenueScheduleDialog {...props} visible={true} />)
    const dialog = await waitFor(async () => await screen.findByRole('dialog'))
    const customSchedule = await within(dialog).findByRole('radio', { name: 'Custom Schedule' })
    await userEvent.click(customSchedule)
    expect(await within(dialog).findByTestId('mon_0')).toBeVisible()
    const mondayTimeSlot = await within(dialog).findByTestId('mon_0')
    await userEvent.click(mondayTimeSlot)
    await userEvent.click(await within(dialog).findByRole('button', { name: 'Apply' }))
    // eslint-disable-next-line testing-library/no-node-access
    expect(dialog.querySelector('.ant-spin-spinning')).toBeVisible()
  })


  it('should render network venue tab schedule time slot of monday successfully', async () => {
    const props = {
      formName: 'networkVenueScheduleForm',
      venue: venueResponse,
      network: networkResponse,
      networkVenue: networkVenueResponse as NetworkVenue
    }

    render(<NetworkVenueScheduleDialog {...props} visible={true} />)
    const dialog = await waitFor(async () => await screen.findByRole('dialog'))
    const customSchedule = await within(dialog).findByRole('radio', { name: 'Custom Schedule' })
    await userEvent.click(customSchedule)
    const scheduleCheckbox = await within(dialog).findByTestId('checkbox_mon')
    expect(scheduleCheckbox).toBeVisible()
    await userEvent.click(scheduleCheckbox)
    await userEvent.click(await within(dialog).findByRole('button', { name: 'Apply' }))
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

    const { rerender } = render(<NetworkVenueScheduleDialog {...props} visible={true} />)

    const dialog = await waitFor(async () => await screen.findByRole('dialog'))
    const customSchedule = await within(dialog).findByRole('radio', { name: 'Custom Schedule' })
    await userEvent.click(customSchedule)
    await userEvent.click(await within(dialog).findByRole('button', { name: 'See tips' }))
    const tipsDialog = await screen.findAllByRole('dialog')
    expect(tipsDialog[1]).toBeInTheDocument()
    await userEvent.click(await within(tipsDialog[1]).findByRole('button', { name: 'OK' }))

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

    render(<NetworkVenueScheduleDialog {...props} visible={true} />)

    const dialog = await waitFor(async () => screen.findByRole('dialog'))
    const customSchedule = await within(dialog).findByRole('radio', { name: 'Custom Schedule' })
    await userEvent.click(customSchedule)
    await userEvent.click(await within(dialog).findByRole('button', { name: 'See tips' }))
    const tipsDialog = await screen.findAllByRole('dialog')
    expect(tipsDialog[1]).toBeInTheDocument()
    await userEvent.click(await within(tipsDialog[1]).findByRole('button', { name: 'OK' }))
    // update the props "visible"
    // rerender(<NetworkVenueScheduleDialog {...props} visible={false}/>)
    expect(tipsDialog[1]).not.toBeVisible()
  })
  it('should render schedule dialog with drag and select timeslots successfully', async () => {
    const props = {
      formName: 'networkVenueScheduleForm',
      venue: venueResponse,
      network: networkResponse,
      networkVenue: networkVenueResponse as NetworkVenue
    }

    render(<NetworkVenueScheduleDialog {...props} visible={true} />)
    const dialog = await waitFor(async () => screen.findByRole('dialog'))
    const customSchedule = await within(dialog).findByRole('radio', { name: 'Custom Schedule' })
    await userEvent.click(customSchedule)
    const scheduleCheckbox = await within(dialog).findByTestId('checkbox_mon')
    expect(scheduleCheckbox).toBeVisible()
    await userEvent.click(scheduleCheckbox)
    const mondayTimeSlot = await within(dialog).findByTestId('mon_0')
    const mondayLastTimeSlot = await within(dialog).findByTestId('mon_95')

    fireEvent.mouseDown(mondayLastTimeSlot)
    fireEvent.mouseMove(mondayTimeSlot)
    fireEvent.mouseUp(mondayTimeSlot)
  })
  it('should drag and select partial timeslots successfully', async () => {
    const props = {
      formName: 'networkVenueScheduleForm',
      venue: venueResponse,
      network: networkResponse,
      networkVenue: networkVenueResponse as NetworkVenue
    }

    render(<NetworkVenueScheduleDialog {...props} visible={true} />)
    const dialog = await waitFor(async () => screen.findByRole('dialog'))
    const customSchedule = await within(dialog).findByRole('radio', { name: 'Custom Schedule' })
    await userEvent.click(customSchedule)
    const scheduleCheckbox = await within(dialog).findByTestId('checkbox_tue')
    expect(scheduleCheckbox).toBeVisible()
    await userEvent.click(scheduleCheckbox)
    const tuesdayTimeSlot1 = await within(dialog).findByTestId('tue_0')
    const tuesdayTimeSlot2= await within(dialog).findByTestId('tue_50')

    fireEvent.mouseDown(tuesdayTimeSlot1)
    fireEvent.mouseMove(tuesdayTimeSlot2)
    fireEvent.mouseUp(tuesdayTimeSlot2)
  })
})
