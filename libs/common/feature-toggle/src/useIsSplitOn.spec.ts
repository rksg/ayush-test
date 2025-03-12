import { useTreatments } from '@splitsoftware/splitio-react'

import { renderHook } from '@acx-ui/test-utils'

import {
  REMOVABLE_TOGGLE_NAME,
  useAnySplitsOn,
  useIsSplitOn
} from './useIsSplitOn'

jest.mock('@acx-ui/utils', () => ({ useTenantId: jest.fn().mockReturnValue('tenant-1') }))
jest.mock('@splitsoftware/splitio-react', () => ({
  useTreatments: jest.fn()
}))

describe('useIsSplitOn', () => {
  it('returns flag is on/off correctly', () => {
    jest.mocked(useTreatments).mockReturnValue({
      ff1: { treatment: 'control', config: '' }
    })
    const { rerender, result } = renderHook(() => useIsSplitOn('ff1'))

    expect(result.current).toBe(false)

    jest.mocked(useTreatments).mockReturnValue({
      ff1: { treatment: 'on', config: '' }
    })

    rerender('ff1')
    expect(result.current).toBe(true)

    jest.mocked(useTreatments).mockReturnValue({
      ff1: { treatment: 'off', config: '' }
    })

    rerender('ff1')
    expect(result.current).toBe(false)
  })
})

describe('useAnySplitsOn', () => {
  it('returns flag is on/off correctly', () => {
    jest.mocked(useTreatments).mockReturnValue({
      ff1: { treatment: 'control', config: '' },
      ff2: { treatment: 'control', config: '' }
    })
    const { rerender, result } = renderHook(() => useAnySplitsOn(['ff1', 'ff2']))

    expect(result.current).toBe(null)

    jest.mocked(useTreatments).mockReturnValue({
      ff1: { treatment: 'control', config: '' },
      ff2: { treatment: 'on', config: '' }
    })

    rerender(['ff1', 'ff2'])
    expect(result.current).toBe(true)

    jest.mocked(useTreatments).mockReturnValue({
      ff1: { treatment: 'off', config: '' },
      ff2: { treatment: 'control', config: '' }
    })

    rerender(['ff1', 'ff2'])
    expect(result.current).toBe(false)
  })
  it('handle input with string instead of string[]', () => {
    jest.mocked(useTreatments).mockReturnValue({ ff1: { treatment: 'control', config: '' } })
    const { rerender, result } = renderHook(() => useAnySplitsOn('ff1'))

    expect(result.current).toBe(null)

    jest.mocked(useTreatments).mockReturnValue({ ff1: { treatment: 'on', config: '' } })
    rerender('ff1')
    expect(result.current).toBe(true)

    jest.mocked(useTreatments).mockReturnValue({ ff1: { treatment: 'off', config: '' } })
    rerender('ff1')
    expect(result.current).toBe(false)
  })

  it(`handle ${REMOVABLE_TOGGLE_NAME} correctly`, () => {
    jest.mocked(useTreatments).mockReturnValue({
      [REMOVABLE_TOGGLE_NAME]: { treatment: 'control', config: '' }
    })
    const { rerender, result } = renderHook(() => useAnySplitsOn([REMOVABLE_TOGGLE_NAME]))

    expect(result.current).toBe(true)

    jest.mocked(useTreatments).mockReturnValue({
      ff1: { treatment: 'on', config: '' }
    })

    rerender([REMOVABLE_TOGGLE_NAME])
    expect(result.current).toBe(true)

    jest.mocked(useTreatments).mockReturnValue({
      ff1: { treatment: 'off', config: '' }
    })

    rerender([REMOVABLE_TOGGLE_NAME])
    expect(result.current).toBe(true)
  })
})
