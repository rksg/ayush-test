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

  test('renders correctly', () => {
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

    expect(screen.getByText('View Public Key')).toBeInTheDocument()
    expect(screen.getByText('View Chain')).toBeInTheDocument()
    expect(screen.getAllByText('Download PEM')).toHaveLength(2)
    expect(screen.getByText('Download DER')).toBeInTheDocument()
    expect(screen.getByText('Download PKCS7')).toBeInTheDocument()
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

    const downloadPublicKeyPem = screen.getAllByText('Download PEM')[0]
    await userEvent.click(downloadPublicKeyPem)
    const downloadPublicKeyDer = screen.getByText('Download DER')
    await userEvent.click(downloadPublicKeyDer)
    await waitFor(() => expect(mockDownloadCertificate).toHaveBeenCalled())

    const downloadChain = screen.getAllByText('Download PEM')[1]
    await userEvent.click(downloadChain)
    const downloadChainPkcs7 = screen.getByText('Download PKCS7')
    await userEvent.click(downloadChainPkcs7)
    await waitFor(() => expect(mockDownloadCertificateChain).toHaveBeenCalled())

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

    const downloadPublicKeyPem = screen.getAllByText('Download PEM')[0]
    await userEvent.click(downloadPublicKeyPem)
    const downloadPublicKeyDer = screen.getByText('Download DER')
    await userEvent.click(downloadPublicKeyDer)
    await waitFor(() => expect(mockDownloadCA).toBeCalledTimes(2))

    const downloadChain = screen.getAllByText('Download PEM')[1]
    await userEvent.click(downloadChain)
    const downloadChainPkcs7 = screen.getByText('Download PKCS7')
    await userEvent.click(downloadChainPkcs7)
    await waitFor(() => expect(mockDownloadCAChain).toHaveBeenCalled())

    jest.resetAllMocks()
    const downloadPrivate = screen.getAllByRole('button', { name: 'Download' })[0]
    await userEvent.click(downloadPrivate)
    const downloadP12 = screen.getAllByRole('button', { name: 'Download' })[1]
    await userEvent.click(downloadP12)
    await waitFor(() => expect(mockDownloadCA).toBeCalledTimes(2))
  })
})
