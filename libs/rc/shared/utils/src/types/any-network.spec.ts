import { AAANetwork }   from '../models/AAANetwork'
import { DpskNetwork }  from '../models/DpskNetwork'
import { GuestNetwork } from '../models/GuestNetwork'
import { NetworkVenue } from '../models/NetworkVenue'
import { OpenNetwork }  from '../models/OpenNetwork'
import { PskNetwork }   from '../models/PskNetwork'

import { AnyNetwork } from './any-network'


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