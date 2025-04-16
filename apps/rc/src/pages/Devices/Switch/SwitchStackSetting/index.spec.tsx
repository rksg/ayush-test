/* eslint-disable max-len */
import { fireEvent } from '@testing-library/react'
import userEvent     from '@testing-library/user-event'
import { Form }      from 'antd'

import { Features, useIsSplitOn }                from '@acx-ui/feature-toggle'
import { SwitchViewModel, Switch as SwitchType } from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { render, screen }                        from '@acx-ui/test-utils'

import { SwitchStackSetting } from './index'

// Mock the necessary dependencies
jest.mock('@acx-ui/feature-toggle', () => ({
  ...jest.requireActual('@acx-ui/feature-toggle'),
  useIsSplitOn: jest.fn(() => true)
}))

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  showActionModal: jest.fn(({ onCancel }) => {
    if (onCancel) onCancel()
  })
}))

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  isFirmwareVersionAbove10010g2Or10020b: jest.fn(() => true)
}))

describe('SwitchStackSetting - Port MAC Security', () => {
  const mockSwitchData = {
    portSecurityMaxEntries: 100
  }

  const mockSwitchDetail = {
    firmware: 'TNR10020b_b257',
    vlanMapping: '{}'
  }

  const formWrapper = ({ children }: React.PropsWithChildren<{}>) => (
    <Provider>
      <Form initialValues={{ portSecurity: false }}>
        {children}
      </Form>
    </Provider>
  )

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockImplementation(feature =>
      feature === Features.SWITCH_SUPPORT_MAC_ACL_TOGGLE
    )
  })

  it('should render Port MAC Security toggle and Sticky MAC List Size Limit when conditions are met', async () => {
    render(
      <SwitchStackSetting
        switchData={mockSwitchData as SwitchType}
        switchDetail={mockSwitchDetail as SwitchViewModel}
        apGroupOption={[]}
        readOnly={false}
        disableIpSetting={false}
      />,
      { wrapper: formWrapper }
    )

    expect(await screen.findByText('Port MAC Security')).toBeInTheDocument()
    const securitySwitch = await screen.findByTestId('port-security-switch')
    expect(securitySwitch).not.toBeChecked()

    await userEvent.click(securitySwitch)

    const maxEntriesInput = await screen.findByTestId('port-security-max-entries-input')
    expect(maxEntriesInput).toBeInTheDocument()
    expect(maxEntriesInput).toHaveValue('1')
  })

  it('should show confirmation dialog when reducing Sticky MAC List Size Limit', async () => {
    const showActionModalMock = jest.requireMock('@acx-ui/components').showActionModal

    render(
      <SwitchStackSetting
        switchData={mockSwitchData as SwitchType}
        switchDetail={mockSwitchDetail as SwitchViewModel}
        apGroupOption={[]}
        readOnly={false}
        disableIpSetting={false}
      />,
      { wrapper: formWrapper }
    )

    await userEvent.click(await screen.findByTestId('port-security-switch'))

    const maxEntriesInput = await screen.findByTestId('port-security-max-entries-input')

    fireEvent.change(maxEntriesInput, { target: { value: 50 } })

    expect(showActionModalMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'confirm',
        title: expect.anything(),
        okText: expect.stringContaining('Delete'),
        cancelText: expect.stringContaining('Cancel')
      })
    )
  })

  it('should not render Port MAC Security when feature flag is disabled', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    render(
      <SwitchStackSetting
        switchData={mockSwitchData as SwitchType}
        switchDetail={mockSwitchDetail as SwitchViewModel}
        apGroupOption={[]}
        readOnly={false}
        disableIpSetting={false}
      />,
      { wrapper: formWrapper }
    )

    expect(screen.queryByText('Port MAC Security')).not.toBeInTheDocument()
  })

  it('should disable Port MAC Security toggle when in readOnly mode', async () => {
    render(
      <SwitchStackSetting
        switchData={mockSwitchData as SwitchType}
        switchDetail={mockSwitchDetail as SwitchViewModel}
        apGroupOption={[]}
        readOnly={true}
        disableIpSetting={false}
      />,
      { wrapper: formWrapper }
    )

    const securitySwitch = await screen.findByTestId('port-security-switch')
    expect(securitySwitch).toBeDisabled()
  })
})