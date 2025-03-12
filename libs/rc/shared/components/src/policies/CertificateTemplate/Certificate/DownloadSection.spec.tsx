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
  useLazyDownloadCertificateQuery: () => ([mockDownloadCertificate]),
  useLazyDownloadPrivateKeyCertificateQuery: () => ([mockDownloadCertificate]),
  useLazyDownloadCertificateInP12Query: () => ([mockDownloadCertificate])
}))

describe('DownloadDrawer', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(
        CertificateUrls.downloadCertificate.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({ data: 'certificate' }))
      ),
      rest.get(
        CertificateUrls.downloadCertificateChains.url,
        (req, res, ctx) => res(ctx.json({ data: 'certificate' }))
      ),
      rest.get(
        CertificateUrls.downloadCA.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({ data: 'certificate' }))
      ),
      rest.get(
        CertificateUrls.downloadCAChains.url,
        (req, res, ctx) => res(ctx.json({ data: 'certificate' }))
      ),
      rest.post(
        CertificateUrls.downloadCertificate.url.split('?')[0],
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

    const downloadChain = screen.getAllByRole('button', { name: 'Download PEM' })[1]
    await userEvent.click(downloadChain)
    const downloadChainPkcs7 = screen.getByRole('button', { name: 'Download PKCS7' })
    await userEvent.click(downloadChainPkcs7)
    await waitFor(() => expect(mockDownloadCertificateChain).toBeCalledTimes(2))

    const privateKeyBtn = screen.getByRole('button', { name: 'Download' })
    await userEvent.click(privateKeyBtn)
    const modalDownloadBtn = await screen.findByRole('button', { name: 'Download Private Key' })
    expect(modalDownloadBtn).toBeInTheDocument()
    await userEvent.click(modalDownloadBtn)

    // eslint-disable-next-line max-len
    const downloadP12WithoutChainBtn = screen.getByRole('button', { name: 'Download Without Chain' })
    await userEvent.click(downloadP12WithoutChainBtn)
    const downloadBtn = await screen.findByRole('button', { name: 'Download P12' })
    expect(downloadBtn).toBeInTheDocument()
    await userEvent.click(downloadBtn)

    const downloadP12 = screen.getByRole('button', { name: 'Download With Chain' })
    await userEvent.click(downloadP12)
    const downloadBtn2 = await screen.findByRole('button', { name: 'Download P12' })
    expect(downloadBtn2).toBeInTheDocument()
    await userEvent.click(downloadBtn2)
    await waitFor(() => expect(mockDownloadCertificate).toBeCalledTimes(5))
  })

  it('should render certificate correctly without private key', async () => {
    render(
      <Provider>
        <DownloadSection
          setRawInfoDrawer={() => { }}
          setUploadDrawerOpen={() => { }}
          type={CertificateCategoryType.CERTIFICATE}
          data={{ ...certificate, privateKeyBase64: '' }}
        />
      </Provider>
    )

    expect(screen.queryByText('Delete')).toBeNull()
    const downloadPublicKeyPem = screen.queryAllByRole('button', { name: 'Download PEM' })[0]
    expect(downloadPublicKeyPem).toBeInTheDocument()
    const downloadPublicKeyDer = screen.getByRole('button', { name: 'Download DER' })
    expect(downloadPublicKeyDer).toBeInTheDocument()
    const downloadChain = screen.queryAllByRole('button', { name: 'Download PEM' })[1]
    expect(downloadChain).toBeInTheDocument()
    const downloadChainPkcs7 = screen.getByRole('button', { name: 'Download PKCS7' })
    expect(downloadChainPkcs7).toBeInTheDocument()
    const privateKeyBtn = screen.queryByRole('button', { name: 'Download' })
    expect(privateKeyBtn).toBeNull()
    const downloadP12noChainBtn = screen.queryByRole('button', { name: 'Download Without Chain' })
    expect(downloadP12noChainBtn).toBeNull()
    const downloadP12Btn = screen.queryByRole('button', { name: 'Download With Chain' })
    expect(downloadP12Btn).toBeNull()
    expect(screen.queryAllByText('N/A')).toHaveLength(2)
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

    const downloadChain = screen.getAllByRole('button', { name: 'Download PEM' })[1]
    await userEvent.click(downloadChain)
    const downloadChainPkcs7 = screen.getByRole('button', { name: 'Download PKCS7' })
    await userEvent.click(downloadChainPkcs7)
    await waitFor(() => expect(mockDownloadCAChain).toBeCalledTimes(2))

    const privateKeyBtn = screen.getByRole('button', { name: 'Download' })
    await userEvent.click(privateKeyBtn)
    const modalDownloadBtn = await screen.findByRole('button', { name: 'Download Private Key' })
    expect(modalDownloadBtn).toBeInTheDocument()
    await userEvent.click(modalDownloadBtn)

    // eslint-disable-next-line max-len
    const downloadP12noChainBtn = screen.getByRole('button', { name: 'Download Without Chain' })
    await userEvent.click(downloadP12noChainBtn)
    const downloadBtn = await screen.findByRole('button', { name: 'Download P12' })
    expect(downloadBtn).toBeInTheDocument()
    await userEvent.click(downloadBtn)

    const downloadP12 = screen.getByRole('button', { name: 'Download With Chain' })
    await userEvent.click(downloadP12)
    const downloadBtn2 = await screen.findByRole('button', { name: 'Download P12' })
    expect(downloadBtn2).toBeInTheDocument()
    await userEvent.click(downloadBtn2)
    await waitFor(() => expect(mockDownloadCA).toBeCalledTimes(5))
  })

  it('should render CA correctly without private key', async () => {
    render(
      <Provider>
        <DownloadSection
          setRawInfoDrawer={() => { }}
          setUploadDrawerOpen={() => { }}
          type={CertificateCategoryType.CERTIFICATE_AUTHORITY}
          data={{ ...certificateAuthority, privateKeyBase64: '' }}
        />
      </Provider>
    )

    expect(screen.queryByText('Delete')).toBeNull()
    const downloadPublicKeyPem = screen.queryAllByRole('button', { name: 'Download PEM' })[0]
    expect(downloadPublicKeyPem).toBeInTheDocument()
    const downloadPublicKeyDer = screen.getByRole('button', { name: 'Download DER' })
    expect(downloadPublicKeyDer).toBeInTheDocument()
    const downloadChain = screen.queryAllByRole('button', { name: 'Download PEM' })[1]
    expect(downloadChain).toBeInTheDocument()
    const downloadChainPkcs7 = screen.getByRole('button', { name: 'Download PKCS7' })
    expect(downloadChainPkcs7).toBeInTheDocument()
    const privateKeyBtn = screen.queryByRole('button', { name: 'Upload' })
    expect(privateKeyBtn).toBeInTheDocument()
    const downloadP12noChainBtn = screen.queryByRole('button', { name: 'Download Without Chain' })
    expect(downloadP12noChainBtn).toBeNull()
    const downloadP12Btn = screen.queryByRole('button', { name: 'Download With Chain' })
    expect(downloadP12Btn).toBeNull()
    expect(screen.queryAllByText('N/A')).toHaveLength(1)
  })
})
