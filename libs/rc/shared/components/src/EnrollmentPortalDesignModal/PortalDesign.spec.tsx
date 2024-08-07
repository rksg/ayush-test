import { rest } from 'msw'
import { Path } from 'react-router-dom'

import { useIsSplitOn }                                                   from '@acx-ui/feature-toggle'
import { UIConfiguration, WorkflowUrls }                                  from '@acx-ui/rc/utils'
import { Provider }                                                       from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import PortalDesign from './PortalDesign'

const config: UIConfiguration = {
  disablePoweredBy: false,
  uiColorSchema: {
    fontHeaderColor: 'var(--acx-neutrals-100)',
    backgroundColor: 'var(--acx-primary-white)',
    fontColor: 'var(--acx-neutrals-100)',

    buttonFontColor: 'var(--acx-primary-white)',
    buttonColor: 'var(--acx-accents-orange-50)'
  },
  uiStyleSchema: {
    logoRatio: 1,
    titleFontSize: 16,
    logoImageFileName: 'logo',
    backgroundImageName: 'bgImage'
  },
  welcomeName: '',
  welcomeTitle: ''
}


const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/__tenantId__',
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (): Path => mockedTenantPath
}))



describe('Portal Design', () => {
  const getUIConfigApi = jest.fn()
  const getUIConfigImageApi = jest.fn()
  jest.mocked(useIsSplitOn).mockReturnValue(true)
  const params = { tenantId: 't1', policyId: 'id' }
  beforeEach(async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.get(
        WorkflowUrls.getWorkflowUIConfig.url,
        (req, res, ctx) => {
          getUIConfigApi()
          return res(ctx.json(config))
        }
      ),
      rest.get(
        WorkflowUrls.getWorkflowUIConfigImage.url,
        (reg, res, ctx) => {
          getUIConfigImageApi()
          return res(ctx.json({ fileUrl: 'fileUrl' }))
        }
      )
    )
  })

  it('should render correctly', async () => {
    render(<Provider>
      <PortalDesign id='id'/>
    </Provider>, {
      route: { params }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('Portal Design')
    await screen.findByText('Reset')
    await screen.findByText('Components')
    await screen.findByText('Powered By')
    await waitFor(() => expect(getUIConfigApi).toHaveBeenCalled())
    await waitFor(() => expect(getUIConfigImageApi).toHaveBeenCalledTimes(2))
  })
})