import { render } from '@acx-ui/test-utils'

import { NoActiveData, NoData, NotAvailable } from '.'

jest.mock('@acx-ui/icons', ()=> {
  const icons = jest.requireActual('@acx-ui/icons')
  const keys = Object.keys(icons).map(key => [key, () => <div data-testid={key} />])
  return Object.fromEntries(keys)
})

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

describe('NoActiveData', () => {
  it('should render correctly', () => {
    const { asFragment } = render(<NoActiveData/>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render correctly with the prop', () => {
    const { asFragment } = render(<NoActiveData text='No data available'/>)
    expect(asFragment()).toMatchSnapshot()
  })
})

describe('NotAvailable', () => {
  it('should render correctly', () => {
    const { asFragment } = render(<NotAvailable/>)
    expect(asFragment()).toMatchSnapshot()
  })
})
