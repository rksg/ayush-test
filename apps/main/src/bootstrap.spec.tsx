import '@testing-library/jest-dom'

import { act, screen } from '@acx-ui/test-utils'

import * as bootstrap from './bootstrap'

jest.mock('./AllRoutes', () => () => <div data-testid='all-routes' />)
jest.mock('@acx-ui/theme', () => {}, { virtual: true })
jest.mock('@acx-ui/components', () => ({
  ConfigProvider: (props: { children: React.ReactNode }) => <div
    {...props}
    data-testid='config-provider'
  />
}))

describe('bootstrap.init', () => {
  it('renders correctly', async () => {
    const root = document.createElement('div')
    root.id = 'root'
    document.body.appendChild(root)

    await act(() => bootstrap.init())

    expect(screen.getByTestId('all-routes')).toBeVisible()
  })
})
