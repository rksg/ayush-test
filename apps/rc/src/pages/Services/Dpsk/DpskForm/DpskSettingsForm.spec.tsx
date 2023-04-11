import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { useIsSplitOn }                            from '@acx-ui/feature-toggle'
import { NewDpskBaseUrl, RulesManagementUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                from '@acx-ui/store'
import { mockServer, render, renderHook, screen }  from '@acx-ui/test-utils'

import { mockedDpskList, mockedGetFormData, mockedPolicySet } from './__tests__/fixtures'
import DpskSettingsForm                                       from './DpskSettingsForm'
import { transferSaveDataToFormFields }                       from './parser'

describe('DpskSettingsForm', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(
        NewDpskBaseUrl,
        (req, res, ctx) => res(ctx.json({ ...mockedDpskList }))
      )
    )
  })

  it('should render the form with the giving data', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    formRef.current.setFieldsValue(transferSaveDataToFormFields(mockedGetFormData))

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
    render(
      <Provider>
        <Form><DpskSettingsForm /></Form>
      </Provider>
    )

    const nameInput = await screen.findByRole('textbox', { name: /Service Name/ })
    await userEvent.type(nameInput, mockedDpskList.content[0].name)

    const errorMessageElem = await screen.findByRole('alert')
    expect(errorMessageElem.textContent).toBe('DPSK service with that name already exists')
  })

  it('should render the cloudpath form items', async () => {
    mockServer.use(
      rest.get(
        RulesManagementUrlsInfo.getAdaptivePolicySets.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({ ...mockedPolicySet }))
      )
    )

    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(
      <Provider>
        <Form><DpskSettingsForm /></Form>
      </Provider>
    )

    expect(await screen.findByRole('radio', { name: /ACCEPT/ })).toBeVisible()
    expect(await screen.findByRole('radio', { name: /Unlimited/ })).toBeVisible()

    await userEvent.click(await screen.findByRole('combobox', { name: /Access Policy Set/ }))
    expect(await screen.findByText(mockedPolicySet.content[0].name)).toBeInTheDocument()
  })
})
