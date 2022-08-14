import { useIntl } from 'react-intl'

import { renderHook } from '@acx-ui/test-utils'

import { ccdFailureTypes } from './mapping/ccdFailureTypeMap'
import {
  readCodesIntoMap,
  getFailureLabels,
  getCcdReasonCodeMap,
  getClientEventsMap,
  clientEventDescription,
  mapCodeToReason

} from './reasonCodeMap'

describe('readCodesIntoMap', () => {
  it('return correct map', () => {
    expect(renderHook(() => readCodesIntoMap(useIntl(), ccdFailureTypes)).result.current)
      .toMatchSnapshot()
  })
})

describe('getFailureLabels', () => {
  it('return correct map', () => {
    expect(renderHook(() => getFailureLabels(useIntl())).result.current).toMatchSnapshot()
  })
})

describe('getCcdReasonCodeMap', () => {
  it('return correct map', () => {
    expect(renderHook(() => getCcdReasonCodeMap(useIntl())).result.current).toMatchSnapshot()
  })
})

describe('getClientEventsMap', () => {
  it('return correct map', () => {
    expect(renderHook(() => getClientEventsMap(useIntl())).result.current).toMatchSnapshot()
  })
})

describe('clientEventDescription', () => {
  it('renders text for event code', () => {
    expect(renderHook(() =>
      clientEventDescription(useIntl(), 'EVENT_CLIENT_DISCONNECT')).result.current)
      .toEqual('Client disconnected')
    expect(renderHook(() =>
      clientEventDescription(useIntl(), 'EVENT_CLIENT_INFO_UPDATED')).result.current)
      .toEqual('Client associated (802.11)')
    expect(renderHook(() =>
      clientEventDescription(useIntl(), 'CCD_REASON_SUCCESS')).result.current)
      .toEqual('Success')
  })
  // eslint-disable-next-line max-len
  it('renders (re)associated text if event is EVENT_CLIENT_INFO_UPDATED and state is re-associate', () => {
    expect(renderHook(() => clientEventDescription(
      useIntl(), 'EVENT_CLIENT_INFO_UPDATED', 're-associate')).result.current)
      .toEqual('Client (re)associated (802.11)')
    expect(renderHook(() => clientEventDescription(
      useIntl(), 'EVENT_CLIENT_ROAMING', 're-associate')).result.current)
      .toEqual('Client roamed')
  })
  it('renders event code if nothing matches', () => {
    expect(renderHook(() => clientEventDescription(useIntl(), 'eap')).result.current).toEqual('eap')
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
