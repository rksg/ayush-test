import { render } from '@acx-ui/test-utils'

import { NoActiveContent, NoActiveData, NoData, NoDataIcon, NoGranularityText } from '.'

describe('NoData', () => {
  it('should render correctly', () => {
    const { asFragment } = render(<NoData/>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render correctly with custom text', () => {
    const { asFragment } = render(<NoData text='No data available'/>)
    expect(asFragment()).toMatchSnapshot()
  })
})

describe('NoActiveData', () => {
  it('should render correctly', () => {
    const { asFragment } = render(<NoActiveData/>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render correctly with custom text', () => {
    const { asFragment } = render(<NoActiveData text='No data available'/>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render correctly with large tick', () => {
    const { asFragment } = render(<NoActiveData tickSize='large'/>)
    expect(asFragment()).toMatchSnapshot()
  })
})

describe('NoActiveContent', () => {
  it('should render correctly', () => {
    const { asFragment } = render(<NoActiveContent/>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render correctly with custom text', () => {
    const { asFragment } = render(<NoActiveContent text='No data available'/>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render correctly with large tick', () => {
    const { asFragment } = render(<NoActiveContent tickSize='large'/>)
    expect(asFragment()).toMatchSnapshot()
  })
})

describe('NoDataIcon', () => {
  it('should render correctly', () => {
    const { asFragment } = render(<NoDataIcon/>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render correctly with custom text', () => {
    const { asFragment } = render(<NoDataIcon iconText='Empty' text='No data available'/>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render correctly without text', () => {
    const { asFragment } = render(<NoDataIcon hideText={true} />)
    expect(asFragment()).toMatchSnapshot()
  })
})

describe('NoGranularityText', () => {
  it('should render correctly', () => {
    const { asFragment } = render(<NoGranularityText/>)
    expect(asFragment()).toMatchSnapshot()
  })
})
