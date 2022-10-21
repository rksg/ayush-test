import { Provider  } from '@acx-ui/store'
import { render }    from '@acx-ui/test-utils'

import TopologyFloorPlanWidget from '.'

jest.mock('../FloorPlan', () => ({
  __esModule: true,
  default: () => <div>Floor Plan</div>
}))

describe('TopologyFloorPlanWidget', () => {
  it('should render correctly', () => {
    const { asFragment } = render(<Provider><TopologyFloorPlanWidget /></Provider>)
    expect(asFragment()).toMatchSnapshot()
  })
})
