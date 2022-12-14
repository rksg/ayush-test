import { useIntl } from 'react-intl'

import { renderHook } from '@acx-ui/test-utils'

import { ccdFailureTypes } from './mapping/ccdFailureTypeMap'
import { clientEvents }    from './mapping/clientEventsMap'
import {
  readCodesIntoMap,
  clientEventDescription,
  mapCodeToReason,
  mapCodeToAttempt,
  MapElement
} from './reasonCodeMap'

describe('readCodesIntoMap', () => {
  it('return correct map', () => {
    expect(readCodesIntoMap('failuresText')(ccdFailureTypes as MapElement[])).toMatchSnapshot()
    expect(readCodesIntoMap()(clientEvents as MapElement[])).toMatchSnapshot()
  })
})

describe('clientEventDescription', () => {
  it('renders text for event code', () => {
    expect(renderHook(()=> useIntl().$t(
      clientEventDescription('EVENT_CLIENT_DISCONNECT'))).result.current)
      .toEqual('Client disconnected')

    expect(renderHook(()=> useIntl().$t(
      clientEventDescription('EVENT_CLIENT_INFO_UPDATED'))).result.current)
      .toEqual('Client associated (802.11)')

    expect(renderHook(()=> useIntl().$t(
      clientEventDescription('CCD_REASON_SUCCESS'))).result.current)
      .toEqual('Success')
  })
  // eslint-disable-next-line max-len
  it('renders (re)associated text if event is EVENT_CLIENT_INFO_UPDATED and state is re-associate', () => {
    expect(renderHook(() => useIntl().$t(
      clientEventDescription('EVENT_CLIENT_INFO_UPDATED', 're-associate'))).result.current)
      .toEqual('Client (re)associated (802.11)')
    expect(renderHook(() => useIntl().$t(
      clientEventDescription('EVENT_CLIENT_ROAMING', 're-associate'))).result.current)
      .toEqual('Client roamed')
  })
  it('renders event code if nothing matches', () => {
    expect(clientEventDescription('eap')).toEqual('eap')
  })
})

describe('mapCodeToReason', () => {
  it('renders text for given code', () => {
    expect(renderHook(() => mapCodeToReason('eap', useIntl())).result.current)
      .toEqual('EAP Failures')
    expect(renderHook(() => mapCodeToReason('EVENT_CLIENT_DISCONNECT', useIntl())).result.current)
      .toEqual('Client disconnected')
    expect(renderHook(() => mapCodeToReason('EVENT_CLIENT_INFO_UPDATED', useIntl())).result.current)
      .toEqual('Client associated (802.11)')
    expect(renderHook(() => mapCodeToReason('CCD_REASON_SUCCESS', useIntl())).result.current)
      .toEqual('Success')
  })
  it('renders code if nothing matches', () => {
    expect(renderHook(() => mapCodeToReason('abc', useIntl())).result.current).toEqual('abc')
  })
})

describe('mapCodeToAttempt', () => {
  it('renders text for given code', () => {
    expect(renderHook(() => mapCodeToAttempt('eap', useIntl())).result.current)
      .toEqual('EAP Attempts')
    expect(renderHook(() => mapCodeToAttempt('assoc', useIntl())).result.current)
      .toEqual('Association Attempts')
    expect(renderHook(() => mapCodeToAttempt('auth', useIntl())).result.current)
      .toEqual('Authentication Attempts')
    expect(renderHook(() => mapCodeToAttempt('dhcp', useIntl())).result.current)
      .toEqual('DHCP Attempts')
  })
  it('renders code if nothing matches', () => {
    expect(renderHook(() => mapCodeToAttempt('test', useIntl())).result.current).toEqual('test')
  })
})
