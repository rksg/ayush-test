import { render } from '@acx-ui/test-utils'

import { NoActiveContent, NoActiveData, NoData } from '.'

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

describe('NoActiveContent', () => {
  it('should render correctly', () => {
    const { asFragment } = render(<NoActiveContent/>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render correctly with the prop', () => {
    const { asFragment } = render(<NoActiveContent text='No data available'/>)
    expect(asFragment()).toMatchSnapshot()
  })
})
