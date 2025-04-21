import { getUserProfile, setUserProfile } from '@acx-ui/user'
import { onActivity, offActivity }        from '@acx-ui/utils'

import { onSocketActivityChanged } from './onSocketActivityChanged'

jest.mock('@acx-ui/utils', () => ({
  onActivity: jest.fn(),
  offActivity: jest.fn()
}))


describe('onSocketActivityChanged', () => {
  const mockHandler = jest.fn()
  const mockCacheApi = {
    cacheDataLoaded: Promise.resolve({ data: {}, meta: {} }),
    cacheEntryRemoved: Promise.resolve()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call handler when abac is disabled', async () => {
    setUserProfile({
      allowedOperations: [],
      profile: {
        ...getUserProfile().profile
      },
      abacEnabled: false
    })

    let onActivityCallback: (data: string) => void = () => {}

    (onActivity as jest.Mock).mockImplementation((fn: never) => {
      onActivityCallback = fn
    })

    await onSocketActivityChanged({}, mockCacheApi, mockHandler)

    // Trigger the callback manually
    onActivityCallback(JSON.stringify({ key: 'value' }))

    expect(mockHandler).toHaveBeenCalledWith({ key: 'value' })
    expect(offActivity).toHaveBeenCalled()
  })

  it('should not call handler when no permitted venues', async () => {

    setUserProfile({
      profile: {
        ...getUserProfile().profile
      },
      abacEnabled: true,
      rbacOpsApiEnabled: false,
      activityAllVenuesEnabled: false,
      venuesList: ['v1'],
      hasAllVenues: false,
      allowedOperations: []
    })

    let onActivityCallback: (data: string) => void = () => {}

    (onActivity as jest.Mock).mockImplementation((fn: never) => {
      onActivityCallback = fn
    })

    await onSocketActivityChanged({}, mockCacheApi, mockHandler)

    // No match with venuesList
    onActivityCallback(JSON.stringify({ scopeType: 'venues', scopeIds: ['v999'] }))

    expect(mockHandler).not.toHaveBeenCalled()
    expect(offActivity).toHaveBeenCalled()
  })

  it('should call handler when permitted venue matches', async () => {
    setUserProfile({
      profile: {
        ...getUserProfile().profile
      },
      abacEnabled: true,
      rbacOpsApiEnabled: false,
      activityAllVenuesEnabled: false,
      venuesList: ['v1'],
      hasAllVenues: false,
      allowedOperations: []
    })


    let onActivityCallback: (data: string) => void = () => {}

    (onActivity as jest.Mock).mockImplementation((fn: never) => {
      onActivityCallback = fn
    })

    await onSocketActivityChanged({}, mockCacheApi, mockHandler)

    onActivityCallback(JSON.stringify({ scopeType: 'venues', scopeIds: ['v1'] }))

    expect(mockHandler).toHaveBeenCalledWith({ scopeType: 'venues', scopeIds: ['v1'] })
    expect(offActivity).toHaveBeenCalled()
  })


  it('should call handler when rbacOpsApiEnabled and non-venues scope', async () => {
    setUserProfile({
      profile: {
        ...getUserProfile().profile
      },
      abacEnabled: true,
      rbacOpsApiEnabled: true,
      activityAllVenuesEnabled: false,
      venuesList: [],
      hasAllVenues: false,
      allowedOperations: []
    })


    let onActivityCallback: (data: string) => void = () => {}

    (onActivity as jest.Mock).mockImplementation((fn: never) => {
      onActivityCallback = fn
    })

    await onSocketActivityChanged({}, mockCacheApi, mockHandler)

    onActivityCallback(JSON.stringify({ scopeType: 'apps', scopeIds: ['a1'] }))

    expect(mockHandler).toHaveBeenCalledWith({ scopeType: 'apps', scopeIds: ['a1'] })
    expect(offActivity).toHaveBeenCalled()
  })

  it('should call handler when hasAllVenues is true', async () => {
    setUserProfile({
      profile: {
        ...getUserProfile().profile
      },
      abacEnabled: true,
      rbacOpsApiEnabled: false,
      activityAllVenuesEnabled: false,
      venuesList: [],
      hasAllVenues: true,
      allowedOperations: []
    })


    let onActivityCallback: (data: string) => void = () => {}

    (onActivity as jest.Mock).mockImplementation((fn: never) => {
      onActivityCallback = fn
    })

    await onSocketActivityChanged({}, mockCacheApi, mockHandler)

    onActivityCallback(JSON.stringify({ scopeType: 'venues', scopeIds: ['v999'] }))

    expect(mockHandler).toHaveBeenCalledWith({ scopeType: 'venues', scopeIds: ['v999'] })
    expect(offActivity).toHaveBeenCalled()
  })


  it('should call handler when activityAllVenuesEnabled is true - check all', async () => {
    setUserProfile({
      profile: {
        ...getUserProfile().profile
      },
      abacEnabled: true,
      rbacOpsApiEnabled: false,
      activityAllVenuesEnabled: true,
      venuesList: ['v1'],
      hasAllVenues: false,
      allowedOperations: []
    })


    let onActivityCallback: (data: string) => void = () => {}

    (onActivity as jest.Mock).mockImplementation((fn: never) => {
      onActivityCallback = fn
    })

    await onSocketActivityChanged({}, mockCacheApi, mockHandler)

    onActivityCallback(JSON.stringify({ scopeType: 'venues', scopeIds: ['all'] }))

    expect(mockHandler).toHaveBeenCalledWith({ scopeType: 'venues', scopeIds: ['all'] })
    expect(offActivity).toHaveBeenCalled()
  })

  it('should call handler when activityAllVenuesEnabled is true - check scopeIds', async () => {
    setUserProfile({
      profile: {
        ...getUserProfile().profile
      },
      abacEnabled: true,
      rbacOpsApiEnabled: false,
      activityAllVenuesEnabled: true,
      venuesList: ['v1'],
      hasAllVenues: false,
      allowedOperations: []
    })


    let onActivityCallback: (data: string) => void = () => {}

    (onActivity as jest.Mock).mockImplementation((fn: never) => {
      onActivityCallback = fn
    })

    await onSocketActivityChanged({}, mockCacheApi, mockHandler)

    onActivityCallback(JSON.stringify({ scopeType: 'venues', scopeIds: ['v2'] }))

    expect(mockHandler).not.toHaveBeenCalledWith({ scopeType: 'venues', scopeIds: ['v2'] })
    expect(offActivity).toHaveBeenCalled()
  })

})
