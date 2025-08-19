import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { OltFixtures }                                                                from '@acx-ui/olt/utils'
import { venueApi }                                                                   from '@acx-ui/rc/services'
import { CommonUrlsInfo }                                                             from '@acx-ui/rc/utils'
import { Provider, store }                                                            from '@acx-ui/store'
import { render, renderHook, mockServer, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { OltBasicForm } from './OltBasicForm'

const { mockOlt } = OltFixtures

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('OltBasicForm', () => { //TODO
  const params = { tenantId: 'tenant-id', oltId: 'olt-id' }

  beforeEach(() => {
    mockedUsedNavigate.mockClear()
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_req, res, ctx) => res(ctx.json(OltFixtures.mockVenuelist))
      )
    )
  })

  it('should render with add mode correctly', async () => {
    const mockPath = '/:tenantId/devices/optical/add'
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })
    render(<Provider>
      <OltBasicForm
        data={{}}
        form={formRef.current}
        editMode={false}
        onFinish={jest.fn()}
      />
    </Provider>, { route: { params, path: mockPath } })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(screen.getByLabelText(/Serial Number/)).toBeVisible()
  })

  it('should render with edit mode correctly', async () => {
    const mockPath = '/:tenantId/devices/optical/:oltId/edit'
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })
    render(<Provider>
      <OltBasicForm
        data={mockOlt}
        form={formRef.current}
        editMode={true}
        onFinish={jest.fn()}
      />
    </Provider>, { route: { params, path: mockPath } })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(screen.getByLabelText(/OLT Name/)).toHaveValue('TestOlt')
  })

  it('should redirect to olt list page after clicking cancel button', async () => {
    const mockPath = '/:tenantId/devices/optical/:oltId/edit'
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })
    render(<Provider>
      <OltBasicForm
        data={mockOlt}
        form={formRef.current}
        editMode={true}
        onFinish={jest.fn()}
      />
    </Provider>, { route: { params, path: mockPath } })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(screen.getByLabelText(/OLT Name/)).toHaveValue('TestOlt')
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith(
      '/tenant-id/t/devices/optical'
    ))
  })

})