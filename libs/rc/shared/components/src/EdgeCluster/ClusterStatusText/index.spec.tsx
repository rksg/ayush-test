import { cloneDeep } from 'lodash'

import { ClusterStatusEnum, ClusterNodeStatusEnum, EdgeStatus, EdgeGeneralFixtures } from '@acx-ui/rc/utils'
import { render, screen }                                                            from '@acx-ui/test-utils'

import { EdgeClusterStatusLabel } from './'

const { mockEdgeClusterList } = EdgeGeneralFixtures
const mock2NodesEdgeList = mockEdgeClusterList.data[0].edgeList as EdgeStatus[]
const mockSingleNodeEdgeList = mockEdgeClusterList.data[0].edgeList.slice(0, 1) as EdgeStatus[]

describe('EdgeClusterStatusLabel', () => {
  it('renders single node label when edge list length is less than 2', () => {
    const props = {
      edgeList: mockSingleNodeEdgeList,
      clusterStatus: ClusterStatusEnum.CLUSTER_IS_FORMING
    }
    render(<EdgeClusterStatusLabel {...props} />)
    expect(screen.getByText('Single Node')).toBeInTheDocument()
  })

  it('renders cluster forming label', () => {
    const props = {
      edgeList: mock2NodesEdgeList,
      clusterStatus: ClusterStatusEnum.CLUSTER_IS_FORMING
    }
    render(<EdgeClusterStatusLabel {...props} />)
    expect(screen.getByText('Cluster Forming')).toBeInTheDocument()
  })

  it('renders cluster ready label with ready and total counts', () => {
    const mock1NodeReadyEdgeList = cloneDeep(mock2NodesEdgeList)
    mock1NodeReadyEdgeList[1].clusterNodeStatus = ClusterNodeStatusEnum.CLUSTER_NODE_UNHEALTHY

    const props = {
      edgeList: mock1NodeReadyEdgeList,
      clusterStatus: ClusterStatusEnum.CLUSTER_READY
    }
    render(<EdgeClusterStatusLabel {...props} />)
    expect(screen.getByText('Ready (1/2)')).toBeInTheDocument()
  })

  it('renders cluster unhealthy label', () => {
    const props = {
      edgeList: mock2NodesEdgeList,
      clusterStatus: ClusterStatusEnum.CLUSTER_UNHEALTHY
    }
    render(<EdgeClusterStatusLabel {...props} />)
    expect(screen.getByText('Disconnected')).toBeInTheDocument()
  })

  it('renders cluster config needed label', () => {
    const props = {
      edgeList: mock2NodesEdgeList,
      clusterStatus: ClusterStatusEnum.CLUSTER_CONFIGS_NEEDED
    }
    render(<EdgeClusterStatusLabel {...props} />)
    expect(screen.getByText('Cluster Setup Required')).toBeInTheDocument()
  })

  it('renders default label when cluster status is unknown', () => {
    const props = { edgeList: mock2NodesEdgeList, clusterStatus: 'unknown' }
    render(<EdgeClusterStatusLabel {...props} />)
    expect(screen.getByText('Cluster Setup Required')).toBeInTheDocument()
  })

  it('renders default label when cluster status is undefined', () => {
    const props = { edgeList: mock2NodesEdgeList, clusterStatus: undefined }
    render(<EdgeClusterStatusLabel {...props} />)
    expect(screen.getByText('Cluster Setup Required')).toBeInTheDocument()
  })

  it('renders single node label when edge list is empty', () => {
    const props = { edgeList: [], clusterStatus: ClusterStatusEnum.CLUSTER_IS_FORMING }
    render(<EdgeClusterStatusLabel {...props} />)
    expect(screen.getByText('Single Node')).toBeInTheDocument()
  })

  it('renders single node label when edge list is undefined', () => {
    const props = { edgeList: undefined, clusterStatus: ClusterStatusEnum.CLUSTER_IS_FORMING }
    render(<EdgeClusterStatusLabel {...props} />)
    expect(screen.getByText('Single Node')).toBeInTheDocument()
  })
})