
import userEvent, { PointerEventsCheckLevel } from '@testing-library/user-event'

import { EdgeSdLanFixtures } from '@acx-ui/rc/utils'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { NetworkTunnelTypeEnum } from '../types'

import { NetworkTunnelSwitchBtn } from './NetworkTunnelSwitchBtn'

const { mockedMvSdLanDataList } = EdgeSdLanFixtures

describe('NetworkTunnelSwitchBtn', () => {
  const mockOnClick = jest.fn()

  beforeEach(() => {
    mockOnClick.mockClear()
  })

  it('should correctly render SDLAN', async () => {
    render(
      <NetworkTunnelSwitchBtn
        tunnelType={NetworkTunnelTypeEnum.SdLan}
        onClick={mockOnClick}
        venueSdLanInfo={mockedMvSdLanDataList[0]}
      />
    )

    const btn = screen.getByRole('switch')
    expect(btn).not.toBeDisabled()
    expect(btn).toBeChecked()
    await userEvent.click(btn)
    expect(mockOnClick).toBeCalledTimes(1)
  })

  it('should greyout when the network is the last one in SDLAN', async () => {
    render(
      <NetworkTunnelSwitchBtn
        tunnelType={NetworkTunnelTypeEnum.SdLan}
        onClick={mockOnClick}
        venueSdLanInfo={{
          ...mockedMvSdLanDataList[0],
          tunneledWlans: mockedMvSdLanDataList[0].tunneledWlans!.slice(0, 1)
        }}
      />
    )

    const btn = screen.getByRole('switch')
    expect(btn).toBeDisabled()
    expect(btn).toBeChecked()
    await userEvent.hover(btn, { pointerEventsCheck: PointerEventsCheckLevel.Never })
    // eslint-disable-next-line max-len
    await screen.findByRole('tooltip', { name: 'Cannot deactivate the last network at this venue', hidden: true })
  })

  it('should correctly render PIN case', async () => {
    render(
      <NetworkTunnelSwitchBtn
        tunnelType={NetworkTunnelTypeEnum.Pin}
        onClick={mockOnClick}
        venueSdLanInfo={undefined}
      />
    )

    const btn = screen.getByRole('switch')
    expect(btn).toBeDisabled()
    expect(btn).toBeChecked()
    await userEvent.hover(btn, { pointerEventsCheck: PointerEventsCheckLevel.Never })
    // eslint-disable-next-line max-len
    expect(screen.queryByRole('tooltip', { name: 'Cannot deactivate the last network at this venue', hidden: true })).toBeNull()
  })

  it('should correctly render SoftGre case', async () => {
    render(
      <NetworkTunnelSwitchBtn
        tunnelType={NetworkTunnelTypeEnum.SoftGre}
        onClick={mockOnClick}
        venueSdLanInfo={undefined}
      />
    )
    const btn = screen.getByRole('switch')
    expect(btn).not.toBeDisabled()
    expect(btn).toBeChecked()
  })

  it('should correctly render local breakout', async () => {
    render(
      <NetworkTunnelSwitchBtn
        tunnelType={NetworkTunnelTypeEnum.None}
        onClick={mockOnClick}
        venueSdLanInfo={undefined}
      />
    )
    const btn = screen.getByRole('switch')
    expect(btn).not.toBeDisabled()
    expect(btn).not.toBeChecked()
  })

  it('should disable with props', async () => {
    render(
      <NetworkTunnelSwitchBtn
        tunnelType={NetworkTunnelTypeEnum.None}
        onClick={mockOnClick}
        disabled={true}
        tooltip='testing'
        venueSdLanInfo={undefined}
      />
    )
    const btn = screen.getByRole('switch')
    expect(btn).toBeDisabled()
    expect(btn).not.toBeChecked()
    await userEvent.hover(btn, { pointerEventsCheck: PointerEventsCheckLevel.Never })
    await screen.findByRole('tooltip', { name: 'testing', hidden: true })
  })

  it('should call onClick with true when the button is clicked', async () => {
    const mockOnClick = jest.fn()

    render(<NetworkTunnelSwitchBtn
      tunnelType={NetworkTunnelTypeEnum.None}
      onClick={mockOnClick}
      venueSdLanInfo={undefined}
    />)

    const button = screen.getByRole('switch')
    await userEvent.click(button)

    expect(mockOnClick).toHaveBeenCalledWith(true)
  })

  // eslint-disable-next-line max-len
  it('should call onClick with false when the button is clicked and NOT greyout', async () => {
    const mockOnClick = jest.fn()

    render(<NetworkTunnelSwitchBtn
      tunnelType={NetworkTunnelTypeEnum.SoftGre}
      onClick={mockOnClick}
      venueSdLanInfo={undefined}
    />)

    const button = screen.getByRole('switch')
    await userEvent.click(button)
    expect(screen.getByRole('switch')).not.toBeDisabled()
    expect(mockOnClick).toHaveBeenCalledWith(false)
  })
})