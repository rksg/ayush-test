import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }    from '@acx-ui/feature-toggle'
import { firmwareApi }     from '@acx-ui/rc/services'
import {
  FirmwareRbacUrlsInfo,
  FirmwareSwitchVenueV1002,
  FirmwareUrlsInfo,
  SwitchFirmwareFixtures
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { VenueFirmwareList }                               from '..'
import { switchLatestV1002, switchVenueV1002NextSchedule } from '../../__tests__/fixtures'
import {
  preference,
  switchReleaseV1002,
  upgradeSwitchViewList
} from '../__test__/fixtures'

import { SwitchScheduleDrawer } from '.'


jest.mock('./SwitchUpgradeWizard', () => ({
  ...jest.requireActual('./SwitchUpgradeWizard'),
  SwitchUpgradeWizard: () => {
    return <div data-testid='test-SwitchUpgradeWizard' />
  }
}))

const { mockSwitchCurrentVersionsV1002 } = SwitchFirmwareFixtures

const multipleScheduleVenueData = [
  {
    venueId: 'd0d153c8cff94cd1bede40a0d633cbee',
    venueName: 'My-Venue',
    versions: [
      {
        modelGroup: 'ICX71',
        version: '09010h_cd2_b4'
      },
      {
        modelGroup: 'ICX7X',
        version: '09010j_cd1_rc3'
      },
      {
        modelGroup: 'ICX82',
        version: '10010c_cd3_rc36'
      }
    ],
    lastScheduleUpdateTime: '2024-07-10T09:45:48.141+00:00',
    preDownload: false,
    status: 'NONE',
    scheduleCount: 0
  },
  {
    venueId: '5350be0e765c4566ab2dd3c8a13f0ae9',
    venueName: 'testFirmware',
    versions: [
      {
        modelGroup: 'ICX71',
        version: '09010h_cd2_b4'
      },
      {
        modelGroup: 'ICX82',
        version: '10010a_cd3_b11'
      },
      {
        modelGroup: 'ICX7X',
        version: '10020_rc35'
      }
    ],
    lastScheduleUpdateTime: '2024-07-11T10:06:45.114+00:00',
    preDownload: false,
    status: 'NONE',
    scheduleCount: 0
  },
  {
    venueId: 'e36dc09564d7463dab331fd721b04d8d',
    venueName: 'KarenTest',
    versions: [
      {
        modelGroup: 'ICX71',
        version: '09010h_cd2_b4'
      },
      {
        modelGroup: 'ICX7X',
        version: '09010h_cd2_b4'
      },
      {
        modelGroup: 'ICX82',
        version: '10010b_rc88'
      }
    ],
    preDownload: false,
    status: 'NONE',
    scheduleCount: 0
  },
  {
    venueId: 'e70329ef78814b12b5fdd985edd39e21',
    venueName: 'test',
    versions: [
      {
        modelGroup: 'ICX71',
        version: '09010f_b19'
      },
      {
        modelGroup: 'ICX82',
        version: '10010b_rc88'
      },
      {
        modelGroup: 'ICX7X',
        version: '09010f_b19'
      }
    ],
    lastScheduleUpdateTime: '2024-07-11T10:29:00.116+00:00',
    preDownload: false,
    switchCounts: [
      {
        modelGroup: 'ICX71',
        count: 1
      },
      {
        modelGroup: 'ICX7X',
        count: 2
      },
      {
        modelGroup: 'ICX82',
        count: 1
      }
    ],
    status: 'INITIATE',
    scheduleCount: 1
  }
]


describe('SwitchFirmware - SwitchScheduleDrawer', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    store.dispatch(firmwareApi.util.resetApiState())
    mockServer.use(
      rest.post(
        FirmwareRbacUrlsInfo.getSwitchVenueVersionList.url,
        (req, res, ctx) => res(ctx.json(multipleScheduleVenueData))
      ),
      rest.get(
        FirmwareRbacUrlsInfo.getSwitchAvailableFirmwareList.url,
        (req, res, ctx) => res(ctx.json(switchReleaseV1002))
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
        FirmwareRbacUrlsInfo.getSwitchCurrentVersions.url,
        (req, res, ctx) => res(ctx.json(mockSwitchCurrentVersionsV1002))
      ),
      rest.post(
        FirmwareUrlsInfo.updateSwitchVenueSchedules.url,
        (req, res, ctx) => res(ctx.json({ requestId: 'requestId' }))
      ),
      rest.get(
        FirmwareRbacUrlsInfo.getSwitchLatestFirmwareList.url,
        (req, res, ctx) => res(ctx.json(switchLatestV1002))
      ),
      rest.get(
        FirmwareRbacUrlsInfo.getSwitchDefaultFirmwareList.url,
        (req, res, ctx) => res(ctx.json(switchLatestV1002))
      ),
      rest.post(
        FirmwareRbacUrlsInfo.getSwitchFirmwareList.url,
        (req, res, ctx) => res(ctx.json(upgradeSwitchViewList))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })
  it('should render drawer', async () => {
    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })

    expect(await screen.findByText('My-Venue')).toBeInTheDocument()
    await userEvent.click(await screen.findByRole('button', { name: /View Schedule/i }))
    expect(await screen.findByText('Scheduled update')).toBeInTheDocument()
  })

  it('should render SwitchScheduleDrawer', async () => {
    render(
      <Provider>
        <SwitchScheduleDrawer
          visible={true}
          setVisible={() => { }}
          data={switchVenueV1002NextSchedule[0] as FirmwareSwitchVenueV1002}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })

    expect(await screen.findByText('auto11')).toBeInTheDocument()
  })


})
