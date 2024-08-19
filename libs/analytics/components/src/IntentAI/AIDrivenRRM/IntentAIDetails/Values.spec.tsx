import { get }        from '@acx-ui/config'
import { renderHook } from '@acx-ui/test-utils'

import { transformDetailsResponse } from '../../IntentAIForm/services'
import { useIntentContext }         from '../../IntentContext'
import { kpis }                     from '../common'

import { mockedIntentCRRM } from './__tests__/fixtures'
import { useValuesText }    from './Values'

jest.mock('../../IntentContext')
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

const mockIntentContextWith = (metadata: object = {}) => {
  let intent = transformDetailsResponse(mockedIntentCRRM)
  intent = { ...intent, metadata: { ...intent.metadata, ...metadata } } as typeof intent
  jest.mocked(useIntentContext).mockReturnValue({ intent, kpis })
}

beforeEach(() => jest.spyOn(Date, 'now')
  .mockReturnValue(+new Date('2023-07-15T14:15:00.000Z')))

describe('useValuesText', () => {
  beforeEach(() => jest.mocked(get).mockImplementation((name: string) => ({
    IS_MLISA_SA: 'true',
    DRUID_RETAIN_PERIOD_DAYS: '380'
  })[name] as string))
  it('should return correct values when optimized is false', () => {
    mockIntentContextWith({ algorithmData: { isCrrmFullOptimization: false } })
    const { result } = renderHook(() => useValuesText())
    // eslint-disable-next-line max-len
    expect(result.current.reasonText).toEqual('AI-Driven Cloud RRM will constantly monitor the network, and adjust the channel plan when necessary to minimize co-channel interference. These changes, if any, will be indicated by the Key Performance Indicators. The number of interfering links may also fluctuate, depending on any changes in the network, configurations and/or rogue AP activities.')
    // eslint-disable-next-line max-len
    expect(result.current.tradeoffText).toEqual('AI-Driven Cloud RRM will be applied at the venue level, and all configurations (including static configurations) for channel and Auto Channel Selection will potentially be overwritten.')
  })
  it('should return correct values when optimized is true', () => {
    mockIntentContextWith({ algorithmData: { isCrrmFullOptimization: true } })
    const { result } = renderHook(() => useValuesText())
    // eslint-disable-next-line max-len
    expect(result.current.reasonText).toEqual('AI-Driven Cloud RRM will constantly monitor the network, and adjust the channel plan, bandwidth and AP transmit power when necessary to minimize co-channel interference. These changes, if any, will be indicated by the Key Performance Indicators. The number of interfering links may also fluctuate, depending on any changes in the network, configurations and/or rogue AP activities.')
  })
})

describe('useValuesText when IS_MLISA_SA not set', () => {
  beforeEach(() => jest.mocked(get).mockImplementation((name: string) => ({
    IS_MLISA_SA: '',
    DRUID_RETAIN_PERIOD_DAYS: '380'
  })[name] as string))
  it('should return correct values when optimized is false', () => {
    mockIntentContextWith({ algorithmData: { isCrrmFullOptimization: false } })
    const { result } = renderHook(() => useValuesText())
    // eslint-disable-next-line max-len
    expect(result.current.reasonText).toEqual('AI-Driven Cloud RRM will constantly monitor the network, and adjust the channel plan when necessary to minimize co-channel interference. These changes, if any, will be indicated by the Key Performance Indicators. The number of interfering links may also fluctuate, depending on any changes in the network, configurations and/or rogue AP activities.')
    // eslint-disable-next-line max-len
    expect(result.current.tradeoffText).toEqual('AI-Driven Cloud RRM will be applied at the venue level, and all configurations (including static configurations) for channel and Auto Channel Selection will potentially be overwritten.')
  })
  it('should return correct values when optimized is true', () => {
    mockIntentContextWith({ algorithmData: { isCrrmFullOptimization: true } })
    const { result } = renderHook(() => useValuesText())
    // eslint-disable-next-line max-len
    expect(result.current.reasonText).toEqual('AI-Driven Cloud RRM will constantly monitor the network, and adjust the channel plan, bandwidth and AP transmit power when necessary to minimize co-channel interference. These changes, if any, will be indicated by the Key Performance Indicators. The number of interfering links may also fluctuate, depending on any changes in the network, configurations and/or rogue AP activities.')
  })
})
