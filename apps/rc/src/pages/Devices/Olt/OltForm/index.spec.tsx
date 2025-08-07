import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { OltFixtures }                                       from '@acx-ui/olt/utils'
import { CommonUrlsInfo }                                    from '@acx-ui/rc/utils'
import { Provider }                                          from '@acx-ui/store'
import { screen, render, renderHook, mockServer, fireEvent } from '@acx-ui/test-utils'

import OltForm from './index'

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('AddOlt', () => { //TODO
  const mockedFinish = jest.fn()
  const params = { tenantId: 'tenant-id', action: 'add' }
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_req, res, ctx) => res(ctx.json(OltFixtures.mockVenuelist))
      )
    )
  })

  it('should render correctly', () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <OltForm
          form={formRef.current}
          onFinish={mockedFinish}
        />
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByText('Add Optical Switch')).toBeInTheDocument()
    expect(screen.getByText(/Hardware Modules/)).toBeInTheDocument()
  })

  it('should add OLT correctly', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <OltForm
          form={formRef.current}
          onFinish={mockedFinish}
        />
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByText('Add Optical Switch')).toBeInTheDocument()
    fireEvent.mouseDown(await screen.findByLabelText(/Venue/))
    const venue = await screen.findAllByText('My-Venue')
    await userEvent.click(venue[0])

    await userEvent.type(await screen.findByLabelText('Serial Number'), '123456789')
    await userEvent.type(await screen.findByLabelText('OLT Name'), 'OLT-TEST')

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(mockedUsedNavigate).lastCalledWith('/tenant-id/t/devices/optical')
  })
})

describe('EditOlt', () => { //TODO
  const mockedFinish = jest.fn()
  const params = { tenantId: 'tenant-id', oltId: 'olt-id', action: 'edit' }
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_req, res, ctx) => res(ctx.json(OltFixtures.mockVenuelist))
      )
    )
  })

  it('should render correctly', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <OltForm
          form={formRef.current}
          onFinish={mockedFinish}
        />
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByText('Edit Optical Switch')).toBeInTheDocument()
    expect(screen.queryByText(/Hardware Modules/)).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).lastCalledWith('/tenant-id/t/devices/optical')
  })
})
