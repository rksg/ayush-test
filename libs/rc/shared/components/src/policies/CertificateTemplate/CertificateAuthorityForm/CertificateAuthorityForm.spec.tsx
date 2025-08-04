import userEvent from '@testing-library/user-event'
import moment    from 'moment'
import { rest }  from 'msw'

import { CertificateUrls }                     from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { certificateAuthorityList } from '../__tests__/fixtures'

import { CertificateAuthorityForm } from './CertificateAuthorityForm'



const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('CertificateAuthorityForm', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CertificateUrls.getCAs.url,
        (req, res, ctx) => res(ctx.json(certificateAuthorityList))
      )
    )
  })

  it('should render the add form with initial value correctly', () => {
    render(<Provider><CertificateAuthorityForm /></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/certificateAuthority/create'
      }
    })
    expect(screen.getByText('Add Certificate Authority')).toBeVisible()
    expect(screen.getByText('Create Root CA')).toBeVisible()
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '2048')
    expect(screen.getByText('SHA-256')).toBeVisible()
    const start = moment(new Date().setMonth(new Date().getMonth() - 1)).format('MM/DD/YYYY')
    const end = moment(new Date().setFullYear(new Date().getFullYear() + 20)).format('MM/DD/YYYY')
    expect(screen.getByDisplayValue(start)).toBeVisible()
    expect(screen.getByDisplayValue(end)).toBeVisible()
  })

  it('should validate start date and end date for add form', async () => {
    render(<Provider><CertificateAuthorityForm /></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/certificateAuthority/create'
      }
    })
    const startDate = screen.getByLabelText('Start Date')
    await userEvent.type(startDate, '{backspace}{backspace}')
    await userEvent.type(startDate, '93{enter}') // set year to 2093
    await userEvent.tab()
    const endDate = screen.getByLabelText('Expiration Date')
    await userEvent.type(endDate, '{backspace}{backspace}')
    await userEvent.type(endDate, '92{enter}') // set year to 2092
    await userEvent.tab()
    expect(await screen.findByText('Start Date should be before Expiration Date')).toBeVisible()
  })

  it('should validate required public key field for upload form', async () => {
    render(<Provider><CertificateAuthorityForm /></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/certificateAuthority/create'
      }
    })

    const uploadRadio = screen.getByDisplayValue('UPLOAD')
    await userEvent.click(uploadRadio)
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(await screen.findByText('Please upload valid public key')).toBeVisible()
  })

  it('should validate required private key field for upload form', async () => {
    render(<Provider><CertificateAuthorityForm /></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/certificateAuthority/create'
      }
    })

    const uploadRadio = screen.getByDisplayValue('UPLOAD')
    await userEvent.click(uploadRadio)
    const password = await screen.findByLabelText('Private Key Password')
    await userEvent.type(password, 'testPassword')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(await screen.findByText('Please upload valid private key')).toBeVisible()
  })

  it('should submit create form correctly', async () => {
    mockServer.use(
      rest.post(
        CertificateUrls.getCAs.url,
        (req, res, ctx) => res(ctx.json(certificateAuthorityList))
      ),
      rest.post(
        CertificateUrls.addCA.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )

    render(<Provider><CertificateAuthorityForm /></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/certificateAuthority/create'
      }
    })
    await userEvent.type(screen.getByLabelText('Certificate Authority Name'), 'testAuthorityName')
    await userEvent.type(screen.getByLabelText('Common Name'), 'testCommonName')
    await userEvent.type(screen.getByLabelText('Description'), 'testDescription')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(mockedUsedNavigate).toBeCalledTimes(1))
  })

  it('should submit upload form correctly', async () => {
    mockServer.use(
      rest.post(
        CertificateUrls.addCA.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )

    render(<Provider><CertificateAuthorityForm /></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/certificateAuthority/create'
      }
    })

    const uploadRadio = screen.getByDisplayValue('UPLOAD')
    await userEvent.click(uploadRadio)
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    const publicFileInput = screen.getByTestId('public-key-upload')
    const file = new File([''], 'public.cer')
    await userEvent.upload(publicFileInput, file)
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(mockedUsedNavigate).toBeCalledTimes(1))
  })
})
