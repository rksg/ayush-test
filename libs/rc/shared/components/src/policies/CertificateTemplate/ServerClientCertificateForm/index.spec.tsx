import userEvent from '@testing-library/user-event'
import moment    from 'moment'
import { rest }  from 'msw'

import { CertificateUrls }                                from '@acx-ui/rc/utils'
import { Provider }                                       from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { certificateAuthorityList } from '../__test__/fixtures'

import { ServerClientCertificateForm } from '.'



const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('ServerClientCertificateForm', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CertificateUrls.getCAs.url,
        (req, res, ctx) => res(ctx.json(certificateAuthorityList))
      ),
      rest.post(
        CertificateUrls.getServerCertificates.url,
        (req, res, ctx) => res(ctx.json([]))
      ),
      rest.post(
        CertificateUrls.generateClientServerCertificate.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
  })

  it('should render the generate form with initial value correctly', () => {
    render(<Provider><ServerClientCertificateForm /></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/serverCertificates/create'
      }
    })

    expect(screen.getByText('Certificate Attributes')).toBeVisible()
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '2048')
    expect(screen.getByText('SHA-256')).toBeVisible()
    const start = moment(new Date().setMonth(new Date().getMonth() - 1)).format('MM/DD/YYYY')
    const end = moment(new Date().setFullYear(new Date().getFullYear() + 20)).format('MM/DD/YYYY')
    expect(screen.getByDisplayValue(start)).toBeVisible()
    expect(screen.getByDisplayValue(end)).toBeVisible()
  })

  it('should validate start date and end date for add form', async () => {
    render(<Provider><ServerClientCertificateForm /></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/serverCertificates/create'
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

  it('should submit create form correctly', async () => {

    render(<Provider><ServerClientCertificateForm /></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/serverCertificates/create'
      }
    })

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Select Certificate Authority' }))
    await userEvent.click(await screen.findByText('onboard2'))


    await fireEvent.change(screen.getByRole('textbox', { name: 'Name' }),
      { target: { value: 'test name' } })

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(mockedUsedNavigate).toBeCalledTimes(1))
  })

  it('should submit upload form correctly', async () => {
    mockServer.use(
      rest.post(
        CertificateUrls.uploadCertificate.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )

    render(<Provider><ServerClientCertificateForm /></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/serverCertificates/create'
      }
    })

    const uploadRadio = screen.getByDisplayValue('UPLOAD')
    await userEvent.click(uploadRadio)
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await fireEvent.change(screen.getByRole('textbox', { name: 'Name' }),
      { target: { value: 'test name' } })
    const publicFileInput = screen.getByTestId('public-key-upload')
    const file = new File([''], 'public.pem')
    await userEvent.upload(publicFileInput, file)
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(mockedUsedNavigate).toBeCalledTimes(1))
  })
})
