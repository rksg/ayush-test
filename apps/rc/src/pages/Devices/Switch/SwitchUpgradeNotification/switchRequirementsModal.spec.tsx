import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }     from '@acx-ui/feature-toggle'
import {
  FirmwareRbacUrlsInfo,
  FirmwareUrlsInfo,
  SwitchFirmwareFixtures
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import {
  SwitchUpgradeNotification,
  SWITCH_UPGRADE_NOTIFICATION_TYPE
} from '.'

const { mockSwitchCurrentVersions, mockSwitchCurrentVersionsV1002 } = SwitchFirmwareFixtures

jest.mock('./switchRequirementsModal', () => ({
  ...jest.requireActual('./switchRequirementsModal'),
  __esModule: true,
  SwitchRequirementsModal: () => {
    return <div data-testid='mocked-SwitchRequirementsModal'>Upgrading the switch</div>
  }
}))

describe('Switch Requriements Modal', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        FirmwareUrlsInfo.getSwitchCurrentVersions.url,
        (req, res, ctx) => res(ctx.json(mockSwitchCurrentVersions))
      ),
      rest.get(
        FirmwareRbacUrlsInfo.getSwitchCurrentVersions.url,
        (req, res, ctx) => res(ctx.json(mockSwitchCurrentVersionsV1002))
      )
    )
  })

  it('should render correctly', async () => {
    const { asFragment } = render(
      <Provider>
        <SwitchUpgradeNotification
          isDisplay={true}
          isDisplayHeader={true}
          type={SWITCH_UPGRADE_NOTIFICATION_TYPE.SWITCH}
          validateModel={['ICX7150-C08P']} />
      </Provider>)
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render requirement correctly', async () => {
    render(
      <Provider>
        <SwitchUpgradeNotification
          isDisplay={true}
          isDisplayHeader={true}
          type={SWITCH_UPGRADE_NOTIFICATION_TYPE.SWITCH}
          validateModel={['ICX7150-C08P']} />
      </Provider>)
    await userEvent.click(await screen.findByText(/Click here/i))
    expect(await screen.findByText(/Upgrading the switch/)).toBeVisible()
  })

  it('render 8200 correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <Provider>
        <SwitchUpgradeNotification
          isDisplay={true}
          stackUnitsMinLimitaion={4}
          switchModel={'ICX8200-24'}
          isDisplayHeader={true}
          type={SWITCH_UPGRADE_NOTIFICATION_TYPE.SWITCH}
          validateModel={['ICX8200-24']} />
      </Provider>)
    expect(await screen.findByText(/For the ICX8200 series/)).toBeVisible()
  })

})
