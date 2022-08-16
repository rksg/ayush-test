import { AnyNetwork }   from './any-network'
import { AAANetwork }   from './wifi/AAANetwork'
import { DpskNetwork }  from './wifi/DpskNetwork'
import { GuestNetwork } from './wifi/GuestNetwork'
import { NetworkVenue } from './wifi/NetworkVenue'
import { OpenNetwork }  from './wifi/OpenNetwork'
import { PskNetwork }   from './wifi/PskNetwork'


describe('Test Any Network model type', () => {
  it('should initialize Any Network model correctly', async () => {
    const anyNetwork = new AnyNetwork()
    anyNetwork.name = 'test'
  })
  it('should initialize AAA Network model correctly', async () => {
    const aaaNetwork = new AAANetwork()
    aaaNetwork.name = 'test'
  })
  it('should initialize Guest Network model correctly', async () => {
    const guestNetwork = new GuestNetwork()
    guestNetwork.name = 'test'
  })
  it('should initialize DPSK Network model correctly', async () => {
    const dpskNetwork = new DpskNetwork()
    dpskNetwork.name = 'test'
  })
  it('should initialize Open Network model correctly', async () => {
    const openNetwork = new OpenNetwork()
    openNetwork.name = 'test'
  })
  it('should initialize Psk Network model correctly', async () => {
    const pskNetwork = new PskNetwork()
    pskNetwork.name = 'test'
  })
  it('should initialize Network Venue model correctly', async () => {
    const networkVenue = new NetworkVenue()
    networkVenue.id = 'test-id'
  })
})