import { MomentInput } from 'moment-timezone'

import { get } from '@acx-ui/config'

import { transformDetailsResponse } from '../../IntentAIForm/services'
import { mockedIntentCRRM }         from '../__tests__/fixtures'

import { getValuesText } from './Values'

jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

jest.mock('moment-timezone', () => {
  const moment = jest.requireActual<typeof import('moment-timezone')>('moment-timezone')
  const mockedMoment =(date: MomentInput) => date
    ? moment(date)
    : moment('07-15-2023 14:15', 'MM-DD-YYYY HH:mm')
  mockedMoment.utc = moment.utc
  return {
    __esModule: true,
    ...moment,
    default: mockedMoment
  }
})

describe('getValuesText', () => {
  beforeEach(() => jest.mocked(get).mockImplementation((name: string) => ({
    IS_MLISA_SA: '',
    DRUID_RETAIN_PERIOD_DAYS: '380'
  })[name] as string))
  it('should return correct values when optimized is false', () => {
    const crrmDetails = transformDetailsResponse(mockedIntentCRRM)
    const result = getValuesText(crrmDetails, false)
    // eslint-disable-next-line max-len
    expect(result.reasonText).toEqual('AI-Driven Cloud RRM will constantly monitor the network, and adjust the channel plan when necessary to minimize co-channel interference. These changes, if any, will be indicated by the Key Performance Indicators. The number of interfering links may also fluctuate, depending on any changes in the network, configurations and/or rogue AP activities.')
    // eslint-disable-next-line max-len
    expect(result.tradeoffText).toEqual('AI-Driven Cloud RRM will be applied at the venue level, and all configurations (including static configurations) for channel and Auto Channel Selection will potentially be overwritten.')
  })
  it('should return correct values when optimized is true', () => {
    const crrmDetails = transformDetailsResponse(mockedIntentCRRM)
    const result = getValuesText(crrmDetails)
    // eslint-disable-next-line max-len
    expect(result.reasonText).toEqual('AI-Driven Cloud RRM will constantly monitor the network, and adjust the channel plan, bandwidth and AP transmit power when necessary to minimize co-channel interference. These changes, if any, will be indicated by the Key Performance Indicators. The number of interfering links may also fluctuate, depending on any changes in the network, configurations and/or rogue AP activities.')
  })
})

describe('getValuesText when IS_MLISA_SA is false', () => {
  beforeEach(() => jest.mocked(get).mockImplementation((name: string) => ({
    IS_MLISA_SA: 'false',
    DRUID_RETAIN_PERIOD_DAYS: '380'
  })[name] as string))
  it('should return correct values when optimized is false', () => {
    const crrmDetails = transformDetailsResponse(mockedIntentCRRM)
    const result = getValuesText(crrmDetails, false)
    // eslint-disable-next-line max-len
    expect(result.reasonText).toEqual('AI-Driven Cloud RRM will constantly monitor the network, and adjust the channel plan when necessary to minimize co-channel interference. These changes, if any, will be indicated by the Key Performance Indicators. The number of interfering links may also fluctuate, depending on any changes in the network, configurations and/or rogue AP activities.')
    // eslint-disable-next-line max-len
    expect(result.tradeoffText).toEqual('AI-Driven Cloud RRM will be applied at the venue level, and all configurations (including static configurations) for channel and Auto Channel Selection will potentially be overwritten.')
  })
  it('should return correct values when optimized is true', () => {
    const crrmDetails = transformDetailsResponse(mockedIntentCRRM)
    const result = getValuesText(crrmDetails)
    // eslint-disable-next-line max-len
    expect(result.reasonText).toEqual('AI-Driven Cloud RRM will constantly monitor the network, and adjust the channel plan, bandwidth and AP transmit power when necessary to minimize co-channel interference. These changes, if any, will be indicated by the Key Performance Indicators. The number of interfering links may also fluctuate, depending on any changes in the network, configurations and/or rogue AP activities.')
  })
})
