import { render, screen } from '@acx-ui/test-utils'

import { fetchServiceGuardTest } from '../../__tests__/fixtures'
import { NetworkHealthTest }     from '../../types'

import { Overview } from '.'

jest.mock('./ConfigSection', () => ({
  ...jest.requireActual('./ConfigSection'),
  ConfigSection: () => <div data-testid='ConfigSection' />
}))

jest.mock('./ExecutionSection', () => ({
  ...jest.requireActual('./ExecutionSection'),
  ExecutionSection: () => <div data-testid='ExecutionSection' />
}))

describe('Overview component', () => {
  it('should render correctly', async () => {
    render(<Overview
      details={fetchServiceGuardTest.serviceGuardTest as unknown as NetworkHealthTest}/>)
    expect(screen.queryByTestId('ConfigSection')).toBeVisible()
    expect(screen.queryByTestId('ExecutionSection')).toBeVisible()
  })
})
