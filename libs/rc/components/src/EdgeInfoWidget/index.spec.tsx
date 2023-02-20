/* eslint-disable max-len */
import { Provider  } from '@acx-ui/store'
import { render,
  screen,
  fireEvent
} from '@acx-ui/test-utils'


import { tenantID, currentEdge, edgePortsSetting } from './__tests__/fixtures'

import { EdgeInfoWidget } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Edge Information Widget', () => {
  let params: { tenantId: string, serialNumber: string } =
  { tenantId: tenantID, serialNumber: currentEdge.serialNumber }


  it('should render ports donut chart correctly', async () => {
    const { asFragment } = render(
      <Provider>
        <EdgeInfoWidget currentEdge={currentEdge} edgePortsSetting={edgePortsSetting} isEdgeStatusLoading={false} isPortListLoading={false} />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/edge-details/overview' }
      })

    expect(asFragment().querySelector('svg')).toBeDefined()
  })


  it('should display drawer when clicked on ports donut chart', async () => {
    const { asFragment } = render(
      <Provider>
        <EdgeInfoWidget currentEdge={currentEdge} edgePortsSetting={edgePortsSetting} isEdgeStatusLoading={false} isPortListLoading={false} />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/edge-details/overview' }
      })

    const firstRender = asFragment()
    expect(firstRender.querySelector('svg')).toBeDefined()
    expect(firstRender.querySelectorAll('div[_echarts_instance_^="ec_"]').length).toBe(1)
    let target = firstRender.querySelectorAll('path[stroke-linejoin="round"]')
    expect(target.length).toBe(2)
    fireEvent.click(firstRender.querySelectorAll('path[stroke-linejoin="round"]')[0])
  })

  it('should display loading icon while waiting for response', async () => {
    render(
      <Provider>
        <EdgeInfoWidget currentEdge={currentEdge} edgePortsSetting={edgePortsSetting} isEdgeStatusLoading={true} isPortListLoading={true} />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/edge-details/overview' }
      })

    expect(await screen.findAllByRole('img', { name: 'loader' })).toBeTruthy()
  })
})