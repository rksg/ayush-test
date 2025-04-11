import userEvent                      from '@testing-library/user-event'
import { cloneDeep, groupBy, remove } from 'lodash'

import { EdgeMvSdLanFormNetwork, EdgeSdLanFixtures, EdgeSdLanTunneledWlan } from '@acx-ui/rc/utils'
import { screen }                                                           from '@acx-ui/test-utils'

import { showSdLanGuestFwdConflictModal } from '.'

const { click } = userEvent

const { mockedMvSdLanDataList } = EdgeSdLanFixtures

const mockedDmzSdLanNoGuestFwd= cloneDeep(mockedMvSdLanDataList[0])
mockedDmzSdLanNoGuestFwd.tunneledGuestWlans = []
const mockedDmzSdLanGuestFwded= cloneDeep(mockedMvSdLanDataList[1])
mockedDmzSdLanGuestFwded.isGuestTunnelEnabled = true
const venue1network4 = mockedDmzSdLanNoGuestFwd.tunneledWlans![1]
const venue2Network2 = mockedDmzSdLanGuestFwded.tunneledGuestWlans![0]

// eslint-disable-next-line max-len
const getEdgeMvSdLanFormNetworkFormat = (tunneledWlans: EdgeSdLanTunneledWlan[] | undefined): EdgeMvSdLanFormNetwork => {
  const activatedNetworks: EdgeMvSdLanFormNetwork = {}
  Object.entries(groupBy(tunneledWlans, 'venueId'))
    .forEach(([venueId, tunneledWlans]) => {
      // eslint-disable-next-line max-len
      activatedNetworks[venueId] = tunneledWlans.map(w => ({ id: w.networkId, name: w.networkName }))
    })
  return activatedNetworks
}

const mockOkFn = jest.fn()
describe('Edge SD-LAN showSdLanGuestFwdConflictModal - EdgeSdLanTunneledWlan', () => {
  beforeEach(() => {
    mockOkFn.mockReset()
  })

  describe('activate', () => {
    const mockedSdLanNoGuestFwd = cloneDeep(mockedDmzSdLanNoGuestFwd)

    // different venut same network
    const anotherVenueNetwork = {
      venueId: 'a307d7077410456f8f1a4fc41d861560',
      venueName: 'Mocked-Venue-2',
      networkId: 'network_4',
      networkName: 'Mocked_network_4',
      wlanId: '1'
    }

    const currentNetworkId = venue1network4.networkId
    const currentNetworkVenueId = venue1network4.venueId
    const defaultArgs = {
      currentNetworkVenueId,
      currentNetworkId,
      activatedGuest: true,
      onOk: mockOkFn
    }

    it('should have 1 impact', async () => {
      const mockData = cloneDeep(mockedSdLanNoGuestFwd)
      mockData.tunneledWlans?.push(anotherVenueNetwork)

      showSdLanGuestFwdConflictModal({
        ...defaultArgs,
        tunneledWlans: mockData.tunneledWlans,
        tunneledGuestWlans: mockData.tunneledGuestWlans
      })

      const networkName = await screen.findByText(/Mocked_network_4/)
      // eslint-disable-next-line testing-library/no-node-access
      expect(networkName.parentElement!).toHaveTextContent(/affect 1 associated venue/)
      await click(screen.getByRole('button', { name: 'Continue' }))
      expect(mockOkFn).toBeCalledWith([anotherVenueNetwork.venueId])
    })

    it('should have multiple impacts', async () => {
      const mockData = cloneDeep(mockedSdLanNoGuestFwd)
      const otherNetworks = [
        anotherVenueNetwork,
        {
          ...anotherVenueNetwork,
          venueId: 'a307d7077410456f8f1a4fc41d861564',
          venueName: 'Mocked-Venue-4'
        }]
      mockData.tunneledWlans!.push(...otherNetworks)

      showSdLanGuestFwdConflictModal({
        ...defaultArgs,
        tunneledWlans: mockData.tunneledWlans,
        tunneledGuestWlans: mockData.tunneledGuestWlans
      })

      const networkName = await screen.findByText(/Mocked_network_4/)
      // eslint-disable-next-line testing-library/no-node-access
      expect(networkName.parentElement!).toHaveTextContent(/affect 2 associated venues/)
      await click(screen.getByRole('button', { name: 'Continue' }))
      expect(mockOkFn).toBeCalledWith(otherNetworks.map(n => n.venueId))
    })

    it('should not have impact when other venue network is already activated', async () => {
      const mockData = cloneDeep(mockedSdLanNoGuestFwd)
      mockData.tunneledWlans?.push(anotherVenueNetwork)
      mockData.tunneledGuestWlans?.push(anotherVenueNetwork)

      showSdLanGuestFwdConflictModal({
        ...defaultArgs,
        tunneledWlans: mockData.tunneledWlans,
        tunneledGuestWlans: mockData.tunneledGuestWlans
      })

      expect(screen.queryByRole('dialog')).toBeNull()
      expect(mockOkFn).toBeCalledTimes(1)
      expect(mockOkFn).toBeCalledWith([])
    })
  })

  describe('deactivate', () => {
    const mockedSdLanMultiGuestFwd = cloneDeep(mockedDmzSdLanGuestFwded)
    const otherNetworks = [{
      ...venue2Network2,
      venueId: 'a307d7077410456f8f1a4fc41d861567',
      venueName: 'Mocked-Venue-1'
    }, {
      ...venue2Network2,
      venueId: 'a307d7077410456f8f1a4fc41d861565',
      venueName: 'Mocked-Venue-3'
    }]
    mockedSdLanMultiGuestFwd.tunneledWlans!.push(...otherNetworks)
    mockedSdLanMultiGuestFwd.tunneledGuestWlans!.push(...otherNetworks)

    const currentNetworkId = venue2Network2.networkId
    const currentNetworkVenueId = venue2Network2.venueId
    const defaultArgs = {
      currentNetworkVenueId,
      currentNetworkId,
      activatedGuest: false,
      onOk: mockOkFn
    }
    it('should have 1 impact', async () => {
      const mockData = cloneDeep(mockedSdLanMultiGuestFwd)
      mockData.tunneledWlans!.pop()
      mockData.tunneledGuestWlans!.pop()

      showSdLanGuestFwdConflictModal({
        ...defaultArgs,
        tunneledWlans: mockData.tunneledWlans,
        tunneledGuestWlans: mockData.tunneledGuestWlans
      })

      const networkName = await screen.findByText(/Mocked_network_2/)
      // eslint-disable-next-line testing-library/no-node-access
      expect(networkName.parentElement!).toHaveTextContent(/affect 1 associated venue/)
      await click(screen.getByRole('button', { name: 'Continue' }))
      expect(mockOkFn).toBeCalledWith([mockData.tunneledGuestWlans![1].venueId])
    })

    it('should have multiple impacts', async () => {
      showSdLanGuestFwdConflictModal({
        ...defaultArgs,
        tunneledWlans: mockedSdLanMultiGuestFwd.tunneledWlans,
        tunneledGuestWlans: mockedSdLanMultiGuestFwd.tunneledGuestWlans
      })

      const networkName = await screen.findByText(/Mocked_network_2/)
      // eslint-disable-next-line testing-library/no-node-access
      expect(networkName.parentElement!).toHaveTextContent(/affect 2 associated venues/)
      await click(screen.getByRole('button', { name: 'Continue' }))
      expect(mockOkFn).toBeCalledWith(otherNetworks.map(n => n.venueId))
    })

    it('should not have impact when other venue network is already deactivated', async () => {
      const mockData = cloneDeep(mockedSdLanMultiGuestFwd)
      // eslint-disable-next-line max-len
      remove(mockData.tunneledWlans!, (item) => item.venueId !== defaultArgs.currentNetworkVenueId && item.networkId === defaultArgs.currentNetworkId)
      // eslint-disable-next-line max-len
      remove(mockData.tunneledGuestWlans!, (item) => item.venueId !== defaultArgs.currentNetworkVenueId && item.networkId === defaultArgs.currentNetworkId)

      showSdLanGuestFwdConflictModal({
        ...defaultArgs,
        tunneledWlans: mockData.tunneledWlans,
        tunneledGuestWlans: mockData.tunneledGuestWlans
      })

      expect(screen.queryByRole('dialog')).toBeNull()
      expect(mockOkFn).toBeCalledTimes(1)
      expect(mockOkFn).toBeCalledWith([])
    })
  })

  it('should dothing when impact is 0', async () => {
    const currentNetworkId = venue1network4.networkId
    const currentNetworkVenueId = venue1network4.venueId

    showSdLanGuestFwdConflictModal({
      currentNetworkVenueId,
      currentNetworkId,
      activatedDmz: true,
      tunneledWlans: mockedDmzSdLanNoGuestFwd.tunneledWlans,
      tunneledGuestWlans: mockedDmzSdLanNoGuestFwd.tunneledGuestWlans,
      onOk: mockOkFn
    })

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(mockOkFn).toBeCalledTimes(1)
    expect(mockOkFn).toBeCalledWith([])
  })
})

describe('Edge SD-LAN showSdLanGuestFwdConflictModal - EdgeMvSdLanFormNetwork', () => {
  beforeEach(() => {
    mockOkFn.mockReset()
  })

  describe('activate', () => {
    const mockedSdLan= mockedDmzSdLanNoGuestFwd
    const currentNetworkId = venue1network4.networkId
    const currentNetworkVenueId = venue1network4.venueId

    const activatedNetworks = getEdgeMvSdLanFormNetworkFormat(mockedSdLan.tunneledWlans)
    const activatedGuestNetworks = getEdgeMvSdLanFormNetworkFormat(mockedSdLan.tunneledGuestWlans)

    // venue2 same network
    const anotherVenueNetwork = {
      venueId: 'a307d7077410456f8f1a4fc41d861560',
      networkId: currentNetworkId,
      networkName: venue1network4.networkName
    }

    const defaultArgs = {
      currentNetworkVenueId,
      currentNetworkId,
      activatedGuest: true,
      onOk: mockOkFn
    }

    it('should have 1 impact', async () => {
      const mockActivatedNetworks = cloneDeep(activatedNetworks)
      mockActivatedNetworks[anotherVenueNetwork.venueId] = [{
        id: anotherVenueNetwork.networkId,
        name: anotherVenueNetwork.networkName
      }]

      // another diff network on diff venue
      mockActivatedNetworks['mocked_v_1'] = [{
        id: 'another_network_1',
        name: 'another_network_1'
      }]

      // eslint-disable-next-line max-len
      showSdLanGuestFwdConflictModal({
        ...defaultArgs,
        tunneledWlans: mockActivatedNetworks,
        tunneledGuestWlans: activatedGuestNetworks
      })

      const networkName = await screen.findByText(/Mocked_network_4/)
      // eslint-disable-next-line testing-library/no-node-access
      expect(networkName.parentElement!).toHaveTextContent(/affect 1 associated venue/)
      await click(screen.getByRole('button', { name: 'Continue' }))
      expect(mockOkFn).toBeCalledWith([anotherVenueNetwork.venueId])
    })

    it('should have multiple impacts', async () => {
      const mockActivatedNetworks = cloneDeep(activatedNetworks)
      const otherNetworks = [
        anotherVenueNetwork,
        {
          ...anotherVenueNetwork,
          venueId: 'a307d7077410456f8f1a4fc41d861564',
          venueName: 'Mocked-Venue-4'
        }]
      otherNetworks.forEach(n => {
        mockActivatedNetworks[n.venueId] = [{
          id: anotherVenueNetwork.networkId,
          name: anotherVenueNetwork.networkName
        }]
      })

      showSdLanGuestFwdConflictModal({
        ...defaultArgs,
        tunneledWlans: mockActivatedNetworks,
        tunneledGuestWlans: activatedGuestNetworks
      })

      const networkName = await screen.findByText(/Mocked_network_4/)
      // eslint-disable-next-line testing-library/no-node-access
      expect(networkName.parentElement!).toHaveTextContent(/affect 2 associated venues/)
      await click(screen.getByRole('button', { name: 'Continue' }))
      expect(mockOkFn).toBeCalledWith(otherNetworks.map(n => n.venueId))
    })

    it('should not have impact when other venue network is already activated', async () => {
      const mockActivatedNetworks = cloneDeep(activatedNetworks)
      mockActivatedNetworks[anotherVenueNetwork.venueId] = [{
        id: anotherVenueNetwork.networkId,
        name: anotherVenueNetwork.networkName
      }]

      const mockActivatedGuestNetworks = cloneDeep(activatedGuestNetworks)
      mockActivatedGuestNetworks[anotherVenueNetwork.venueId] = [{
        id: anotherVenueNetwork.networkId,
        name: anotherVenueNetwork.networkName
      }]
      // eslint-disable-next-line max-len
      showSdLanGuestFwdConflictModal({
        ...defaultArgs,
        tunneledWlans: mockActivatedNetworks,
        tunneledGuestWlans: mockActivatedGuestNetworks
      })

      expect(screen.queryByRole('dialog')).toBeNull()
      expect(mockOkFn).toBeCalledTimes(1)
      expect(mockOkFn).toBeCalledWith([])
    })
  })

  describe('deactivate', () => {
    const mockedSdLan = cloneDeep(mockedDmzSdLanGuestFwded)
    const currentNetworkId = venue2Network2.networkId
    const currentNetworkVenueId = venue2Network2.venueId

    const activatedNetworks = getEdgeMvSdLanFormNetworkFormat(mockedSdLan.tunneledWlans)
    const activatedGuestNetworks = getEdgeMvSdLanFormNetworkFormat(mockedSdLan.tunneledGuestWlans)

    const otherNetworks = [{
      ...venue2Network2,
      venueId: 'a307d7077410456f8f1a4fc41d861567',
      venueName: 'Mocked-Venue-1'
    }, {
      ...venue2Network2,
      venueId: 'a307d7077410456f8f1a4fc41d861565',
      venueName: 'Mocked-Venue-3'
    }]

    otherNetworks.forEach(n => {
      activatedNetworks[n.venueId] = [{
        id: currentNetworkId,
        name: venue2Network2.networkName
      }]

      activatedGuestNetworks[n.venueId] = [{
        id: currentNetworkId,
        name: venue2Network2.networkName
      }]
    })

    const defaultArgs = {
      currentNetworkVenueId,
      currentNetworkId,
      activatedGuest: false,
      onOk: mockOkFn
    }

    it('should have 1 impact', async () => {
      // remove the last data of otherNetworks
      const mockActivatedNetworks = cloneDeep(activatedNetworks)
      const mockActivatedGuestNetworks = cloneDeep(activatedGuestNetworks)
      delete mockActivatedNetworks[otherNetworks[1].venueId]
      delete mockActivatedGuestNetworks[otherNetworks[1].venueId]

      showSdLanGuestFwdConflictModal({
        ...defaultArgs,
        tunneledWlans: mockActivatedNetworks,
        tunneledGuestWlans: mockActivatedGuestNetworks
      })

      const networkName = await screen.findByText(/Mocked_network_2/)
      // eslint-disable-next-line testing-library/no-node-access
      expect(networkName.parentElement!).toHaveTextContent(/affect 1 associated venue/)
      await click(screen.getByRole('button', { name: 'Continue' }))
      expect(mockOkFn).toBeCalledWith([otherNetworks[0].venueId])
    })

    it('should have multiple impact', async () => {
      showSdLanGuestFwdConflictModal({
        ...defaultArgs,
        tunneledWlans: activatedNetworks,
        tunneledGuestWlans: activatedGuestNetworks
      })

      const networkName = await screen.findByText(/Mocked_network_2/)
      // eslint-disable-next-line testing-library/no-node-access
      expect(networkName.parentElement!).toHaveTextContent(/affect 2 associated venues/)
      await click(screen.getByRole('button', { name: 'Continue' }))
      expect(mockOkFn).toBeCalledWith([otherNetworks[1].venueId, otherNetworks[0].venueId])
    })

    it('should not have impact when other venue network is already deactivated', async () => {
      const mockActivatedGuestNetworks = cloneDeep(activatedGuestNetworks)
      otherNetworks.forEach(n => {
        delete mockActivatedGuestNetworks[n.venueId]
      })

      showSdLanGuestFwdConflictModal({
        ...defaultArgs,
        tunneledWlans: activatedNetworks,
        tunneledGuestWlans: mockActivatedGuestNetworks
      })

      expect(screen.queryByRole('dialog')).toBeNull()
      expect(mockOkFn).toBeCalledTimes(1)
      expect(mockOkFn).toBeCalledWith([])
    })
  })

  it('should dothing when impact is 0', async () => {
    const mockedSdLan = mockedDmzSdLanNoGuestFwd
    const currentNetworkId = venue1network4.networkId
    const currentNetworkVenueId = venue1network4.venueId
    const activatedNetworks = getEdgeMvSdLanFormNetworkFormat(mockedSdLan.tunneledWlans)
    const activatedGuestNetworks = getEdgeMvSdLanFormNetworkFormat(mockedSdLan.tunneledGuestWlans)

    showSdLanGuestFwdConflictModal({
      currentNetworkVenueId,
      currentNetworkId,
      activatedDmz: false,
      tunneledWlans: activatedNetworks,
      tunneledGuestWlans: activatedGuestNetworks,
      onOk: mockOkFn
    })

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(mockOkFn).toBeCalledTimes(1)
    expect(mockOkFn).toBeCalledWith([])
  })
})