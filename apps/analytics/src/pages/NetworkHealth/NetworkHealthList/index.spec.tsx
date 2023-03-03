import '@testing-library/jest-dom'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import NetworkHealthList from '.'

jest.mock('./NetworkHealthTable', () => ({
  ...jest.requireActual('./NetworkHealthTable'),
  NetworkHealthTable: () => <div data-testid='NetworkHealthTable' />
}))

describe('Network Health', () => {
  it('should render page correctly', async () => {
    render(<NetworkHealthList />,{ wrapper: Provider, route: {} })
    expect(await screen.findByText('Network Health')).toBeVisible()
    expect(await screen.findByTestId('NetworkHealthTable')).toBeVisible()
  })
})
