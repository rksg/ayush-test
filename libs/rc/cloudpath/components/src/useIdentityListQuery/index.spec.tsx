import { rest } from 'msw'

import { useIsSplitOn }                           from '@acx-ui/feature-toggle'
import { personaApi, policyApi, serviceApi }      from '@acx-ui/rc/services'
import { CertificateUrls, DpskUrls, PersonaUrls } from '@acx-ui/rc/utils'
import { Provider, store }                        from '@acx-ui/store'
import { mockServer, renderHook, waitFor }        from '@acx-ui/test-utils'

import { mockedDpskDeviceList, mockedIdentityGroupList, mockedIdentityList, mockedCertificateList, mockedIdentityClientList } from './__tests__/fixtures'

import { useIdentityListQuery } from '.'

describe('useIdentityListQuery', () => {
  const getClientQueryFn = jest.fn()
  jest.mocked(useIsSplitOn).mockReturnValue(true)
  beforeEach(() => {
    getClientQueryFn.mockClear()
    store.dispatch(personaApi.util.resetApiState())
    store.dispatch(serviceApi.util.resetApiState())
    store.dispatch(policyApi.util.resetApiState())
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
      ),
      rest.post(
        CertificateUrls.getCertificatesByIdentity.url,
        (_, res, ctx) => res(ctx.json(mockedCertificateList))
      ),
      rest.post(
        PersonaUrls.searchIdentityClients.url.split('?')[0],
        (_, res, ctx) => {
          getClientQueryFn()
          return res(ctx.json(mockedIdentityClientList))
        }
      )
    )
  })

  it('should get data correctly without personaGroupId', async () => {
    const { result } = renderHook(() => useIdentityListQuery({}), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    await waitFor(() => expect(result.current.isLoading).toBeFalsy())
    expect(result.current.data?.totalCount).toBe(5)
  })

  it('should get data correctly with personaGroupId', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    const { result } = renderHook(() => useIdentityListQuery({ personaGroupId: 'testGeoupId' }), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    await waitFor(() => expect(result.current.data?.data[2].deviceCount).toBe(1)) // relied on Persona.deviceCount + dpsk device count
    await waitFor(() => expect(result.current.data?.data[0].certificateCount).toBe(3))
  })

  it('should get correct device count while Client FF is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const { result } = renderHook(() => useIdentityListQuery({ personaGroupId: 'testGeoupId' }), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    await waitFor(() => expect(getClientQueryFn).toHaveBeenCalled())
    await waitFor(() => expect(result.current.data?.data[0].deviceCount).toBe(1)) // relied on client query result
    await waitFor(() => expect(result.current.data?.data[0].certificateCount).toBe(3))
  })
})
