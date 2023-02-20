import { Provider }                 from '@acx-ui/store'
import { render,screen, fireEvent } from '@acx-ui/test-utils'

import { tenantID, currentEdge, edgePortsSetting } from '../__tests__/fixtures'

import EdgeDetailsDrawer from './'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Edge Ports List', () => {
  let params: { tenantId: string, serialNumber: string } =
    { tenantId: tenantID, serialNumber: currentEdge.serialNumber }

  it('render port list', async () => {
    render(
      <Provider>
        <EdgeDetailsDrawer
          visible={true}
          setVisible={() => {
            return false
          }}
          edgePortsSetting={edgePortsSetting}/>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/edge-details/overview' }
      }
    )

    const row = await screen.findAllByRole('row', { name: /Port \d/i })
    expect(row.length).toBe(2)
  })

  it('redirect configure port page should be correct', async () => {
    render(
      <Provider>
        <EdgeDetailsDrawer
          visible={true}
          setVisible={() => {
            return false
          }}
          edgePortsSetting={edgePortsSetting}/>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/edge-details/overview' }
      })

    fireEvent.click(await screen.findByText('Configure Port Settings'))

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/devices/edge/${params.serialNumber}/edit/ports`,
      hash: '',
      search: ''
    })
  })
})