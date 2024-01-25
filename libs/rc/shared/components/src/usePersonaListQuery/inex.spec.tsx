import { rest } from 'msw'

import { useIsSplitOn }                    from '@acx-ui/feature-toggle'
import { personaApi, serviceApi }          from '@acx-ui/rc/services'
import { DpskUrls, PersonaUrls }           from '@acx-ui/rc/utils'
import { Provider, store }                 from '@acx-ui/store'
import { mockServer, renderHook, waitFor } from '@acx-ui/test-utils'

import { mockedDpskDeviceList, mockedIdentityGroupList, mockedIdentityList } from './__tests__/fixtures'

import { usePersonaListQuery } from '.'

describe('useEdgeClusterActions', () => {
  jest.mocked(useIsSplitOn).mockReturnValue(true)
  beforeEach(() => {
    store.dispatch(personaApi.util.resetApiState())
    store.dispatch(serviceApi.util.resetApiState())
    mockServer.use(
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (req, res, ctx) => {
          return res(ctx.json(mockedIdentityGroupList))
        }
      ),
      rest.post(
        PersonaUrls.searchPersonaList.url.split('?')[0],
        (req, res, ctx) => {
          return res(ctx.json(mockedIdentityList))
        }
      ),
      rest.get(
        DpskUrls.getPassphraseDevices.url,
        (req, res, ctx) => {
          return res(ctx.json(mockedDpskDeviceList))
        }
      )
    )
  })

  it('should get data correctly without personaGroupId', async () => {
    const { result } = renderHook(() => usePersonaListQuery({}), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    await waitFor(() => expect(result.current.isLoading).toBeFalsy())
    expect(result.current.data?.totalCount).toBe(5)
  })

  it('should get data correctly with personaGroupId', async () => {
    const { result } = renderHook(() => usePersonaListQuery({ personaGroupId: 'testGeoupId' }), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    await waitFor(() => expect(result.current.data?.data[2].deviceCount).toBe(1))
  })
})