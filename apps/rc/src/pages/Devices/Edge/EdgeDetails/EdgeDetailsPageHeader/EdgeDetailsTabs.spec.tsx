/* eslint-disable max-len */
import {
  EdgeStatus,
  ApVenueStatusEnum,
  EdgeStatusEnum
} from '@acx-ui/rc/utils'
import { Provider  } from '@acx-ui/store'
import {
  render,
  screen,
  fireEvent
} from '@acx-ui/test-utils'


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
  cpuTotal: 65 * Math.pow(1024, 2),
  cpuUsed: 5 * Math.pow(1024, 2),
  memTotal: 120 * Math.pow(1024, 2),
  memUsed: 50 * Math.pow(1024, 2),
  diskTotal: 250 * Math.pow(1024, 3),
  diskUsed: 162 * Math.pow(1024, 3)
}

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Edge Details Tabs', () => {
  let params: { tenantId: string, serialNumber: string } =
  { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac', serialNumber: currentEdge.serialNumber }

  it('should not have troubleshooting tab if not OPERATIONAL', async () => {
    render(
      <Provider>
        <EdgeDetailsTabs
          currentEdge={currentEdge}
        />
      </Provider>, {
        route: { params }
      })

    expect(screen.queryByText('Troubleshooting')).toBeFalsy()
  })


  it('should redirect to timeline tab', async () => {
    render(
      <EdgeDetailsTabs
        currentEdge={currentEdge}
      />, {
        route: { params }
      })

    fireEvent.click(screen.getByText('Timeline'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/devices/edge/${currentEdge.serialNumber}/edge-details/timeline`,
      hash: '',
      search: ''
    })
  })
})