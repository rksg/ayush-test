import '@testing-library/jest-dom'
import { render } from '@acx-ui/test-utils'

import { ResizableColumn } from './ResizableColumn'

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useRef: jest.fn(() => null)
}))

describe('ResizableColumn', () => {
  it('should render without Resizable', () => {
    const { asFragment } = render(
      <table><tbody><tr><ResizableColumn
        onResize={jest.fn()}
        hasEllipsisColumn={false}
      /></tr></tbody></table>)
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div')).toBe(null)
  })
  it('should render with Resizable', () => {
    const { asFragment } = render(
      <table><tbody><tr><ResizableColumn
        onResize={jest.fn()}
        hasEllipsisColumn={false}
        width={100}
      /></tr></tbody></table>)
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div')).toBeValid()
  })
})
