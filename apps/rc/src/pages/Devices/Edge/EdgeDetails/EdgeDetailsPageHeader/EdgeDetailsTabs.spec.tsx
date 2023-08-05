/* eslint-disable max-len */
import { rest } from 'msw'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  EdgeStatus,
  ApVenueStatusEnum,
  EdgeStatusEnum,
  EdgeUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider  } from '@acx-ui/store'
import {
  render,
  screen,
  fireEvent,
  mockServer
} from '@acx-ui/test-utils'


import { mockedEdgeServiceList } from '../../__tests__/fixtures'

import  EdgeDetailsTabs from './EdgeDetailsTabs'

const currentEdge:EdgeStatus = {
  name: 'edge-01',
  serialNumber: 'edge-111000001',
  venueId: '97b77f8a82324a1faa0f4cc3f56d1ef0',
  venueName: 'testVenue_Edge',
  model: 'test',
  type: 'test',
  deviceStatus: EdgeStatusEnum.INITIALIZING,
  deviceStatusSeverity: ApVenueStatusEnum.IN_SETUP_PHASE,
  ip: '1.1.1.1',
  ports: '62,66',
  tags: [],
  cpuCores: 2,
  cpuUsedPercentage: 66,
  memoryTotalKb: 120 * Math.pow(1024, 2),
  memoryUsedKb: 50 * Math.pow(1024, 2),
  diskTotalKb: 250 * Math.pow(1024, 3),
  diskUsedKb: 162 * Math.pow(1024, 3)
}

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Edge Details Tabs', () => {
  let params: { tenantId: string, serialNumber: string } =
  { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac', serialNumber: currentEdge.serialNumber }

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeServiceList.url,
        (req, res, ctx) => res(ctx.json(mockedEdgeServiceList))
      )
    )
  })

  it('should not have troubleshooting tab if not OPERATIONAL', async () => {
    render(
      <Provider>
        <EdgeDetailsTabs
          isOperational={currentEdge.deviceStatus=== EdgeStatusEnum.OPERATIONAL}
        />
      </Provider>, {
        route: { params }
      })

    expect(screen.queryByText('Troubleshooting')).toBeFalsy()
  })

  it('should not display troubleshooting tab when FF is disabled', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <EdgeDetailsTabs
          isOperational={true}
        />
      </Provider>, {
        route: { params }
      })

    expect(screen.queryByText('Troubleshooting')).toBeFalsy()
  })

  it('should redirect to timeline tab', async () => {
    render(
      <Provider>
        <EdgeDetailsTabs
          isOperational={currentEdge.deviceStatus=== EdgeStatusEnum.OPERATIONAL}/>
      </Provider>
      , {
        route: { params }
      })

    fireEvent.click(screen.getByText('Timeline'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/devices/edge/${currentEdge.serialNumber}/details/timeline`,
      hash: '',
      search: ''
    })
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <EdgeDetailsTabs
          isOperational={true} />
      </Provider>
      , {
        route: { params }
      })

    expect(await screen.findByText('Services (3)')).toBeVisible()
    expect(await screen.findByRole('tab', { name: 'Troubleshooting' })).toBeVisible()
  })
})