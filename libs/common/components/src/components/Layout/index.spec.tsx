import '@testing-library/jest-dom'
import { render }        from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

import menuConfig from './stories/menuConfig'

import { Layout } from '.'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
})

describe('Layout', () => {
  it('should render correctly', async () => {
    const { asFragment } = render(
      <BrowserRouter>
        <Layout
          menuConfig={menuConfig}
          rightHeaderContent={<div>Right header</div>}
          leftHeaderContent={<div>Left header</div>}
          content={<div>content</div>}
        />
      </BrowserRouter>
    )
    expect(asFragment()).toMatchSnapshot()
  })
})