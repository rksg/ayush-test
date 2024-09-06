import { initialSocket } from './initialSocket'

let initial: SocketIOClient.Socket | null = null

export const initializeSockets = () => {
  initial = initialSocket()
}

export const reconnectSockets = () => {
  if (initial) {
    initial.off('activityChangedEvent')
    initial.disconnect()
    initial.close()
    initial = initialSocket()
  }
}

// TODO: add socket connection for ccd and poke