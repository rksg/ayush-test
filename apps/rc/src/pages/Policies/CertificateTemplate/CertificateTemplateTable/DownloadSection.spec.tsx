import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CertificateCategoryType, CertificateUrls } from '@acx-ui/rc/utils'
import { Provider }                                 from '@acx-ui/store'
import { mockServer, render, screen, waitFor }      from '@acx-ui/test-utils'

import { certificate, certificateAuthority } from '../__test__/fixtures'

import DownloadSection from './DownloadSection'



const mockDownloadCAChain = jest.fn().mockImplementation(() => ({
  unwrap: () => Promise.resolve()
}))
const mockDownloadCA = jest.fn().mockImplementation(() => ({
  unwrap: () => Promise.resolve()
}))
const mockDownloadCertificateChain = jest.fn().mockImplementation(() => ({
  unwrap: () => Promise.resolve()
}))
const mockDownloadCertificate = jest.fn().mockImplementation(() => ({
  unwrap: () => Promise.resolve()
}))

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  downloadFile: jest.fn()
}))

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useLazyDownloadCertificateAuthorityChainsQuery: () => ([mockDownloadCAChain]),
  useLazyDownloadCertificateAuthorityQuery: () => ([mockDownloadCA]),
  useLazyDownloadCertificateChainsQuery: () => ([mockDownloadCertificateChain]),
  useLazyDownloadCertificateQuery: () => ([mockDownloadCertificate])
}))

describe('DownloadDrawer', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(
        CertificateUrls.downloadCertificate.url,
        (req, res, ctx) => res(ctx.json({ data: 'certificate' }))
      ),
      rest.get(
        CertificateUrls.downloadCertificateChains.url,
        (req, res, ctx) => res(ctx.json({ data: 'certificate' }))
      ),
      rest.get(
        CertificateUrls.downloadCA.url,
        (req, res, ctx) => res(ctx.json({ data: 'certificate' }))
      ),
      rest.get(
        CertificateUrls.downloadCAChains.url,
        (req, res, ctx) => res(ctx.json({ data: 'certificate' }))
      )
    )
  })

  test('handles certificate download button click', async () => {
    render(
      <Provider>
        <DownloadSection
          setRawInfoDrawer={() => { }}
          setUploadDrawerOpen={() => { }}
          type={CertificateCategoryType.CERTIFICATE}
          data={certificate}
        />
      </Provider>
    )

    expect(screen.queryByText('Delete')).toBeNull()
    const downloadPublicKeyPem = screen.getAllByRole('button', { name: 'Download PEM' })[0]
    await userEvent.click(downloadPublicKeyPem)
    const downloadPublicKeyDer = screen.getByRole('button', { name: 'Download DER' })
    await userEvent.click(downloadPublicKeyDer)
    await waitFor(() => expect(mockDownloadCertificate).toHaveBeenCalled())

    const downloadChain = screen.getAllByRole('button', { name: 'Download PEM' })[1]
    await userEvent.click(downloadChain)
    const downloadChainPkcs7 = screen.getByRole('button', { name: 'Download PKCS7' })
    await userEvent.click(downloadChainPkcs7)
    await waitFor(() => expect(mockDownloadCertificateChain).toHaveBeenCalled())

    const downloadPrivate = screen.getAllByRole('button', { name: 'Download' })[0]
    await userEvent.click(downloadPrivate)
    const downloadP12 = screen.getAllByRole('button', { name: 'Download' })[1]
    await userEvent.click(downloadP12)
    await waitFor(() => expect(mockDownloadCertificate).toBeCalledTimes(4))
  })

  it('should handle certificate authority download button click', async () => {
    render(
      <Provider>
        <DownloadSection
          setRawInfoDrawer={() => { }}
          setUploadDrawerOpen={() => { }}
          type={CertificateCategoryType.CERTIFICATE_AUTHORITY}
          data={certificateAuthority}
        />
      </Provider>
    )

    expect(screen.queryByText('Delete')).toBeVisible()
    const downloadPublicKeyPem = screen.getAllByRole('button', { name: 'Download PEM' })[0]
    await userEvent.click(downloadPublicKeyPem)
    const downloadPublicKeyDer = screen.getByRole('button', { name: 'Download DER' })
    await userEvent.click(downloadPublicKeyDer)
    await waitFor(() => expect(mockDownloadCA).toBeCalledTimes(2))

    const downloadChain = screen.getAllByRole('button', { name: 'Download PEM' })[1]
    await userEvent.click(downloadChain)
    const downloadChainPkcs7 = screen.getByRole('button', { name: 'Download PKCS7' })
    await userEvent.click(downloadChainPkcs7)
    await waitFor(() => expect(mockDownloadCAChain).toHaveBeenCalled())

    const downloadPrivate = screen.getAllByRole('button', { name: 'Download' })[0]
    await userEvent.click(downloadPrivate)
    const downloadP12 = screen.getAllByRole('button', { name: 'Download' })[1]
    await userEvent.click(downloadP12)
    await waitFor(() => expect(mockDownloadCA).toBeCalledTimes(4))
  })
})
