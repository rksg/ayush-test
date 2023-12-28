import { defaultNetworkPath }                                     from '@acx-ui/analytics/utils'
import { Provider, dataApiURL }                                   from '@acx-ui/store'
import { mockGraphqlQuery, renderHook, waitFor }                  from '@acx-ui/test-utils'
import { PathFilter, DateRange, NetworkPath, NodeType, PathNode } from '@acx-ui/utils'

import { networkSummaryInfo }  from './__tests__/fixtures'
import {
  getAttributes,
  getSummaryAttributes,
  genNetworkSummaryInfoQuery,
  useNetworkSummaryInfoQuery
} from './services'

const pathFilters: PathFilter = {
  startDate: '2018-11-15T17:46:25+08:00',
  endDate: '2018-11-22T17:46:25+08:00',
  range: DateRange.last24Hours,
  path: defaultNetworkPath
}

describe('getAttributes', () => {
  it('should return correct attributes for network', () => {
    expect(getAttributes({ type: 'network', name: 'network' }))
      .toEqual([ 'type', 'clientCount', 'apCount', 'switchCount' ])
  })
  it('should return correct attributes for system', () => {
    expect(getAttributes({ type: 'system', name: 'system' }))
      .toEqual([ 'cluster: clusters', 'szType: systemModels', 'firmware: controllerVersion',
        'switchCount', 'type', 'clientCount', 'apCount' ])
  })
  it('should return correct attributes for domain', () => {
    expect(getAttributes({ type: 'domain', name: 'domain' }))
      .toEqual([ 'zoneCount', 'cluster: clusters', 'switchGroupCount', 'type', 'clientCount',
        'apCount', 'switchCount' ])
  })
  it('should return correct attributes for zone', () => {
    expect(getAttributes({ type: 'zone', name: 'zone' }))
      .toEqual([ 'firmware: zoneFirmwares', 'cluster: clusters', 'type', 'clientCount', 'apCount' ])
  })
  it('should return correct attributes for apGroup', () => {
    expect(getAttributes({ type: 'apGroup', name: 'apGroup' }))
      .toEqual([ 'firmware: zoneFirmwares', 'type', 'clientCount', 'apCount' ])
  })
  it('should return correct attributes for switchGroup', () => {
    expect(getAttributes({ type: 'switchGroup', name: 'switchGroup' }))
      .toEqual([ 'switchCount' ])
  })
  it('should return correct attributes for switchSubGroup', () => {
    expect(getAttributes({ type: 'switchSubGroup', name: 'switchSubGroup' }))
      .toEqual([ 'switchCount' ])
  })
  it('should return correct attributes for switch', () => {
    expect(getAttributes({ type: 'switch', name: 'switch' }))
      .toEqual([ 'model', 'firmware', 'mac', 'portCount' ])
  })
  it('should return correct attributes for AP', () => {
    expect(getAttributes({ type: 'AP', name: 'AP' }))
      .toEqual([ 'macAddress: mac', 'model', 'ipAddress: internalIp', 'clientCount',
        'firmware: version' ])
  })
  it('should return default for for incorrect type', () => {
    expect(getAttributes({ type: 'incorrect' as NodeType, name: 'incorrect' }))
      .toEqual([ 'type', 'clientCount', 'apCount' ])
  })
  it('should return default when path is not given', () => {
    expect(getAttributes()).toEqual([ 'type', 'clientCount', 'apCount' ])
  })
})

describe('getSummaryAttributes', () => {
  it('should return correct attributes for network', () => {
    expect(getSummaryAttributes({ type: 'network', name: 'network' }))
      .toEqual([ 'apCount', 'clientCount', 'totalTraffic', 'totalApplicationCount',
        'totalActiveWlanCount' ])
  })
  it('should return correct attributes for system', () => {
    expect(getSummaryAttributes({ type: 'system', name: 'system' }))
      .toEqual([ 'apCount', 'clientCount', 'totalTraffic', 'totalApplicationCount',
        'totalActiveWlanCount' ])
  })
  it('should return correct attributes for domain', () => {
    expect(getSummaryAttributes({ type: 'domain', name: 'domain' }))
      .toEqual([ 'apCount', 'clientCount', 'totalTraffic', 'totalApplicationCount',
        'totalActiveWlanCount' ])
  })
  it('should return correct attributes for zone', () => {
    expect(getSummaryAttributes({ type: 'zone', name: 'zone' }))
      .toEqual([ 'apCount', 'clientCount', 'totalTraffic', 'totalApplicationCount',
        'totalActiveWlanCount' ])
  })
  it('should return correct attributes for apGroup', () => {
    expect(getSummaryAttributes({ type: 'apGroup', name: 'apGroup' }))
      .toEqual([ 'apCount', 'clientCount', 'totalTraffic', 'totalApplicationCount',
        'totalActiveWlanCount' ])
  })
  it('should return correct attributes for switchGroup', () => {
    expect(getSummaryAttributes({ type: 'switchGroup', name: 'switchGroup' }))
      .toEqual([ 'switchCount', 'portCount', 'connectedWiredDevices', 'poeUtilization',
        'switchTotalTraffic' ])
  })
  it('should return correct attributes for switchSubGroup', () => {
    expect(getSummaryAttributes({ type: 'switchSubGroup', name: 'switchSubGroup' }))
      .toEqual([ 'switchCount', 'portCount', 'connectedWiredDevices', 'poeUtilization',
        'switchTotalTraffic' ])
  })
  it('should return correct attributes for switch', () => {
    expect(getSummaryAttributes({ type: 'switch', name: 'switch' }))
      .toEqual([ 'portCount', 'connectedWiredDevices', 'poeUtilization', 'switchTotalTraffic' ])
  })
  it('should return correct attributes for AP', () => {
    expect(getSummaryAttributes({ type: 'AP', name: 'AP' }))
      .toEqual([ 'clientCount', 'totalTraffic', 'totalApplicationCount', 'totalActiveWlanCount' ])
  })
  it('should return default for for incorrect type', () => {
    expect(getSummaryAttributes({ type: 'incorrect' as NodeType, name: 'incorrect' }))
      .toEqual(undefined)
  })
})

describe('genNetworkSummaryInfoQuery', () => {
  it('should return correct data', () => {
    expect(genNetworkSummaryInfoQuery(pathFilters)).toMatchSnapshot()
  })
  it('shouuld return switch group data', () => {
    const drilldownFilter = {
      ...pathFilters,
      path: [
        { type: 'network', name: 'Network' },
        { type: 'system', name: 's1' },
        { type: 'domain', name: 'd1' },
        { type: 'switchGroup', name: 'sg1' }
      ] as NetworkPath
    }
    expect(genNetworkSummaryInfoQuery(drilldownFilter)).toMatchSnapshot()
  })
  it('should return switch data', () => {
    const drilldownFilter = {
      ...pathFilters,
      path: [
        { type: 'network', name: 'Network' },
        { type: 'system', name: 's1' },
        { type: 'domain', name: 'd1' },
        { type: 'switchGroup', name: 'sg1' },
        { type: 'switch', name: 's1' }
      ] as NetworkPath
    }
    expect(genNetworkSummaryInfoQuery(drilldownFilter)).toMatchSnapshot()
  })
  it('should return correct data when query ap', () => {
    const drilldownFilter = {
      ...pathFilters,
      path: [
        { type: 'network', name: 'Network' },
        { type: 'system', name: 'VectorFi' },
        { type: 'domain', name: 'Grace Christian University' },
        { type: 'zone', name: 'Grace Christian University' },
        { type: 'apGroup', name: 'default' },
        { type: 'AP', name: '58:B6:33:14:E6:80' }
      ] as NetworkPath
    }
    expect(genNetworkSummaryInfoQuery(drilldownFilter)).toMatchSnapshot()
  })
  it('should return default for for incorrect type', () => {
    const drilldownFilter = {
      ...pathFilters,
      path: [
        { type: 'network', name: 'Network' },
        { type: 'system', name: 'VectorFi' },
        { type: 'domain', name: 'Grace Christian University' },
        { type: 'zone', name: 'Grace Christian University' },
        { type: 'apGroup', name: 'default' },
        { type: 'incorrect' as PathNode['type'], name: '58:B6:33:14:E6:80' }
      ] as NetworkPath
    }
    expect(genNetworkSummaryInfoQuery(drilldownFilter)).toMatchSnapshot()
  })
})

describe('useNetworkSummaryInfoQuery', () => {
  it('should return correct data', async () => {
    const param = {
      ...pathFilters,
      startDate: '2018-11-15T17:46:25+08:00',
      endDate: '2018-11-22T17:46:25+08:00'
    }
    mockGraphqlQuery(dataApiURL, 'NetworkInfo', {
      data: { network: { node: networkSummaryInfo } } })
    const { result } = renderHook(() => useNetworkSummaryInfoQuery(param), { wrapper: Provider })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchSnapshot()
  })
  it('should return empty data', async () => {
    const param = {
      ...pathFilters,
      startDate: '2018-12-15T17:46:25+08:00',
      endDate: '2018-12-22T17:46:25+08:00'
    }
    mockGraphqlQuery(dataApiURL, 'NetworkInfo',
      { data: { network: { node: { } } } })
    const { result } = renderHook(() => useNetworkSummaryInfoQuery(param), { wrapper: Provider })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
  })
})
