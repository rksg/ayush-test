import WS from 'jest-websocket-mock'

export const mockWebsocketServer = async (
  url: string
) => {
  const server = new WS(url)
  await server.connected
  return server
}