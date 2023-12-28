import { useIsSplitOn } from '@acx-ui/feature-toggle'
import { renderHook }   from '@acx-ui/test-utils'

import { useDpskNewConfigFlowParams } from '.'

describe('useDpskNewConfigFlowParams', () => {
  it('should render the correct http request params', () => {
    const { result: result1 } = renderHook(() => {
      return useDpskNewConfigFlowParams()
    })

    expect(result1.current).toEqual(expect.objectContaining({
      isNewConfigFlow: 'n'
    }))

    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const { result: result2 } = renderHook(() => {
      return useDpskNewConfigFlowParams()
    })

    expect(result2.current).toEqual(expect.objectContaining({
      isNewConfigFlow: 'y'
    }))
  })
})
