
import { ApDeviceStatusEnum } from '@acx-ui/rc/utils'
import { render, screen }     from '@acx-ui/test-utils'

import { ApCompatibilityFeature } from '.'

jest.mock('../../useEdgeActions', () => ({
  ...jest.requireActual('../../useEdgeActions'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

describe('ApCompatibilityFeature', () => {
  it('should Fully compatible render correctly', async () => {
    render(<ApCompatibilityFeature count={0} onClick={jest.fn()} />)
    const icon = await screen.findByTestId('CheckMarkCircleSolid')
    expect(icon).toBeVisible()
  })

  it('should Partially incompatible render correctly', async () => {
    render(<ApCompatibilityFeature count={2} onClick={jest.fn()} />)
    const icon = await screen.findByTestId('WarningTriangleSolid')
    expect(icon).toBeVisible()
  })

  it('should Unknown render correctly', async () => {
    render(<ApCompatibilityFeature onClick={jest.fn()} />)
    const icon = await screen.findByTestId('Unknown')
    expect(icon).toBeVisible()
  })

  describe('edge compatibility', () => {
    it('should render Fully compatible correctly', async () => {
      render(<ApCompatibilityFeature
        count={0}
        deviceStatus={ApDeviceStatusEnum.OPERATIONAL}
        onClick={jest.fn()}
      />)
      screen.getByText('Fully compatible')
      expect(screen.getByTestId('CheckMarkCircleSolid')).toBeVisible()
    })

    it('should render Partially incompatible correctly', async () => {
      render(<ApCompatibilityFeature
        count={2}
        deviceStatus={ApDeviceStatusEnum.OPERATIONAL}
        onClick={jest.fn()}
      />)
      screen.getByText('Partially incompatible')
      expect(screen.getByTestId('WarningTriangleSolid')).toBeVisible()
    })

    it('should render unknown when deviceStatus is undefined', async () => {
      render(<ApCompatibilityFeature count={1} onClick={jest.fn()} />)
      expect(screen.getByTestId('Unknown')).toBeVisible()
      screen.getByText('Unknown')
    })

    it('should render unknown when count is undefined', async () => {
      render(<ApCompatibilityFeature
        deviceStatus={ApDeviceStatusEnum.OPERATIONAL}
        onClick={jest.fn()}
      />)
      expect(screen.getByTestId('Unknown')).toBeVisible()
      screen.getByText('Unknown')
    })

    it('should render unavailable correctly', async () => {
      render(<ApCompatibilityFeature
        deviceStatus={ApDeviceStatusEnum.OFFLINE}
        onClick={jest.fn()} />)
      screen.getByText('Check Unavailable')
      expect(screen.getByTestId('MinusCircleSolid')).toBeVisible()
    })

    it('should render checking correctly', async () => {
      render(<ApCompatibilityFeature
        count={0}
        deviceStatus={ApDeviceStatusEnum.APPLYING_CONFIGURATION}
        onClick={jest.fn()}
      />)
      screen.getByText('Compatibility Checking')
      expect(screen.getByTestId('InProgress')).toBeVisible()
    })
  })
})