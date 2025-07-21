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

import { switchFirmwareList, switchVenueV1002 } from '../../../__tests__/fixtures'
import {
  availableVersions_hasInUse
} from '../../__test__/fixtures'

import { UpdateNowStep } from '.'

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

const { mockSwitchCurrentVersionsV1002 } = SwitchFirmwareFixtures

describe('UpdateNowStep', () => {
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
        (req, res, ctx) => res(ctx.json(switchFirmwareList))
      ))
  })

  it('render UpdateNowStep - 1 Venue', async () => {
    render(
      <Provider>
        <Form>
          <UpdateNowStep
            setShowSubTitle={jest.fn()}
            visible={true}
            availableVersions={availableVersions_hasInUse as SwitchFirmwareVersion1002[]}
            upgradeVenueList={switchVenueV1002 as FirmwareSwitchVenueV1002[]}
            upgradeSwitchList={[]}
            hasVenue={true}/>
        </Form>
      </Provider>
      , {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })
    const updateNowStepForm = screen.getByTestId('update-now-step')
    expect(within(updateNowStepForm)
      .getByText(/Firmware available for ICX 8200 Series/i)).toBeInTheDocument()
    expect(within(updateNowStepForm)
      .getByText(/10.0.10_rc3_icx82/i)).toBeInTheDocument()
    expect(within(updateNowStepForm)
      .getByText(/10010_rc3_ICX7/i)).toBeInTheDocument()
  })

  it('render UpdateNowStep - Changed 1 Venue', async () => {
    render(
      <Provider>
        <Form>
          <UpdateNowStep
            setShowSubTitle={jest.fn()}
            visible={true}
            availableVersions={availableVersions_hasInUse as SwitchFirmwareVersion1002[]}
            hasVenue={true}
            upgradeVenueList={switchVenueV1002 as FirmwareSwitchVenueV1002[]}
            upgradeSwitchList={[]}
          />
        </Form>
      </Provider>
      , {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })

    const updateNowStepForm = screen.getByTestId('update-now-step')
    expect(within(updateNowStepForm)
      .getByText(/Firmware available for ICX 8200 Series/i)).toBeInTheDocument()


    const icx82radio = screen.getByRole('radio', {
      name: /10.0.10_rc3_icx82/i
    })

    await userEvent.click(icx82radio)
    expect(icx82radio).toBeEnabled()


    const icx7xradio = screen.getByRole('radio', {
      name: /10010_rc3_ICX7/i
    })
    await userEvent.click(icx7xradio)
    expect(icx7xradio).toBeEnabled()

  })
  it('render UpdateNowStep - 7150-C08P note visible', async () => {
    render(
      <Provider>
        <Form>
          <UpdateNowStep
            setShowSubTitle={jest.fn()}
            visible={true}
            availableVersions={availableVersions_hasInUse as SwitchFirmwareVersion1002[]}
            hasVenue={true}
            upgradeVenueList={switchVenueV1002 as FirmwareSwitchVenueV1002[]}
            upgradeSwitchList={[]}
          />
        </Form>
      </Provider>
      , {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })

    const updateNowStepForm = screen.getByTestId('update-now-step')
    expect(within(updateNowStepForm)
      .getByText(/Firmware available for ICX 7150 Series/i)).toBeInTheDocument()

    const icx71radio = screen.getByRole('radio', {
      name: /10.0.10g_rc2/i
    })
    await userEvent.click(icx71radio)
    expect(icx71radio).toBeEnabled()
  })

})
