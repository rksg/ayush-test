import userEvent       from '@testing-library/user-event'
import { Form, Modal } from 'antd'

import {
  FirmwareSwitchVenue,
  SwitchFirmware,
  SwitchFirmwareFixtures
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  render,
  screen,
  within
} from '@acx-ui/test-utils'

import {
  switchVenue,
  upgradeSwitchViewList,
  availableVersions,
  availableVersions_hasInUse
} from '../../__test__/fixtures'

import { ScheduleStep } from '.'

const { mockSwitchCurrentVersions } = SwitchFirmwareFixtures

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  useStepFormContext: () => ({
    form: {
      getFieldValue: jest.fn(),
      setFieldValue: jest.fn(),
      validateFields: jest.fn()
    }
  })
}))

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useGetSwitchDefaultVersionsQuery: () => ({
    data: mockSwitchCurrentVersions
  })
}))

describe('ScheduleStep', () => {
  const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }
  beforeEach(async () => {
    Modal.destroyAll()
  })

  it('render ScheduleStep - 1 Venue', async () => {
    render(
      <Provider>
        <Form>
          <ScheduleStep
            setShowSubTitle={jest.fn()}
            visible={true}
            availableVersions={availableVersions_hasInUse}
            nonIcx8200Count={2}
            icx8200Count={0}
            hasVenue={true}
            // eslint-disable-next-line max-len
            upgradeVenueList={switchVenue.upgradeVenueViewList.filter(v => v.name === 'Karen-Venue1') as FirmwareSwitchVenue[]}
            upgradeSwitchList={[]}
            data={switchVenue.upgradeVenueViewList as FirmwareSwitchVenue[]} />
        </Form>
      </Provider>
      , {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })
    const form = screen.getByTestId('schedule-step')
    expect(within(form).getByText(/10.0.10a_cd3/i)).toBeInTheDocument()
    expect(within(form).getByText(/9.0.10h_cd2/i)).toBeInTheDocument()
    expect(within(form).getByText(/9.0.10f/i)).toBeInTheDocument()
  })

  it('render ScheduleStep - 1 Venue - Changed', async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2023-11-01T00:00:00Z').getTime())
    render(
      <Provider>
        <Form>
          <ScheduleStep
            setShowSubTitle={jest.fn()}
            visible={true}
            availableVersions={availableVersions_hasInUse}
            nonIcx8200Count={2}
            icx8200Count={0}
            hasVenue={true}
            upgradeVenueList={
              switchVenue.upgradeVenueViewList.filter(
                v => v.name === 'Karen-Venue1') as FirmwareSwitchVenue[]}
            upgradeSwitchList={[]}
            data={switchVenue.upgradeVenueViewList as FirmwareSwitchVenue[]} />
        </Form>
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })

    const form = screen.getByTestId('schedule-step')
    expect(within(form).getByText(/Firmware available for ICX 8200 Series/i)).toBeInTheDocument()
    expect(within(form).getByText(/9.0.10f/i)).toBeInTheDocument()

    const release10010rc2 = within(form).getByRole('radio', {
      name: /10\.0\.10_rc2 \(release - recommended\)/i
    })
    await userEvent.click(release10010rc2, { delay: null })
    expect(release10010rc2).toBeEnabled()

    const release09010f = within(form).getByRole('radio', {
      name: /9\.0\.10f \(release - recommended\)/i
    })
    await userEvent.click(release09010f, { delay: null })
    expect(release09010f).toBeEnabled()

    const calendar = within(form).getByRole('textbox', {
      name: /update date/i
    })
    await userEvent.click(calendar, { delay: null })
    const calendarDate = await screen.findByRole('cell', {
      name: /2023-11-16/i
    })
    expect(calendarDate).toBeInTheDocument()

    await userEvent.click(calendarDate, { delay: null })
    expect(await screen.findByDisplayValue(/2023-11-16/i)).toBeInTheDocument()

    const selectedTime = await within(form).findByRole('radio', {
      name: /12 am - 02 am/i
    })
    await userEvent.click(selectedTime, { delay: null })
    expect(selectedTime).toBeEnabled()

    const preDownloadSwitch = within(form).getByRole('switch')
    await userEvent.click(preDownloadSwitch, { delay: null })
    expect(preDownloadSwitch).toBeEnabled()
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('render ScheduleStep - 1 non8200 Switch', async () => {
    render(
      <Provider>
        <Form>
          <ScheduleStep
            setShowSubTitle={jest.fn()}
            visible={true}
            availableVersions={availableVersions}
            nonIcx8200Count={1}
            icx8200Count={0}
            hasVenue={false}
            upgradeVenueList={[]}
            // eslint-disable-next-line max-len
            upgradeSwitchList={upgradeSwitchViewList.upgradeSwitchViewList.filter(v => v.switchName === 'FEK3224R0AG') as unknown as SwitchFirmware[]}
            data={switchVenue.upgradeVenueViewList as FirmwareSwitchVenue[]} />
        </Form>
      </Provider>
      , {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })
    const form = screen.getByTestId('schedule-step')
    expect(within(form).getByText(
      /firmware available for icx 7150\/7550\/7650\/7850 series \(1 switches\)/i))
      .toBeInTheDocument()
    expect(within(form).getByText(/9.0.10h_cd2/i)).toBeInTheDocument()
    expect(within(form).getByText(/9.0.10f/i)).toBeInTheDocument()
    expect(within(form).getByText(/9.0.10e/i)).toBeInTheDocument()
    expect(within(form).queryByText(/Firmware available for ICX 8200 Series/i)).toBeNull()
  })

})
