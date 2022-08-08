/* eslint-disable max-len */
import {
  clientEventDescription,
  mapCodeToReason,
  mapDisconnectCodeToReason
} from './reasonCodeMap'

describe('clientEventDescription', () => {
  it('renders text for event code', () => {
    expect(clientEventDescription('EVENT_CLIENT_DISCONNECT'))
      .toEqual('Client disconnected')
    expect(clientEventDescription('EVENT_CLIENT_INFO_UPDATED'))
      .toEqual('Client associated (802.11)')
    expect(clientEventDescription('CCD_REASON_SUCCESS'))
      .toEqual('Success')
  })
  it('renders (re)associated text if event is EVENT_CLIENT_INFO_UPDATED and state is re-associate', () => {
    expect(clientEventDescription('EVENT_CLIENT_INFO_UPDATED', 're-associate'))
      .toEqual('Client (re)associated (802.11)')
    expect(clientEventDescription('EVENT_CLIENT_ROAMING', 're-associate'))
      .toEqual('Client roamed')
  })
  it('renders event code if nothing matches', () => {
    expect(clientEventDescription('eap')).toEqual('eap')
  })
})

describe('mapCodeToReason', () => {
  it('renders text for given code', () => {
    expect(mapCodeToReason('eap'))
      .toEqual('EAP Failures')
    expect(mapCodeToReason('EVENT_CLIENT_DISCONNECT'))
      .toEqual('Client disconnected')
    expect(mapCodeToReason('EVENT_CLIENT_INFO_UPDATED'))
      .toEqual('Client associated (802.11)')
    expect(mapCodeToReason('CCD_REASON_SUCCESS'))
      .toEqual('Success')
  })
  it('renders code if nothing matches', () => {
    expect(mapCodeToReason('abc')).toEqual('abc')
  })
})

describe('mapDisconnectCodeToReason', () => {
  it('renders text for given id', () => {
    expect(mapDisconnectCodeToReason('0')).toEqual('Reserved')
    expect(mapDisconnectCodeToReason(null)).toEqual('Unknown')
    expect(mapDisconnectCodeToReason('100')).toEqual('Unknown')
  })
})
