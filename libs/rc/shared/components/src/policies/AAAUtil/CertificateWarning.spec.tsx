/* eslint-disable max-len */
import { rest } from 'msw'

import { useGetCertificatesQuery }                               from '@acx-ui/rc/services'
import { CertificateStatusType, CertificateUrls, useTableQuery } from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { mockServer, render, renderHook, screen }                from '@acx-ui/test-utils'

import { CertificateTable } from '../CertificateTemplate'
import { certificateList  } from '../CertificateTemplate/__test__/fixtures'

import { CertificateWarning } from './CertificateWarning'

describe('CertificateWarning', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(CertificateUrls.getCertificates.url,
        (_, res, ctx) => res(ctx.json(certificateList))
      )
    )
  })


  it('should render correctly', async () => {
    const { result: certificateTableQuery } = renderHook(() =>
      useTableQuery({
        useQuery: useGetCertificatesQuery,
        defaultPayload: {},
        apiParams: {}
      }), { wrapper: ({ children }) => <Provider children={children} /> })

    render(<Provider>
      <CertificateWarning status={[CertificateStatusType.EXPIRED]}/>
      <CertificateTable tableQuery={certificateTableQuery.current}/></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/certificate/list'
      }
    })

    const result = await screen.findByText('Server & Client Certificates')
    expect(result).toBeVisible()
  })

})