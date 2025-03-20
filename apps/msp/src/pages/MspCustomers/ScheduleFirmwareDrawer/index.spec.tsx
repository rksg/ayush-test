import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import moment    from 'moment'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                         from '@acx-ui/feature-toggle'
import { MspRbacUrlsInfo, MspUrlsInfo }                   from '@acx-ui/msp/utils'
import { Provider }                                       from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { ScheduleFirmwareDrawer } from '.'

const versionList = {
  data: [
    {
      id: '6.2.0.103.553',
      supportedApModels: [
        'R600',
        'R500',
        'R310',
        'R730',
        'T300',
        'T300E',
        'T301N',
        'T301S',
        'R720',
        'R710',
        'R610',
        'R510',
        'R320',
        'M510',
        'H510',
        'H320',
        'T350SE'
      ]
    },
    {
      id: '6.2.4.103.255',
      supportedApModels: [
        'R720',
        'R710',
        'R610',
        'R510',
        'R320',
        'M510',
        'H510',
        'R850',
        'R750',
        'R650',
        'R550',
        'R350',
        'H550',
        'H350',
        'T750',
        'T750SE',
        'T350C',
        'T350D',
        'T350SE',
        'R560',
        'R760'
      ]
    }
  ]
}

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
    services.useGetFirmwareUpgradeByApModelQuery = jest.fn().mockImplementation(() => {
      return versionList
    })
    jest.spyOn(services, 'useMspEcFirmwareUpgradeSchedulesMutation')
    mockServer.use(
      rest.post(
        MspUrlsInfo.mspEcFirmwareUpgradeSchedules.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        MspRbacUrlsInfo.mspEcFirmwareUpgradeSchedules.url,
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
    expect(await screen.findByText('Scheduled Time Slots')).toBeVisible()

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

    await userEvent.click(screen.getAllByText('Monday')[1])
    await waitFor(() => {
      expect(screen.getAllByText('Monday')).toHaveLength(3)
    })

    // Assert no more options are able to be selected after max 2 selected
    await userEvent.click(screen.getAllByText('Tuesday')[1])
    await waitFor(() => {
      expect(screen.getAllByText('Tuesday')).toHaveLength(2)
    })

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(await screen.findByText('Schedule updates manually')).toBeVisible()
    expect(screen.queryByText('Sunday')).toBeNull()
    expect(screen.queryByText('Monday')).toBeNull()
  })
  it('should save correctly for automatic schedule selected', async () => {
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
    await userEvent.click(screen.getByRole('button', { name: 'Change' }))
    expect(screen.getAllByRole('combobox')).toHaveLength(2)
    await userEvent.click(screen.getAllByRole('combobox')[0])
    await userEvent.click(screen.getAllByRole('combobox')[0])
    const sundays = await screen.findAllByText('Sunday')

    // Assert day option is added to selected list
    await userEvent.click(sundays[1])
    await waitFor(() => {
      expect(screen.getAllByText('Sunday')).toHaveLength(3)
    })

    await userEvent.click(screen.getAllByRole('combobox')[1])
    await userEvent.click(screen.getAllByRole('combobox')[1])
    await userEvent.click((await screen.findAllByText('12 AM - 02 AM'))[0])
    await waitFor(() => {
      expect(screen.getAllByText('12 AM - 02 AM')).toHaveLength(2)
    })
    // Assert time slot option is added to selected list
    await userEvent.click((await screen.findAllByText('12 AM - 02 AM'))[0])
    await waitFor(() => {
      expect(screen.getAllByText('12 AM - 02 AM')).toHaveLength(3)
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    })
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByRole('button', { name: 'Schedule Update' })).toBeVisible()

    await userEvent.click(screen.getAllByRole('radio')[1])
    await userEvent.click(screen.getAllByRole('radio')[0])

    expect(await screen.findByRole('button', { name: 'Schedule Update' })).toBeEnabled()

    await userEvent.click(screen.getByRole('button', { name: 'Schedule Update' }))
    await waitFor(() => {
      expect(mockedSetVisible).toHaveBeenCalledTimes(3)
    })
    expect(mockedSetVisible).toHaveBeenLastCalledWith(false)
    expect(services.useMspEcFirmwareUpgradeSchedulesMutation).toHaveBeenCalled()
  })
  it('should save correctly for manual schedule selected', async () => {
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
    await userEvent.click(screen.getAllByRole('radio')[1])
    expect(await screen.findByText('Enter Specific Date')).toBeVisible()

    // Input date into datepicker
    const datepicker = screen.getByRole('img', { name: 'calendar' })
    expect(datepicker).toBeEnabled()
    await userEvent.click(datepicker)
    const date = moment().add(1, 'days')
    expect(await screen.findByRole('cell', { name: date.format('YYYY-MM-DD') })).toBeEnabled()
    await userEvent.click(screen.getByRole('cell', { name: date.format('YYYY-MM-DD') }))
    expect(await screen.findByDisplayValue(date.format('MM/DD/YYYY'))).toBeVisible()

    // Select time slot
    const dropdown = await screen.findByRole('combobox')
    await userEvent.click(dropdown)
    await userEvent.click(screen.getByRole('combobox'))
    await waitFor(() => {
      expect(screen.getByRole('option', { name: '12 AM - 02 AM' })).toBeVisible()
    })
    fireEvent.click(screen.getByText('12 AM - 02 AM'))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Schedule Update' })).toBeEnabled()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Schedule Update' }))
    await waitFor(() => {
      expect(mockedSetVisible).toHaveBeenCalledTimes(3)
    })
    expect(mockedSetVisible).toHaveBeenLastCalledWith(false)
    expect(services.useMspEcFirmwareUpgradeSchedulesMutation).toHaveBeenCalled()
  })

  it('should show firmware version correctly', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff !== Features.AP_FIRMWARE_UPGRADE_BY_MODEL_TOGGLE )

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
  })
})
