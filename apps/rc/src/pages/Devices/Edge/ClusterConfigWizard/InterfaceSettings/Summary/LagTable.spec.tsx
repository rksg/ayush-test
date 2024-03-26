import { render, screen } from '@acx-ui/test-utils'

import { LagTable } from './LagTable'

const mockData = [
  {
    serialNumber: 'serialNumber-1',
    lags: []
  }
]
const mockPortSettings = {
  'serialNumber-1': {

  }
}

describe('InterfaceSettings - Summary > LagTable', () => {
  it('should render correctly', async () => {
    render(
      <LagTable
        data={mockData}
        portSettings={mockPortSettings}
      />
    )

    expect(screen.getByText('Summary')).toBeVisible()
    expect(screen.getByTestId('LagTable')).toBeVisible()
    expect(screen.getByTestId('PortGeneralTable')).toBeVisible()
    expect(await screen.findByTestId('VipCard')).toBeVisible()
    expect(await screen.findByText('HA Timeout')).toBeVisible()
    expect(await screen.findByText('3 seconds')).toBeVisible()
  })
})