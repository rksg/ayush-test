import '@testing-library/jest-dom'

import { store, dataApiURL } from '@acx-ui/store'
import { mockGraphqlQuery }  from '@acx-ui/test-utils'
import { NetworkPath }       from '@acx-ui/utils'

import { apDetailsFixture, switchDetailsFixture } from './__tests__/fixtures'
import {
  detailsApi
} from './detailsApi'

describe('Details API', () => {

  beforeEach(() => {
    store.dispatch(detailsApi.util.resetApiState())
  })

  it('AP details api should return the data', async () => {
    mockGraphqlQuery(dataApiURL, 'APDetails', {
      data: apDetailsFixture
    })
    const path: NetworkPath = [{ name: 'Network', type: 'network' }]
    const payload = {
      startDate: '2023-04-06T15:26:21+05:30',
      endDate: '2023-04-06T15:29:48+05:30',
      path,
      mac: '18:B4:30:05:1C:BE'
    }
    const { status, data, error } = await store.dispatch(
      detailsApi.endpoints.apDetails.initiate(payload))

    expect(error).toBeUndefined()
    expect(status).toBe('fulfilled')
    expect(data).toMatchObject(apDetailsFixture.network.ap)
  })

  it('Switch details api should return the data', async () => {
    mockGraphqlQuery(dataApiURL, 'SwitchDetails', {
      data: switchDetailsFixture
    })
    const path: NetworkPath = [{ name: 'Network', type: 'network' }]
    const payload = {
      startDate: '2023-04-06T15:26:21+05:30',
      endDate: '2023-04-06T15:29:48+05:30',
      path,
      mac: '18:B4:30:05:1C:CE'
    }
    const { status, data, error } = await store.dispatch(
      detailsApi.endpoints.switchDetails.initiate(payload))

    expect(error).toBeUndefined()
    expect(status).toBe('fulfilled')
    expect(data).toMatchObject(switchDetailsFixture.network.switch)
  })
})
