import { AAAWlanAdvancedCustomization }  from './models/AAAWlanAdvancedCustomization'
import { DpskWlanAdvancedCustomization } from './models/DpskWlanAdvancedCustomization'
import { NetworkVenue }                  from './models/NetworkVenue'
import { OpenNetwork }                   from './models/OpenNetwork'
import { PskWlanAdvancedCustomization }  from './models/PskWlanAdvancedCustomization'

describe('Test Any Network model type', () => {
  it('should initialize Open Network model correctly', async () => {
    const openNetwork = new OpenNetwork()
    openNetwork.name = 'test'
  })
  it('should initialize Network Venue model correctly', async () => {
    const networkVenue = new NetworkVenue()
    networkVenue.id = 'test-id'
  })
  it('should initialize AAAWlanAdvancedCustomization model correctly', async () => {
    const aaaWlan = new AAAWlanAdvancedCustomization()
    aaaWlan.hideSsid = false
  })
  it('should initialize DpskWlanAdvancedCustomization model correctly', async () => {
    const apskWlan = new DpskWlanAdvancedCustomization()
    apskWlan.hideSsid = false
  })
  it('should initialize PskWlanAdvancedCustomization model correctly', async () => {
    const pskWlan = new PskWlanAdvancedCustomization()
    pskWlan.hideSsid = false
  })
})