import userEvent from '@testing-library/user-event'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { useConfigChange } from '.'

jest.mock('./Chart', () => ({ Chart: () => <div data-testid='Chart' /> }))
jest.mock('./KPI', () => ({ KPIs: () => <div data-testid='KPIs' /> }))
jest.mock('./Table', () => ({ Table: () => <div data-testid='Table' /> }))

jest.mock('./NetworkFilter', () => ({
  NetworkFilter: () => <div data-testid='NetworkFilter' />
}))

describe('ConfigChange', () => {
  it('should render component correctly', async () => {
    const Component = () => {
      const { component } = useConfigChange()
      return component
    }
    render(<Component/>, { wrapper: Provider, route: {} })
    expect(await screen.findByTestId('Chart')).toBeVisible()
    expect(await screen.findByTestId('KPIs')).toBeVisible()
    expect(await screen.findByTestId('Table')).toBeVisible()
  })
  it('should render header correctly', async () => {
    const Component = () => {
      const { headerExtra } = useConfigChange()
      return <span>{headerExtra}</span>
    }
    render(<Component/>, { wrapper: Provider, route: {} })
    expect(await screen.findByTestId('NetworkFilter')).toBeVisible()
    expect(await screen.findByText('Last 7 Days')).toBeVisible()
  })
  it('should handle time range change', async () => {
    const Component = () => {
      const { headerExtra } = useConfigChange()
      return <span>{headerExtra}</span>
    }
    render(<Component/>, { wrapper: Provider, route: {} })
    const trigger = await screen.findByText('Last 7 Days')
    expect(trigger).toHaveTextContent('Last 7 Days')
    await userEvent.click(trigger)
    await userEvent.click(screen.getByRole('menuitem', { name: 'Last 30 Days' }))
    expect(trigger).toHaveTextContent('Last 30 Days')
  })
})
