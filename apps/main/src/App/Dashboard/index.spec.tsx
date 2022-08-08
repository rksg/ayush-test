import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@acx-ui/test-utils'

import Dashboard from '.'

jest.mock(
  'analytics/Widgets',
  () => ({ name }: { name: string }) => <div data-testid={`analytics-${name}`} />,
  { virtual: true })

jest.mock(
  'rc/Widgets',
  () => ({ name }: { name: string }) =><div data-testid={`networks-${name}`} />,
  { virtual: true })

describe('Dashboard', () => {
  it('renders correctly', async () => {
    render(<Dashboard />)

    expect(await screen.findAllByTestId(/^analytics/)).toHaveLength(6)
    expect(await screen.findAllByTestId(/^networks/)).toHaveLength(5)
  })
  it('should switch tab correctly', async () => {
    render(<Dashboard />)
    fireEvent.click(await screen.findByText('Switch'))
    expect(await screen.findAllByTestId(/^analytics/)).toHaveLength(7)
    expect(await screen.findAllByTestId(/^networks/)).toHaveLength(5)
  })
})
