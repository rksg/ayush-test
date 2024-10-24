import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { CommonUrlsInfo, DpskActionContext, DpskUrls, PersonaUrls } from '@acx-ui/rc/utils'
import { Provider }                                                 from '@acx-ui/store'
import { mockServer, render, renderHook, screen, waitFor }          from '@acx-ui/test-utils'

import {
  mockedNetworkList,
  mockPersonaGroupTableResult,
  mockPersonaTableResult,
  mockDpskPool,
  replacePagination
} from './__tests__/fixtures'
import { DpskSettings } from './DpskSettings'

const getPersonaList = jest.fn()
const getDpsk = jest.fn()
const getNetworkList = jest.fn()


describe('DpskSettings', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(replacePagination(PersonaUrls.searchPersonaGroupList.url),
        (req, res, ctx) => {
          getPersonaList()
          return res(ctx.json(mockPersonaGroupTableResult))
        }
      ),
      rest.post(replacePagination(PersonaUrls.searchPersonaList.url),
        (req, res, ctx) =>
          res(ctx.json(mockPersonaTableResult))
      ),
      rest.get(
        DpskUrls.getDpsk.url,
        (req, res, ctx) => {
          getDpsk()
          return res(ctx.json(mockDpskPool))
        }
      ),
      rest.post(CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => {
          getNetworkList()
          return res(ctx.json(mockedNetworkList))
        })
    )
  })

  afterEach(() => jest.clearAllMocks())

  it('should render the form with default values', async () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <DpskSettings/>
        </Form>
      </Provider>
    )

    // eslint-disable-next-line max-len
    const identityGroupSelect = await screen.findByRole('combobox', { name: /Choose Identity Group/ })
    expect(identityGroupSelect).toHaveValue('')

    const identitySelect = await screen.findByRole('combobox', { name: /Choose Identity/ })
    expect(identitySelect).not.toBeVisible()
  })

  it('should render the form with provided values in edit mode', async () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm<DpskActionContext>()
      form.setFieldsValue({
        identityGroupId: mockPersonaGroupTableResult.content[0].id,
        identityId: mockPersonaTableResult.content[0].id,
        qrCodeDisplay: true,
        smsNotification: true,
        emailNotification: true
      })
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <DpskSettings/>
        </Form>
      </Provider>
    )

    await waitFor(() => expect(getPersonaList).toBeCalled())

    const dpskPoolName = await screen.findByText(mockDpskPool.name)
    expect(dpskPoolName).toBeVisible()

    // Test if the identityGroup is selected
    expect(await screen.findByText(mockPersonaGroupTableResult.content[0].name)).toBeInTheDocument()
    expect(await screen.findByText(mockPersonaTableResult.content[0].name)).toBeInTheDocument()
  })

  it('should render the form without provided values if identity group doesnt exist', async () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm<DpskActionContext>()
      form.setFieldsValue({
        identityGroupId: '1234',
        identityId: mockPersonaTableResult.content[0].id,
        qrCodeDisplay: true,
        smsNotification: true,
        emailNotification: true
      })
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <DpskSettings/>
        </Form>
      </Provider>
    )

    await waitFor(() => expect(getPersonaList).toBeCalled())

    expect(screen.queryByText(mockDpskPool.name)).toBeNull()

    // Test if the identityGroup is selected
    expect(screen.queryByText(mockPersonaGroupTableResult.content[0].name)).not.toBeInTheDocument()
    expect(screen.queryByText(mockPersonaTableResult.content[0].name)).not.toBeInTheDocument()

    expect(getDpsk).not.toHaveBeenCalled()
  })

  it('should render the component after identity group selected', async () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm<DpskActionContext>()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <DpskSettings/>
        </Form>
      </Provider>
    )

    await waitFor(() => expect(getPersonaList).toBeCalled())
    // eslint-disable-next-line max-len
    const identityGroupSelect = await screen.findByRole('combobox', { name: /Choose Identity Group/ })

    await userEvent.click(identityGroupSelect)

    expect(await screen.findAllByTitle(mockPersonaGroupTableResult.content[0].name)).toHaveLength(1)

    await userEvent.click(screen.getByTitle(mockPersonaGroupTableResult.content[0].name))

    await waitFor(() => expect(getPersonaList).toBeCalled())

    const dpskPoolName = await screen.findByText(mockDpskPool.name)
    expect(dpskPoolName).toBeVisible()

    // Test if the identityGroup is selected
    expect(await screen.findByText(mockedNetworkList.data[0].ssid)).toBeInTheDocument()
  })
})
