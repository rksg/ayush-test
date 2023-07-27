import { EntitlementDeviceType } from '@acx-ui/rc/utils'
import { render, screen }        from '@acx-ui/test-utils'

import { SubscriptionUtilizationWidget } from '.'

jest.mock('./styledComponent', () => ({
  ...jest.requireActual('./styledComponent'),
  OverutilizationText: (props: React.PropsWithChildren) =>
    (<div data-testid='overutilizationText' >{props.children}</div>)
}))

describe('Subscription utilization widget', () => {
  it('should correctly display overutilization', async () => {
    render(<SubscriptionUtilizationWidget
      deviceType={EntitlementDeviceType.ANALYTICS}
      title='Analytics'
      total={60}
      used={80}
    />)

    await screen.findByText('Analytics')
    expect(screen.queryByTestId('overutilizationText')).toBeVisible()
    expect(screen.queryByTestId('overutilizationText')?.textContent).toBe('80')
  })

  it('should correctly display zero quantity', async () => {
    render(<SubscriptionUtilizationWidget
      deviceType={EntitlementDeviceType.ANALYTICS}
      title='Analytics'
      total={0}
      used={0}
    />)

    await screen.findByText('Analytics')
    expect(await screen.findByText(/0\s+\/\s+0/i)).toBeVisible()
  })

  it('should correctly display zero quantity overutilization', async () => {
    render(<SubscriptionUtilizationWidget
      deviceType={EntitlementDeviceType.ANALYTICS}
      title='Analytics'
      total={0}
      used={10}
    />)

    await screen.findByText('Analytics')
    expect(screen.queryByTestId('overutilizationText')).toBeVisible()
    expect(screen.queryByTestId('overutilizationText')?.textContent).toBe('10')
  })

  it('should correctly display too much overutilization', async () => {
    render(<SubscriptionUtilizationWidget
      deviceType={EntitlementDeviceType.ANALYTICS}
      title='Analytics'
      total={60}
      used={180}
    />)

    await screen.findByText('Analytics')
    expect(screen.queryByTestId('overutilizationText')).toBeVisible()
    expect(screen.queryByTestId('overutilizationText')?.textContent).toBe('180')
  })
})