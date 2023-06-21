import React from 'react'

import { initialize } from '@googlemaps/jest-mocks'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import { Provider }     from '@acx-ui/store'
import { renderHook }   from '@acx-ui/test-utils'

import { usePlacesAutocomplete } from '.'

describe('Test usePlacesAutocomplete', () => {
  jest.mocked(useIsSplitOn).mockReturnValue(true)
  initialize()
  it('usePlacesAutocomplete', async () => {
    const onPlaceSelected = jest.fn()
    const { result } = renderHook(() => usePlacesAutocomplete({
      onPlaceSelected
    }), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    expect(result.current).not.toBeNull()
    // TODO: expect(onPlaceSelected).toBeCalled()
  })
})
