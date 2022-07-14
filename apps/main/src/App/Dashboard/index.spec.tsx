import '@testing-library/jest-dom'
import { render, screen } from '@acx-ui/test-utils'

import Dashboard from '.'

jest.mock(
  'analytics/Widgets',
  () => ({ name }: { name: string }) => <div data-testid={`analytics-${name}`} />,
  { virtual: true })

jest.mock(
  'rc-wifi/Widgets',
  () => ({ name }: { name: string }) =><div data-testid={`networks-${name}`} />,
  { virtual: true })

describe('Dashboard', () => {
  it('renders correctly', async () => {
    render(<Dashboard />)

    expect(await screen.findAllByTestId(/^analytics/)).toHaveLength(6)
    expect(await screen.findAllByTestId(/^networks/)).toHaveLength(5)
  })
})
