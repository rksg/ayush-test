import { render, screen } from '@acx-ui/test-utils'

import { transformDetailsResponse } from '../../IntentAIForm/services'
import { useIntentContext }         from '../../IntentContext'
import { kpis }                     from '../common'

import {
  mockedIntentCRRM,
  mockedIntentCRRMnew
} from './__tests__/fixtures'
import { CrrmValuesExtra } from './CrrmValuesExtra'

jest.mock('../../IntentContext')

const mockIntentContextWith = (
  baseIntent: typeof mockedIntentCRRM,
  metadata: object = {}
) => {
  let intent = transformDetailsResponse(baseIntent)
  intent = { ...intent, metadata: { ...intent.metadata, ...metadata } } as typeof intent
  jest.mocked(useIntentContext).mockReturnValue({ intent, kpis })
}

describe('CrrmValuesExtra', () => {
  it('should render correctly for new crrm', async () => {
    mockIntentContextWith(mockedIntentCRRMnew)
    render(<CrrmValuesExtra />)
    expect(await screen
      .findByText(/^Based on our AI Analytics, enabling AI-Driven Cloud RRM will/)).toBeVisible()
  })
  it('should render correctly for applied crrm', async () => {
    mockIntentContextWith(mockedIntentCRRM)
    render(<CrrmValuesExtra />)
    expect(await screen
      .findByText(/^AI-Driven Cloud RRM will constantly monitor the network/)).toBeVisible()
  })
  it('should render correctly for full crrm', async () => {
    mockIntentContextWith(mockedIntentCRRM, { algorithmData: { isCrrmFullOptimization: true } })
    render(<CrrmValuesExtra />)
    expect(await screen
      .findByText(/^AI-Driven Cloud RRM will constantly monitor the network/)).toBeVisible()
    expect(await screen
      // eslint-disable-next-line max-len
      .findByText(/and adjust the channel plan, bandwidth and AP transmit power when necessary/)).toBeVisible()
  })
  it('should render correctly for partial optimized crrm', async () => {
    mockIntentContextWith(mockedIntentCRRM, { algorithmData: { isCrrmFullOptimization: false } })
    render(<CrrmValuesExtra />)
    expect(await screen
      .findByText(/^AI-Driven Cloud RRM will constantly monitor the network/)).toBeVisible()
    expect(await screen
      .findByText(/and adjust the channel plan when necessary/)).toBeVisible()
  })
})
