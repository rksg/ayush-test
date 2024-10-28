import { cloneDeep, set } from 'lodash'

import { EdgeMdnsFixtures } from '../edge/__tests__/fixtures'

import { edgeMdnsFormRequestPreProcess } from './edgeMdnsProxyUtils'

const { mockEdgeMdnsViewDataList } = EdgeMdnsFixtures

describe('edgeMdnsFormRequestPreProcess', () => {
  it('correctly transform', () => {
    const result = edgeMdnsFormRequestPreProcess(mockEdgeMdnsViewDataList[0])
    expect(result).toStrictEqual({
      name: 'edge-mdns-proxy-name-1',
      forwardingRules: [
        {
          ruleIndex: 0,
          serviceType: 'APPLETV',
          fromVlan: 10,
          toVlan: 200
        },
        {
          ruleIndex: 1,
          serviceType: 'AIRPRINT',
          fromVlan: 33,
          toVlan: 66
        },
        {
          ruleIndex: 2,
          serviceType: 'OTHER',
          mdnsName: 'testCXCX',
          mdnsProtocol: 'TCP',
          fromVlan: 5,
          toVlan: 120
        }
      ]
    })
  })

  it('correctly return empty array when rule is undefined', () => {
    const testData = cloneDeep(mockEdgeMdnsViewDataList[0])
    set(testData, 'forwardingRules', undefined)
    const result = edgeMdnsFormRequestPreProcess(testData)
    expect(result).toStrictEqual({
      name: 'edge-mdns-proxy-name-1',
      forwardingRules: []
    })
  })
})