import React from 'react'

import { initialize, mockInstances, Autocomplete } from '@googlemaps/jest-mocks'
import { Input }                                   from 'antd'
import { rest }                                    from 'msw'

import { useIsSplitOn }                            from '@acx-ui/feature-toggle'
import { AdministrationUrlsInfo }                  from '@acx-ui/rc/utils'
import { Provider }                                from '@acx-ui/store'
import { mockServer, render, renderHook, waitFor } from '@acx-ui/test-utils'

import { usePlacesAutocomplete } from '.'

const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }
const mockedLoadAsync = jest.fn().mockImplementation(() => {
  initialize()
  return Promise.resolve()
})
jest.mock('@googlemaps/js-api-loader', () => ({
  ...jest.requireActual('@googlemaps/js-api-loader'),
  Loader: function () { return { load: mockedLoadAsync } }
}))

describe('Test usePlacesAutocomplete', () => {
  afterAll(()=>{ mockInstances.clearAll() })

  beforeEach(()=>{
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getPreferences.url,
        (_req, res, ctx) => res(ctx.json({
          global: { mapRegion: 'TW' }
        }))
      )
    )
  })

  it('usePlacesAutocomplete loader', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const { result } = renderHook(() => usePlacesAutocomplete({}), {
      wrapper: ({ children }) => <Provider children={children} />,
      route: { params }
    })
    render(<Input ref={result.current.ref}/>)

    await waitFor(() => expect(mockInstances.get(Autocomplete)).toHaveLength(1))
  })

  it('usePlacesAutocomplete with Features', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    initialize()

    const onPlaceSelected = jest.fn()
    const { result, rerender } = renderHook(() => usePlacesAutocomplete({
      onPlaceSelected
    }), {
      wrapper: ({ children }) => <Provider children={children} />,
      route: { params }
    })

    render(<Input ref={result.current.ref}/>)

    jest.mocked(useIsSplitOn).mockReturnValue(true)
    rerender()

    expect(mockInstances.get(Autocomplete)).toHaveLength(1)
    // TODO: expect(onPlaceSelected).toBeCalled()
  })
})
