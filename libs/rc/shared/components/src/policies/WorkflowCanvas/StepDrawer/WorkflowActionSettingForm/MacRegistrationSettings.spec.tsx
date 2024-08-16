import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { CommonUrlsInfo, DpskActionContext, MacRegActionContext, PersonaUrls, MacRegListUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                                                from '@acx-ui/store'
import { mockServer, render, renderHook, screen, waitFor }                                         from '@acx-ui/test-utils'

import {
  mockedNetworkList,
  mockPersonaGroupTableResult,
  mockPersonaTableResult,
  mockMacRegList,
  replacePagination
} from './__tests__/fixtures'
import { MacRegistrationSettings } from './MacRegistrationSettings'

const getPersonaList = jest.fn()
const getNetworkList = jest.fn()


describe('MacRegistrationSettings', () => {
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
        MacRegListUrlsInfo.getMacRegistrationPool.url,
        (req, res, ctx) =>
          res(ctx.json(mockMacRegList))
      ),
      rest.post(CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => {
          getNetworkList()
          return res(ctx.json(mockedNetworkList))
        })
    )
  })

  it('should render the form with default values', async () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <MacRegistrationSettings/>
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
      const [form] = Form.useForm<MacRegActionContext>()
      form.setFieldsValue({
        identityGroupId: mockPersonaGroupTableResult.content[0].id,
        identityId: mockPersonaTableResult.content[0].id,
        clientEnterMacAddress: true
      })
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <MacRegistrationSettings/>
        </Form>
      </Provider>
    )

    await waitFor(() => expect(getPersonaList).toBeCalled())

    // eslint-disable-next-line max-len
    const qrCodeNotification = await screen.findByRole('checkbox', { name: /clientEnterMacAddress/ })
    expect(qrCodeNotification).toBeChecked()

    const macRegPoolName = await screen.findByText(mockMacRegList.name)
    expect(macRegPoolName).toBeVisible()

    // Test if the identityGroup is selected
    expect(await screen.findByText(mockPersonaGroupTableResult.content[0].name)).toBeInTheDocument()
    expect(await screen.findByText(mockPersonaTableResult.content[0].name)).toBeInTheDocument()
  })

  it('should render the component after identity group selected', async () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm<DpskActionContext>()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <MacRegistrationSettings/>
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

    const macRegPoolName = await screen.findByText(mockMacRegList.name)
    expect(macRegPoolName).toBeVisible()

    // Test if the identityGroup is selected
    expect(await screen.findByText(mockedNetworkList.data[0].ssid)).toBeInTheDocument()
  })
})
