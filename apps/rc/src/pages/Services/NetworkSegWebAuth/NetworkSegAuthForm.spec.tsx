import { rest } from 'msw'

import {
  NetworkSegmentationUrls
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import NetworkSegAuthForm from './NetworkSegAuthForm'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe( 'NetworkSegAuthForm', () => {
  const params = { tenantId: 'tenant-id', serviceId: 'service-id' }

  beforeEach(async () => {
    mockedUsedNavigate.mockClear()
    mockServer.use(
      rest.get(
        NetworkSegmentationUrls.getWebAuthTemplate.url,
        (req, res, ctx) => res(ctx.json({
          id: 'zxzz',
          name: 'Mock Template name',
          webAuthCustomTop: 'Header',
          webAuthCustomTitle: 'Title',
          webAuthPasswordLabel: 'Password Label',
          webAuthCustomLoginButton: 'Button',
          webAuthCustomBottom: 'Footer'
        }))
      ),
      rest.post(
        NetworkSegmentationUrls.addWebAuthTemplate.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.put(
        NetworkSegmentationUrls.updateWebAuthTemplate.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
  })

  it( 'should render and submit successfully', async () => {
    render(
      <Provider>
        <NetworkSegAuthForm />
      </Provider>, { route: { params, path: '/:tenantId/t/services/webAuth/add' } }
    )

    expect(await screen.findByRole('heading', { level: 1 }))
      .toHaveTextContent('Add Network Segmentation Auth page for Switch')

    fireEvent.change(screen.getByLabelText('Service Name'), { target: { value: 'Page Name2' } })

    fireEvent.click(screen.getAllByRole('button', { name: 'Reset to default' })[0])
    fireEvent.click(screen.getAllByRole('button', { name: 'Reset to default' })[1])
    fireEvent.click(screen.getAllByRole('button', { name: 'Reset to default' })[2])
    fireEvent.click(screen.getAllByRole('button', { name: 'Reset to default' })[3])
    fireEvent.click(screen.getAllByRole('button', { name: 'Reset to default' })[4])

    fireEvent.click(screen.getByRole('button', { name: 'Finish' }))

    await waitFor(() => expect(mockedUsedNavigate).toBeCalled())
  })

  it( 'should render modalMode successfully', async () => {
    const mockedCallback = jest.fn()
    render(
      <Provider>
        <NetworkSegAuthForm modalMode={true} modalCallBack={mockedCallback}/>
      </Provider>, { route: { params, path: '/:tenantId/t/services/webAuth/add' } }
    )

    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => expect(mockedCallback).toBeCalled())
  })

  it( 'should render Edit form', async () => {
    render(
      <Provider>
        <NetworkSegAuthForm editMode={true} />
      </Provider>, { route: { params, path: '/:tenantId/t/services/webAuth/:serviceId/edit' } }
    )

    expect(await screen.findByRole('heading', { level: 1 }))
      .toHaveTextContent('Edit Network Segmentation Auth page for Switch')

    await waitFor(() =>
      expect(screen.getByDisplayValue(
        'Password Label')).toBeVisible())

    fireEvent.click(screen.getByRole('button', { name: 'Finish' }))

    await waitFor(() => expect(mockedUsedNavigate).toBeCalled())
  })
})
