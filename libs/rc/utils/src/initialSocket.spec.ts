import { mockWebsocketServer } from '@acx-ui/test-utils'

import { initialSocket } from './initialSocket'

import { websocketServerUrl } from '.'

jest.unmock('socket.io-client')

describe('Test websocket', () => {
  it('should connect websocket correctly', async () => {
    const url = `ws://localhost${websocketServerUrl}/`
    mockWebsocketServer(url)

    const client = initialSocket(`${url}?tenantId=tenant-id&EIO=3&transport=websocket`)

    client.send('hello')
  })
})
