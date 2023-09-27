import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                        from '@acx-ui/feature-toggle'
import { MspUrlsInfo }                         from '@acx-ui/msp/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { ScheduleFirmwareDrawer } from '.'

const services = require('@acx-ui/msp/services')
jest.mock('@acx-ui/msp/services', () => ({
  ...jest.requireActual('@acx-ui/msp/services')
}))
const mockedSetVisible = jest.fn()

describe('ScheduleFirmwareDrawer', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    services.useGetRecommandFirmwareUpgradeQuery = jest.fn().mockImplementation(() => {
      return {}
    })
    jest.spyOn(services, 'useMspEcFirmwareUpgradeSchedulesMutation')
    mockServer.use(
      rest.post(
        MspUrlsInfo.mspEcFirmwareUpgradeSchedules.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    jest.mocked(useIsSplitOn).mockReturnValue(true)
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should render correctly', async () => {
    render(
      <Provider>
        <ScheduleFirmwareDrawer
          visible={true}
          tenantIds={[params.tenantId]}
          setVisible={mockedSetVisible}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })
    expect(screen.getByText('Schedule Firmware Update')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Next' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(await screen.findByText('Use saved schedule')).toBeVisible()
    expect(await screen.findByText('Schedule updates manually')).toBeVisible()
    expect(await screen.findByRole('button', { name: 'Schedule Update' })).toBeVisible()
    expect(await screen.findByRole('button', { name: 'Change' })).toBeVisible()
    expect(await screen.findByRole('button', { name: 'Cancel' })).toBeVisible()
  })
  it('should close when cancel clicked', async () => {
    render(
      <Provider>
        <ScheduleFirmwareDrawer
          visible={true}
          tenantIds={[params.tenantId]}
          setVisible={mockedSetVisible}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })
    expect(screen.getByText('Schedule Firmware Update')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Next' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => {
      expect(mockedSetVisible).toHaveBeenLastCalledWith(false)
    })
  })
  it('should close when close clicked', async () => {
    render(
      <Provider>
        <ScheduleFirmwareDrawer
          visible={true}
          tenantIds={[params.tenantId]}
          setVisible={mockedSetVisible}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })
    expect(screen.getByText('Schedule Firmware Update')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Next' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    await waitFor(() => {
      expect(mockedSetVisible).toHaveBeenLastCalledWith(false)
    })
  })
  it('should show options when manual updates selected', async () => {
    render(
      <Provider>
        <ScheduleFirmwareDrawer
          visible={true}
          tenantIds={[params.tenantId]}
          setVisible={mockedSetVisible}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })
    expect(screen.getByText('Schedule Firmware Update')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Next' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(await screen.findByText('Use saved schedule')).toBeVisible()
    expect(await screen.findByText('Schedule updates manually')).toBeVisible()
    const radios = await screen.findAllByRole('radio')
    expect(radios).toHaveLength(2)
    await userEvent.click(radios[1])
    expect(screen.getByRole('button', { name: 'Change' })).toBeDisabled()
    expect(await screen.findByText('Enter Specific Date')).toBeVisible()
    expect(await screen.findByText('Scheduled Time Slots')).toBeVisible()
  })
  it('should work correctly when saved schedule change selected', async () => {
    render(
      <Provider>
        <ScheduleFirmwareDrawer
          visible={true}
          tenantIds={[params.tenantId]}
          setVisible={mockedSetVisible}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })
    expect(screen.getByText('Schedule Firmware Update')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Next' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(await screen.findByText('Use saved schedule')).toBeVisible()
    expect(await screen.findByText('Schedule updates manually')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Change' }))
    expect(await screen.findByText('Scheduled Days')).toBeVisible()
    expect(await screen.findByText('Saturday')).toBeVisible()
    expect(await screen.findByText('Scheduled Time Slots')).toBeVisible()
    expect(await screen.findByText('00:00 - 02:00')).toBeVisible()

    const inputs = screen.getAllByRole('combobox')
    expect(inputs).toHaveLength(2)
    await userEvent.click(inputs[0])
    await userEvent.click(inputs[0])
    const sundays = await screen.findAllByText('Sunday')

    // Assert option is added to selected list
    await userEvent.click(sundays[1])
    await waitFor(() => {
      expect(screen.getAllByText('Sunday')).toHaveLength(3)
    })

    // Assert no more options are able to be selected after max 2 selected
    await userEvent.click(screen.getAllByText('Monday')[1])
    await waitFor(() => {
      expect(screen.getAllByText('Monday')).toHaveLength(2)
    })
  })
  it('should save correctly', async () => {
    render(
      <Provider>
        <ScheduleFirmwareDrawer
          visible={true}
          tenantIds={[params.tenantId]}
          setVisible={mockedSetVisible}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })
    expect(screen.getByText('Schedule Firmware Update')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Next' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(await screen.findByText('Schedule updates manually')).toBeVisible()
    // const radios = await screen.findAllByRole('radio')
    // await userEvent.click(radios[1])
    // expect(await screen.findByText('Enter Specific Date')).toBeVisible()
    // expect(await screen.findByText('Scheduled Time Slots')).toBeVisible()
    // await userEvent.click(screen.getByRole('combobox'))
    // await userEvent.click(screen.getByRole('combobox'))
    // fireEvent.mouseDown(await screen.findByText('12 AM - 02 AM'))

    await userEvent.click(screen.getByRole('button', { name: 'Schedule Update' }))
    await waitFor(() => {
      expect(mockedSetVisible).toHaveBeenCalledTimes(3)
    })
    expect(mockedSetVisible).toHaveBeenLastCalledWith(false)
    expect(services.useMspEcFirmwareUpgradeSchedulesMutation).toHaveBeenCalled()
  })
})
