import userEvent       from '@testing-library/user-event'
import { Form, Modal } from 'antd'
import { rest }        from 'msw'

import { useIsSplitOn }       from '@acx-ui/feature-toggle'
import {
  FirmwareRbacUrlsInfo,
  FirmwareSwitchVenueV1002,
  SwitchFirmwareFixtures,
  SwitchFirmwareVersion1002
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  within
} from '@acx-ui/test-utils'

import { switchVenueV1002 }    from '../../../__tests__/fixtures'
import {
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
  useGetSwitchCurrentVersionsQuery: () => ({
    data: mockSwitchCurrentVersions
  })
}))

const { mockSwitchCurrentVersionsV1002 } = SwitchFirmwareFixtures


describe('ScheduleStep', () => {
  const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }
  beforeEach(async () => {
    Modal.destroyAll()
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.get(
        FirmwareRbacUrlsInfo.getSwitchCurrentVersions.url,
        (req, res, ctx) => res(ctx.json(mockSwitchCurrentVersionsV1002))
      ),
      rest.post(
        FirmwareRbacUrlsInfo.getSwitchFirmwareList.url,
        (req, res, ctx) => res(ctx.json([]))
      ))
  })

  it('render ScheduleStep - 1 Venue', async () => {
    render(
      <Provider>
        <Form>
          <ScheduleStep
            setShowSubTitle={jest.fn()}
            visible={true}
            availableVersions={availableVersions_hasInUse as SwitchFirmwareVersion1002[]}
            hasVenue={true}
            // eslint-disable-next-line max-len
            upgradeVenueList={switchVenueV1002.filter(v => v.venueName === 'My-Venue') as FirmwareSwitchVenueV1002[]}
            upgradeSwitchList={[]}
            data={switchVenueV1002 as FirmwareSwitchVenueV1002[]} />
        </Form>
      </Provider>
      , {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })
    const form = screen.getByTestId('schedule-step')
    expect(within(form).getByText(/9.0.10h_cd2_b4/i)).toBeInTheDocument()
  })

  it('render ScheduleStep - Changed 1 Venue', async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2023-11-01T00:00:00Z').getTime())
    render(
      <Provider>
        <Form>
          <ScheduleStep
            setShowSubTitle={jest.fn()}
            visible={true}
            availableVersions={availableVersions_hasInUse as SwitchFirmwareVersion1002[]}
            hasVenue={true}
            // eslint-disable-next-line max-len
            upgradeVenueList={switchVenueV1002.filter(v => v.venueName === 'My-Venue') as FirmwareSwitchVenueV1002[]}
            upgradeSwitchList={[]}
            data={switchVenueV1002 as FirmwareSwitchVenueV1002[]} />
        </Form>
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })

    const form = screen.getByTestId('schedule-step')
    expect(within(form).getByText(/Firmware available for ICX 8200 Series/i)).toBeInTheDocument()

    const icx82Radio10010rc3 = within(form).getByRole('radio', {
      name: /10\.0\.10_rc3_icx82/i
    })
    await userEvent.click(icx82Radio10010rc3, { delay: null })
    expect(icx82Radio10010rc3).toBeEnabled()

    const icx81Radio10010fCd2rc3 = within(form).getByRole('radio', {
      name: /10\.0\.10f_cd2_rc3/i
    })
    await userEvent.click(icx81Radio10010fCd2rc3, { delay: null })
    expect(icx81Radio10010fCd2rc3).toBeEnabled()


    const icx7XRadio10010rc3 = within(form).getByRole('radio', {
      name: /10010_rc3_ICX7/i
    })
    await userEvent.click(icx7XRadio10010rc3, { delay: null })
    expect(icx7XRadio10010rc3).toBeEnabled()

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

})
