import userEvent from '@testing-library/user-event'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import { Provider }     from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { SwitchUpgradeNotification, SWITCH_UPGRADE_NOTIFICATION_TYPE } from '.'


describe('Switch Requriements Modal', () => {
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
    await userEvent.click(await screen.findByText(/Click here/))
    expect(await screen.findByText(/Upgrading the switch/)).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: /ok/i }))
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
