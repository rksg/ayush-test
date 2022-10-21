import { render } from '@acx-ui/test-utils'

import { NoData, NotAvailable } from '.'

describe('NoData', () => {
  it('should render correctly', () => {
    const { asFragment } = render(<NoData/>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render correctly with the prop', () => {
    const { asFragment } = render(<NoData text='No data available'/>)
    expect(asFragment()).toMatchSnapshot()
  })
})

describe('NotAvailable', () => {
  it('should render correctly', () => {
    const { asFragment } = render(<NotAvailable/>)
    expect(asFragment()).toMatchSnapshot()
  })
})
