import userEvent         from '@testing-library/user-event'
import { Form }          from 'antd'
import { rest }          from 'msw'
import { BrowserRouter } from 'react-router-dom'

import { Features, useIsSplitOn, useIsTierAllowed }          from '@acx-ui/feature-toggle'
import { DpskUrls, PersonaUrls, RulesManagementUrlsInfo }    from '@acx-ui/rc/utils'
import { Provider }                                          from '@acx-ui/store'
import { fireEvent, mockServer, render, renderHook, screen } from '@acx-ui/test-utils'

import {
  mockedAdaptivePolicyList,
  mockedDpskList,
  mockedGetFormData,
  mockedPolicySet,
  mockedTemplateList
} from './__tests__/fixtures'
import DpskSettingsForm                 from './DpskSettingsForm'
import { transferSaveDataToFormFields } from './parser'

const mockedUsedNavigate = jest.fn()
const mockedUseLocation = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useLocation: () => mockedUseLocation
}))

describe.skip('DpskSettingsForm', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(
        DpskUrls.getDpskList.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({ ...mockedDpskList }))
      )
    )
  })

  it('should render the form with the giving data', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldsValue(transferSaveDataToFormFields(mockedGetFormData))
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}><DpskSettingsForm /></Form>
      </Provider>
    )

    const nameInput = await screen.findByRole('textbox', { name: /Service Name/ })
    expect(nameInput).toHaveValue(mockedGetFormData.name)

    const expirationModeRadio = await screen.findByRole('radio', { name: /After/ })
    expect(expirationModeRadio).toBeChecked()
  })

  it('should validate the service name', async () => {
    const { result: formRef } = renderHook(() => {
      return Form.useForm()[0]
    })

    render(
      <Provider>
        <Form form={formRef.current}><DpskSettingsForm /></Form>
      </Provider>
    )

    const nameInput = await screen.findByRole('textbox', { name: /Service Name/ })
    await userEvent.type(nameInput, mockedDpskList.content[0].name)
    fireEvent.blur(nameInput)

    // eslint-disable-next-line max-len
    expect(await screen.findByRole('alert')).toHaveTextContent('DPSK service with that name already exists')
  })

  it('should render the cloudpath form items', async () => {
    mockServer.use(
      rest.get(
        RulesManagementUrlsInfo.getPolicySets.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({ ...mockedPolicySet }))
      )
    )

    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    render(
      <Provider>
        <BrowserRouter>
          <Form><DpskSettingsForm /></Form>
        </BrowserRouter>
      </Provider>
    )

    await userEvent.click(await screen.findByRole('combobox', { name: /Adaptive Policy Set/ }))

    const policySetOption = await screen.findByText(mockedPolicySet.content[0].name)
    expect(policySetOption).toBeInTheDocument()

    await userEvent.click(policySetOption)
    expect(await screen.findByRole('radio', { name: /ACCEPT/ })).toBeVisible()
  })

  it('should render the add identity group dialog when click add button', async () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.DPSK_REQUIRE_IDENTITY_GROUP)
    mockServer.use(
      rest.get(
        RulesManagementUrlsInfo.getPolicySets.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({ ...mockedPolicySet }))
      ),
      rest.post(
        PersonaUrls.searchPersonaGroupList.url.split('?')[0],
        (req, res, ctx) => res(ctx.json([]))
      )
    )
    render(
      <Provider>
        <BrowserRouter>
          <Form><DpskSettingsForm /></Form>
        </BrowserRouter>
      </Provider>
    )
    await userEvent.click((await screen.findAllByText('Add'))[0])
    expect(await screen.findByText('Add Identity Group')).toBeVisible()
  })

  it('click add button and show adaptive policy set dialog', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.DPSK_REQUIRE_IDENTITY_GROUP)
    mockServer.use(
      rest.get(
        RulesManagementUrlsInfo.getPolicySets.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({ ...mockedPolicySet }))
      ),
      rest.post(
        RulesManagementUrlsInfo.getPolicyTemplateListByQuery.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(mockedTemplateList))
      ),
      rest.post(
        RulesManagementUrlsInfo.getPoliciesByQuery.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(mockedAdaptivePolicyList))
      )
    )
    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    render(
      <Provider>
        <BrowserRouter>
          <Form><DpskSettingsForm /></Form>
        </BrowserRouter>
      </Provider>
    )

    await userEvent.click(await screen.findByText('Add'))
    expect(await screen.findByText('Add Adaptive Policy Set')).toBeVisible()
  })
})
