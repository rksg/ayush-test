export const doRunResponse = {
  requestId: '1047d650-e527-4d46-a7d3-8b7875fba6fc',
  response: {}
}

export const troubleshootingResult_ping_isSyncing = {
  requestId: 'd674eda1-1ced-4d18-9041-fdfa7fda606e',
  response: {
    latestResultResponseTime: '2023-01-09T03:27:22.095+00:00',
    pingIp: '1.1.1.1',
    traceRouteTtl: 0,
    syncing: true,
    troubleshootingType: 'ping'
  }
}

export const troubleshootingResult_ping_result = {
  requestId: '3d618952-4c53-4a81-a1a7-7d0f9b5e56fe',
  response: {
    latestResultResponseTime: '2023-01-09T03:39:04.114+00:00',
    // eslint-disable-next-line max-len
    result: 'Sending 5, 16-byte ICMP Echo to 1.1.1.1, timeout 5000 msec, TTL 64\nType Control-c to abort\nReply from 1.1.1.1 : bytes=16 time=2ms TTL=58\nReply from 1.1.1.1 : bytes=16 time=1ms TTL=58\nReply from 1.1.1.1 : bytes=16 time=2ms TTL=58\nReply from 1.1.1.1 : bytes=16 time=1ms TTL=58\nReply from 1.1.1.1 : bytes=16 time=2ms TTL=58\nSuccess rate is 100 percent (5/5), round-trip min/avg/max=1/1/2 ms.\n',
    pingIp: '1.1.1.1',
    traceRouteTtl: 0,
    syncing: false,
    troubleshootingType: 'ping'
  }
}

export const troubleshootingResult_ping_emptyResult = {
  requestId: '3d618952-4c53-4a81-a1a7-7d0f9b5e56fe',
  response: {
    latestResultResponseTime: '2023-01-09T03:39:04.114+00:00',
    result: 'EMPTY_RESULT',
    pingIp: '1.1.1.1',
    traceRouteTtl: 0,
    syncing: false,
    troubleshootingType: 'ping'
  }
}

export const troubleshootingResult_ping_empty = {
  requestId: '3875b3ad-eda1-470a-9a94-90f259907317',
  response: {
    traceRouteTtl: 0,
    syncing: false,
    troubleshootingType: 'ping'
  }
}
