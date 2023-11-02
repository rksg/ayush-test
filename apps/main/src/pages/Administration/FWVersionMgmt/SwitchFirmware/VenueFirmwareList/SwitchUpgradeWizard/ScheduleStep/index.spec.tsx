import { Form, Modal } from 'antd'
import { rest }        from 'msw'

import {
  FirmwareSwitchVenue,
  FirmwareUrlsInfo,
  SwitchFirmware
} from '@acx-ui/rc/utils'
import {
  Provider
} from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'


import {
  switchVenue,
  preference,
  switchRelease,
  switchCurrentVersions,
  switchLatest,
  upgradeSwitchViewList,
  availableVersions,
  availableVersions_hasInUse
} from '../../__test__/fixtures'

import { ScheduleStep } from '.'


jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  useStepFormContext: () => ({
    form: {
      getFieldValue: jest.fn(),
      setFieldValue: jest.fn()
    }
  })
}))

describe('ScheduleStep', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    Modal.destroyAll()
    mockServer.use(
      rest.post(
        FirmwareUrlsInfo.getSwitchVenueVersionList.url,
        (req, res, ctx) => res(ctx.json(switchVenue))
      ),
      rest.get(
        FirmwareUrlsInfo.getSwitchAvailableFirmwareList.url,
        (req, res, ctx) => res(ctx.json(switchRelease))
      ),
      rest.get(
        FirmwareUrlsInfo.getSwitchUpgradePreferences.url,
        (req, res, ctx) => res(ctx.json(preference))
      ),
      rest.get(
        FirmwareUrlsInfo.getSwitchFirmwarePredownload.url,
        (req, res, ctx) => res(ctx.json({
          preDownload: false
        }))
      ),
      rest.get(
        FirmwareUrlsInfo.getSwitchCurrentVersions.url,
        (req, res, ctx) => res(ctx.json(switchCurrentVersions))
      ),
      rest.post(
        FirmwareUrlsInfo.updateSwitchVenueSchedules.url,
        (req, res, ctx) => res(ctx.json({ requestId: 'requestId' }))
      ),
      rest.get(
        FirmwareUrlsInfo.getSwitchLatestFirmwareList.url,
        (req, res, ctx) => res(ctx.json(switchLatest))
      ),
      rest.post(
        FirmwareUrlsInfo.getSwitchFirmwareList.url,
        (req, res, ctx) => res(ctx.json(upgradeSwitchViewList))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })

  it('render ScheduleStep - 1 Venue', async () => {
    render(
      <Provider>
        <Form>
          <ScheduleStep
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
    expect(await screen.findByText(/Firmware available for ICX 8200 Series/i)).toBeInTheDocument()
    expect(screen.getByText(/10.0.10a_cd3/i)).toBeInTheDocument()
    expect(screen.getByText(/9.0.10h_cd2/i)).toBeInTheDocument()
    expect(screen.getByText(/9.0.10f/i)).toBeInTheDocument()
  })

  it('render ScheduleStep - 1 non8200 Switch', async () => {
    render(
      <Provider>
        <Form>
          <ScheduleStep
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
    // eslint-disable-next-line max-len
    expect(await screen.findByText(/firmware available for icx 7150\/7550\/7650\/7850 series \(1 switches\)/i)).toBeInTheDocument()
    // eslint-disable-next-line max-len
    expect(screen.getByText(/9.0.10h_cd2/i)).toBeInTheDocument()
    expect(screen.getByText(/9.0.10f/i)).toBeInTheDocument()
    expect(screen.getByText(/9.0.10e/i)).toBeInTheDocument()

    expect(screen.queryByText(/Firmware available for ICX 8200 Series/i)).toBeNull()
  })


})
