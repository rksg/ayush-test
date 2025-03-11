import { defaultNetworkPath } from '@acx-ui/analytics/utils'
import { NetworkNode }        from '@acx-ui/utils'

import { mockNetworkNodes } from '../__tests__/mockedEcoFlex'

import { transformSANetworkHierarchy } from './APSelection'

describe('transformSANetworkHierarchy', () => {
  it('transform label correctly', () => {
    const data = mockNetworkNodes as NetworkNode[]
    const expectLabels = data[0].children?.map(ap => `${ap.name} (${ap.mac}) (Access Point)`)
    const result = transformSANetworkHierarchy(data, defaultNetworkPath)
    const labels = result[0].children?.map(node => node.label)
    expect(result[0].label).toEqual(`${data[0].name} (AP Group)`)
    expect(labels).toEqual(expectLabels)
  })
})
