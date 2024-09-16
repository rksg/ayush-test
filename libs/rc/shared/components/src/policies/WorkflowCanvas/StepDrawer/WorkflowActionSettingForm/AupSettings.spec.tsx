import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { ActionType, AupActionContext, WorkflowUrls } from '@acx-ui/rc/utils'
import { Provider }                                   from '@acx-ui/store'
import { mockServer, render, renderHook, screen }     from '@acx-ui/test-utils'

import { AupSettings } from './AupSettings'


const uploadFile = jest.fn()

const deleteFile = jest.fn()

describe('AupSettings', () => {

  beforeEach(() => {
    mockServer.use(rest.get(WorkflowUrls.uploadFile.url, (req, res, ctx) => {
      uploadFile()
      return res(ctx.json('{url: 7c1a1cb9-548c-446e-b4dc-07d498759d9b-text.docs}'))
    }), rest.get(WorkflowUrls.deleteFile.url, () => {
      deleteFile()
    }))
  })

  it('should render the form with default values', async () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      return form
    })

    render(<Provider>
      <Form form={formRef.current}>
        <AupSettings/>
      </Form>
    </Provider>)

    const pageTitleInput = await screen.findByRole('textbox', { name: /Title/ })
    expect(pageTitleInput).toHaveValue('')

    const pageBodyInput = await screen.findByRole('textbox', { name: /Message/ })
    expect(pageBodyInput).toHaveValue('')

    const generatedName = formRef.current.getFieldValue('name')
    expect(generatedName.split('-')[0]).toBe(ActionType.AUP)

    const policy = screen.getByText('Policy Content')
    expect(policy).toBeInTheDocument()

    const uploadFile = screen.getByText('Upload file instead')
    expect(uploadFile).toBeInTheDocument()
  })

  it('should render the from the aupAction config in edit mode', async () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm<AupActionContext>()
      form.setFieldsValue({
        title: 'Policy',
        messageHtml: 'Message to user',
        checkboxText: 'Agree terms and conditions',
        backButtonText: 'back',
        continueButtonText: 'continue',
        bottomLabel: 'label',
        checkboxDefaultState: true,
        checkboxHighlightColor: '#FFFFFF',
        useAupFile: true,
        aupFileLocation: '7c1a1cb9-548c-446e-b4dc-07d498759d9b-text.docs',
        aupFileName: 'text.docs',
        aupPlainText: ''
      })
      return form

    })

    render(<Provider>
      <Form form={formRef.current}>
        <AupSettings/>
      </Form>
    </Provider>)

    const pageTitleInput = await screen.findByRole('textbox', { name: /Title/ })
    expect(pageTitleInput).toHaveValue('Policy')

    const pageBodyInput = await screen.findByRole('textbox', { name: /Message/ })
    expect(pageBodyInput).toHaveValue('Message to user')

    const generatedName = formRef.current.getFieldValue('name')
    expect(generatedName.split('-')[0]).toBe(ActionType.AUP)

    const policy = screen.getByText('Policy Content')
    expect(policy).toBeInTheDocument()

    const fileName = screen.getByText('text.docs')
    expect(fileName).toBeInTheDocument()

    const pasteText = screen.getByText('Paste text instead')
    expect(pasteText).toBeInTheDocument()

  })

  it('should render the from the aupAction config in edit mode with policy text', async () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm<AupActionContext>()
      form.setFieldsValue({
        title: 'Policy',
        messageHtml: 'Message to user',
        checkboxText: 'Agree terms and conditions',
        backButtonText: 'back',
        continueButtonText: 'continue',
        bottomLabel: 'label',
        checkboxDefaultState: true,
        checkboxHighlightColor: '#FFFFFF',
        useAupFile: false,
        aupFileLocation: '',
        aupFileName: '',
        aupPlainText: 'You may agree to the policy to go ahead'
      })
      return form

    })

    render(<Provider>
      <Form form={formRef.current}>
        <AupSettings/>
      </Form>
    </Provider>)

    const pageTitleInput = await screen.findByRole('textbox', { name: /Title/ })
    expect(pageTitleInput).toHaveValue('Policy')

    const pageBodyInput = await screen.findByRole('textbox', { name: /Message/ })
    expect(pageBodyInput).toHaveValue('Message to user')

    const generatedName = formRef.current.getFieldValue('name')
    expect(generatedName.split('-')[0]).toBe(ActionType.AUP)

    const policy = screen.getByText('Policy Content')
    expect(policy).toBeInTheDocument()

    const uploadFile = screen.getByText('Upload file instead')
    expect(uploadFile).toBeInTheDocument()

    const policyText = screen.getByText('You may agree to the policy to go ahead')
    expect(policyText).toBeInTheDocument()

  })


  it('should validate user input length', async () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      return form
    })

    render(<Provider>
      <Form form={formRef.current}>
        <AupSettings/>
      </Form>
    </Provider>)

    const pageTitleInput = await screen.findByRole('textbox', { name: /Title/ })
    expect(pageTitleInput).toHaveValue('')

    const pageBodyInput = await screen.findByRole('textbox', { name: /Message/ })
    expect(pageBodyInput).toHaveValue('')

    const generatedName = formRef.current.getFieldValue('name')
    expect(generatedName.split('-')[0]).toBe(ActionType.AUP)

    await userEvent.type(pageTitleInput, 'Longer Than 100 Characters ###########################' +
      '###################################################')
    await userEvent.type(pageBodyInput, 'Longer Than 1000 Characters ############################' +
      '##################################################Longer Than 1000 Characters ##########' +
      '####################################################################Longer Than 1000 ' +
      'Characters ##############################################################################' +
      'Longer Than 1000 Characters ##############################################################' +
      '################Longer Than 1000 Characters ##############################################' +
      '################################Longer Than 1000 Characters #############################' +
      '#################################################Longer Than 1000 Characters ############' +
      '##################################################################Longer Than 1000 Charact' +
      'ers ##############################################################################Longer ' +
      'Than 1000 Characters ####################################################################' +
      '##########Longer Than 1000 Characters ###################################################' +
      '###########################')

    formRef.current.validateFields()

    expect(await screen.findByText('Title must be up to 100 characters')).toBeVisible()
    expect(await screen.findByText('Message must be up to 1000 characters')).toBeVisible()

  })

  it('Should switch between policy option', async () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      return form
    })

    render(<Provider>
      <Form form={formRef.current}>
        <AupSettings/>
      </Form>
    </Provider>)

    const uploadFileMessage = screen.getByText('Upload file instead')
    await userEvent.click(uploadFileMessage)
    expect(await screen.findByText('Paste text instead')).toBeVisible()

    const fileContent = screen.getByText('Paste text instead')
    await userEvent.click(fileContent)
    expect(await screen.findByText('Upload file instead')).toBeVisible()

  })

  it('Should be accept text policy content', async () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm<AupActionContext>()
      form.setFieldsValue({
        useAupFile: false
      })
      return form
    })

    render(<Provider>
      <Form form={formRef.current}>
        <AupSettings />
      </Form>
    </Provider>)
    const uploadFileMessage = screen.getByText('Upload file instead')
    expect(uploadFileMessage).toBeInTheDocument()
    const policyContent = await screen.findByTestId('policy-text')
    await userEvent.type(policyContent,'all is well')
  })

})
