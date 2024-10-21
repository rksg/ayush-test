import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { Path }  from 'react-router-dom'

import { useIsSplitOn }                                                              from '@acx-ui/feature-toggle'
import { UIConfiguration, WorkflowUrls }                                             from '@acx-ui/rc/utils'
import { Provider }                                                                  from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import PortalDesign from './PortalDesign'

const config: UIConfiguration = {
  uiColorSchema: {
    fontHeaderColor: 'var(--acx-neutrals-100)',
    backgroundColor: 'var(--acx-primary-white)',
    fontColor: 'var(--acx-neutrals-100)',

    buttonFontColor: 'var(--acx-primary-white)',
    buttonColor: 'var(--acx-accents-orange-50)'
  },
  uiStyleSchema: {
    logoSize: 'MEDIUM',
    headerFontSize: 16,
    logoImageFileName: 'logo',
    backgroundImageName: 'bgImage',
    disablePoweredBy: false
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

const file = new File(['logo ruckus'],
  'https://storage.cloud.google.com/ruckus-web-1/acx-ui-static-resources/logo-ruckus.png',
  { type: 'image/png' })

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
    await userEvent.click(await screen.findByTitle('deskicon'))
    await userEvent.click(await screen.findByTitle('tableticon'))
    await userEvent.click(await screen.findByTitle('mobileicon'))
    await userEvent.click(await screen.findByAltText('logo'))
    await userEvent.click(await screen.findByTitle('plusen'))
    await userEvent.click(await screen.findByTitle('plusen'))
    await userEvent.click(await screen.findByTitle('minusen'))
    await userEvent.upload(await screen.findByPlaceholderText('logoimage'), file)
    await userEvent.click((await screen.findAllByTitle('pictureout'))[0])
    fireEvent.mouseLeave(await screen.findByAltText('logo'))
    await userEvent.click(await screen.findByAltText('logo'))
    fireEvent.mouseLeave(await screen.findByAltText('logo'))


    await screen.findByText('Portal Design')
    await screen.findByText('Reset')
    await screen.findByText('Components')
    await screen.findByText('Powered By')
    await screen.findByText('Title text style')
    await screen.findByText('Body text style')

    await userEvent.click(await screen.findByText('Reset'))
    await userEvent.click(await screen.findByText('Components'))
    const rows = await screen.findAllByRole('switch')
    const toogleButton = rows[2]
    fireEvent.click(toogleButton)
    fireEvent.click(toogleButton)
    const setRows = await screen.findAllByTestId('settingicon')
    fireEvent.click(setRows[0])
    await userEvent.type(await screen.findByPlaceholderText(
      'Copy from your WiFi4EU installation report'),'UUID')
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    fireEvent.click(setRows[0])
    await userEvent.type(await screen.findByPlaceholderText(
      'Copy from your WiFi4EU installation report'),'UUID')
    await userEvent.click(await screen.findByRole('button', { name: 'OK' }))
    await waitFor(() => expect(getUIConfigApi).toHaveBeenCalled())
    await waitFor(() => expect(getUIConfigImageApi).toHaveBeenCalledTimes(2))
  })
})