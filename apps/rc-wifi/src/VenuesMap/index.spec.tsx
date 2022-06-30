import { initialize } from '@googlemaps/jest-mocks'
import { Loader }     from '@googlemaps/js-api-loader'

import { ApVenueStatusEnum }                              from '@acx-ui/rc/services'
import { BrowserRouter as Router }                        from '@acx-ui/react-router-dom'
import { Provider }                                       from '@acx-ui/store'
import { act, queryByAttribute, render, screen, waitFor } from '@acx-ui/test-utils'

import VenueMarkerWithLabel from './VenueMarkerWithLabel'

import { VenuesMap, getVenueInfoMarkerIcon, clusterClickHandler } from './'


jest.mock('@acx-ui/config', () => ({
  __esModule: true,
  get: jest.fn().mockReturnValue('some-key')
}))

const executeLoaderCallback = async (): Promise<void> => {
  // eslint-disable-next-line testing-library/no-unnecessary-act
  await act(async () => {
    const loader = Loader['instance']
    loader.callback()
    await waitFor(() => loader.done)
  })
}

describe('VenuesMap', () => {
  beforeEach(() => {
    initialize()
  })

  it('should load google maps api using the key from env', async () => {
    render(
      <Router>
        <Provider>
          <VenuesMap data={[]} cluster />
        </Provider>
      </Router>
    )

    expect(screen.getByRole('heading').textContent).toEqual('LOADING')

    // eslint-disable-next-line testing-library/no-node-access
    const script = document.getElementsByTagName('script')[0]
    expect(script.src).toEqual(
      'https://maps.googleapis.com/maps/api/js' +
      '?callback=__googleMapsCallback&key=some-key&libraries=places')
  })
  it('should load the child component after api is loaded successfully', async () => {
    const { container } = render(
      <Router>
        <Provider>
          <VenuesMap data={[]} cluster />
        </Provider>
      </Router>
    )
    
    await executeLoaderCallback() // Will make render return success
    const getById = queryByAttribute.bind(null, 'id')
    const map = getById(container, 'map')
    expect(map).toBeTruthy()  
  })
  describe('VenueClusterRenderer',()=>{
    it('should test getVenueInfoMarkerIcon method',()=>{
      const listOfStatuses:ApVenueStatusEnum[] = [
        ApVenueStatusEnum.IN_SETUP_PHASE,
        ApVenueStatusEnum.OFFLINE,
        ApVenueStatusEnum.OPERATIONAL,
        ApVenueStatusEnum.REQUIRES_ATTENTION,
        ApVenueStatusEnum.TRANSIENT_ISSUE
      ]
      const iconList = listOfStatuses.map(status=>getVenueInfoMarkerIcon(status))
      expect(iconList).toMatchSnapshot()
    })
    it('should test getVenueInfoMarkerIcon method for unknown status',()=>{
      const icon = getVenueInfoMarkerIcon('unkownStatus')
      expect(icon).toMatchSnapshot()
    })

    it('clusterClickHandler',()=>{
      const series=[
        {
          name: '1 Requires Attention',
          value: 0
        },
        {
          name: '2 Transient Issue',
          value: 0
        },
        {
          name: '3 In Setup Phase',
          value: 0
        },
        {
          name: '4 Operational',
          value: 1
        }
      ]
      const marker = new VenueMarkerWithLabel({
        labelContent: ''
      },{
        venueId: 'someVenueId',
        name: 'someVenueName',
        status: ApVenueStatusEnum.OPERATIONAL,
        apStat: [{
          category: 'APs',
          series
        }],
        apsCount: 50,
        switchStat: [{
          category: 'Switches',
          series
        }],
        switchesCount: 2,
        clientsCount: 20,
        switchClientsCount: 10
      })
      
      const clusterInfoWindow = new google.maps.InfoWindow({})
      const infoDiv=clusterClickHandler([marker],clusterInfoWindow, marker)
      expect(infoDiv).toMatchSnapshot()
    })
  })
})
