import { render } from '@testing-library/react'

import { ContentSwitcher, ContentSwitcherProps } from '@acx-ui/components'


const tabDetails: ContentSwitcherProps['tabDetails'] = [
  {
    label: 'Topology',
    value: 'topology',
    children: <span>Topology</span>
  },
  {
    label: 'Floor Plans',
    value: 'floor-plans',
    children: <span>Floor Plans</span>
  }
]

jest.mock(
  'rc/Widgets',
  () => ({ name }: { name: string }) => <div data-testid={`networks-${name}`} title={name} />,
  { virtual: true })

describe('VenueOverviewTab', () => {
  it('should render Venue Overview contentswitcher', () => {
    const { asFragment } =render(<ContentSwitcher tabDetails={tabDetails}/>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render component with default selection',() => {
    const { asFragment } =render(
      <ContentSwitcher tabDetails={tabDetails} defaultValue={'floor-plans'}/>)
    expect(asFragment()).toMatchSnapshot()
  })
})
