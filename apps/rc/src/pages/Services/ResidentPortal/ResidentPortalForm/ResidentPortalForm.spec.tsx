import userEvent   from '@testing-library/user-event'
import { rest }    from 'msw'

import {
  PropertyUrlsInfo, ServiceOperation, ServiceType, getServiceRoutePath
} from '@acx-ui/rc/utils'
import { Path, To, useTenantLink } from '@acx-ui/react-router-dom'
import { Provider }                from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen
} from '@acx-ui/test-utils'


import ResidentPortalForm from './ResidentPortalForm'
import { mockedTenantId, createPath, mockedResidentPortal, mockedCreateFormData, mockedResidentPortalList, mockedServiceId, editPath } from './__tests__/fixtures'


const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/' + mockedTenantId,
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (to: To): Path => {
    return { ...mockedTenantPath, pathname: mockedTenantPath.pathname + to }
  }
}))


describe('ResidentPortalForm', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        PropertyUrlsInfo.getResidentPortal.url,
        (req, res, ctx) => res(ctx.json(mockedResidentPortal))
      ),
      rest.get(
        '/residentPortals',
        (req, res, ctx) => res(ctx.json({ ...mockedResidentPortalList }))
      )
    )
  })

  it('should create a Resident Portal service', async () => {
    render(
      <Provider>
        <ResidentPortalForm />
      </Provider>, {
        route: { params: { tenantId: mockedTenantId }, path: createPath }
      }
    )

    const dataToCreate = { ...mockedCreateFormData }

    await userEvent.type(
      await screen.findByRole('textbox', { name: /Service Name/i }),
      dataToCreate.serviceName
    )

    await userEvent.type(
      await screen.findByRole('textbox', { name: /Portal Title/i }),
      dataToCreate.textTitle
    )

    await userEvent.type(
      await screen.findByRole('textbox', { name: /Subtitle/i }),
      dataToCreate.textSubtitle
    )

    await userEvent.type(
      await screen.findByRole('textbox', { name: /Login Text/i }),
      dataToCreate.textLogin
    )

    await userEvent.type(
      await screen.findByRole('textbox', { name: /Announcements/i }),
      dataToCreate.textAnnouncements
    )

    await userEvent.type(
      await screen.findByRole('textbox', { name: /Help Text/i }),
      dataToCreate.textHelp
    )

    await userEvent.click(screen.getByRole('button', { name: 'Finish' }))
  })

  it('should render Edit form', async () => {
    render(
      <Provider>
        <ResidentPortalForm editMode={true} />
      </Provider>, {
        route: {
          params: { tenantId: mockedTenantId, serviceId: mockedServiceId },
          path: editPath
        }
      }
    )

    const nameInput = await screen.findByDisplayValue(mockedResidentPortal.name)
    expect(nameInput).toBeInTheDocument()

    const titleInput = await screen.findByDisplayValue(mockedResidentPortal.uiConfiguration?.text.title)
    expect(titleInput).toBeInTheDocument()

    const subtitleInput = await screen.findByDisplayValue(mockedResidentPortal.uiConfiguration?.text.subTitle)
    expect(subtitleInput).toBeInTheDocument()

    const loginInput = await screen.findByDisplayValue(mockedResidentPortal.uiConfiguration?.text.loginText)
    expect(loginInput).toBeInTheDocument()

    const announcementsInput = await screen.findByDisplayValue(mockedResidentPortal.uiConfiguration?.text.announcements)
    expect(announcementsInput).toBeInTheDocument()

    const helpInput = await screen.findByDisplayValue(mockedResidentPortal.uiConfiguration?.text.helpText)
    expect(helpInput).toBeInTheDocument()

  })

  it('should navigate to the DPSK table when clicking Cancel button', async () => {
    const { result: selectServicePath } = renderHook(() => {
      return useTenantLink(getServiceRoutePath(
        { type: ServiceType.RESIDENT_PORTAL, oper: ServiceOperation.LIST }))
    })

    render(
      <Provider>
        <ResidentPortalForm />
      </Provider>, {
        route: { params: { tenantId: mockedTenantId }, path: createPath }
      }
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))

    expect(mockedUseNavigate).toHaveBeenCalledWith(selectServicePath.current)
  })

})
