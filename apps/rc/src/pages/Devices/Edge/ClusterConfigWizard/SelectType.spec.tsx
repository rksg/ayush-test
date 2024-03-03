import userEvent from '@testing-library/user-event'

import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { SelectType } from './SelectType'

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  EdgeClusterTypeCard: (props: {
    id: string,
    onClick: (id: string) => void
  }) => <div
    data-testid={`rc-typeCard-${props.id}`}
    onClick={() => props.onClick(props.id)}
  >
    {props.id}
  </div>
}))

describe('SelectType', () => {
  let params: { tenantId: string, clusterId:string }
  beforeEach(() => {
    params = {
      tenantId: 'mocked_t_id',
      clusterId: 'mocked_cluster_id'
    }
    mockedUsedNavigate.mockReset()
  })

  it('should navigte to interface setting step', async () => {
    render(
      <Provider>
        <SelectType />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure' }
      })

    const card = await screen.findByTestId('rc-typeCard-interface')
    expect(card).toBeInTheDocument()
    await userEvent.click(card)
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      // eslint-disable-next-line max-len
      pathname: `/${params.tenantId}/t/devices/edge/cluster/${params.clusterId}/configure/interface`,
      hash: '',
      search: ''
    })
  })
  it('should navigte to sub-interface setting step', async () => {
    render(
      <Provider>
        <SelectType />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure' }
      })
    const card = await screen.findByTestId('rc-typeCard-subInterface')
    expect(card).toBeInTheDocument()
    await userEvent.click(card)
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      // eslint-disable-next-line max-len
      pathname: `/${params.tenantId}/t/devices/edge/cluster/${params.clusterId}/configure/subInterface`,
      hash: '',
      search: ''
    })
  })
  it('should navigte to cluster interface setting step', async () => {
    render(
      <Provider>
        <SelectType />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure' }
      })
    const card = await screen.findByTestId('rc-typeCard-clusterInterface')
    expect(card).toBeInTheDocument()
    await userEvent.click(card)
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      // eslint-disable-next-line max-len
      pathname: `/${params.tenantId}/t/devices/edge/cluster/${params.clusterId}/configure/clusterInterface`,
      hash: '',
      search: ''
    })
  })
  it('should navigte to cluster table page when cancel is clicked', async () => {
    render(
      <Provider>
        <SelectType />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure' }
      })
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/devices/edge`,
      hash: '',
      search: ''
    })
  })
})
