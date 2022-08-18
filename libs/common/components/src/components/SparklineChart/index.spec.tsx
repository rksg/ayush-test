import { render } from '@acx-ui/test-utils'

import { SparklineChart } from '.'

describe('SparklineChart', () => {
  it('should render correctly', async () => {
    const { asFragment } = render(
      <SparklineChart data={[0, 1, 2, 3]} />)
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
})
