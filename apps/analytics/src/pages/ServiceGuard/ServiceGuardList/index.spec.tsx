import '@testing-library/jest-dom'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import ServiceGuardList from '.'

jest.mock('./ServiceGuardTable', () => ({
  ...jest.requireActual('./ServiceGuardTable'),
  ServiceGuardTable: () => <div data-testid='ServiceGuardTable' />
}))

describe('Network Health', () => {
  it('should render page correctly', async () => {
    render(<ServiceGuardList />,{ wrapper: Provider, route: {} })
    expect(await screen.findByText('Network Health')).toBeVisible()
    expect(await screen.findByTestId('ServiceGuardTable')).toBeVisible()
  })
})
