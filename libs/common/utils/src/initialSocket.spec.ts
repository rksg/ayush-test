
import { mockWebsocketServer } from '@acx-ui/test-utils'

import { initialSocket, websocketServerUrl } from './initialSocket'

describe('Test websocket', () => {
  it('should connect websocket correctly', async () => {
    const url = `ws://localhost${websocketServerUrl}/`
    mockWebsocketServer(url)

    const client = initialSocket()

    client.send('hello')
  })
})
