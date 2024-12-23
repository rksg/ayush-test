import { fireEvent, within } from '@testing-library/react'
import userEvent             from '@testing-library/user-event'
import { Form }              from 'antd'

import { ActionType }                 from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { render, renderHook, screen } from '@acx-ui/test-utils'

import { DataPromptSettings } from './DataPromptSettings'


describe('DataPromptSettings', () => {
  it('should render the form with default values', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue('variables', [{ type: 'USER_NAME', label: 'Username' }])
      return form
    })
    render(
      <Provider>
        <Form form={formRef.current}>
          <DataPromptSettings />
        </Form>
      </Provider>
    )
    const generatedName = formRef.current.getFieldValue('name')
    expect(generatedName.split('-')[0]).toBe(ActionType.DATA_PROMPT)
    expect(screen.getByText('Title')).toBeVisible()
    expect(screen.getByText('Intro text')).toBeVisible()
    expect(screen.queryByTestId('field0')).toBeVisible()
    expect(screen.getByText('Field 1')).toBeVisible()
    expect(screen.getByText('Label')).toBeVisible()
    expect(screen.getByRole('textbox', { name: /Label/ })).toHaveValue('Username')
    expect(screen.getByText('Field Type')).toBeVisible()
    expect(screen.getByTitle('Username')).toBeVisible()
    expect(screen.getByDisplayValue('Username')).toBeVisible()
  })

  it('should show/hide title when toggling title switch', () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue('displayTitle', true)
      return form
    })
    render(
      <Provider>
        <Form form={formRef.current}>
          <DataPromptSettings />
        </Form>
      </Provider>
    )
    expect(screen.getByTestId('title')).toBeVisible()
    userEvent.click(screen.getByTestId('switch-title'))
    expect(screen.getByTestId('title')).toBeEmptyDOMElement()
    userEvent.click(screen.getByTestId('switch-title'))
    expect(screen.getByTestId('title')).toBeVisible()
  })

  it('should show/hide messageHtml when toggling messageHtml switch', () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue('displayMessageHtml', true)
      return form
    })
    render(
      <Provider>
        <Form form={formRef.current}>
          <DataPromptSettings />
        </Form>
      </Provider>
    )
    expect(screen.getByTestId('messageHtml')).toBeVisible()
    userEvent.click(screen.getByTestId('switch-messageHtml'))
    expect(screen.getByTestId('messageHtml')).toBeEmptyDOMElement()
    userEvent.click(screen.getByTestId('switch-messageHtml'))
    expect(screen.getByTestId('messageHtml')).toBeVisible()
  })

  it('should adds field when clicking add button',async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue('variables', [{ type: 'USER_NAME', label: 'Username' }])
      return form
    })
    render(
      <Provider>
        <Form form={formRef.current}>
          <DataPromptSettings />
        </Form>
      </Provider>
    )

    expect(screen.queryByTestId('field1')).toBeFalsy()
    expect(screen.queryByText('Field 2')).toBeFalsy()
    const addFieldButton = screen.getByRole('button', { name: 'Add Field' })
    expect(addFieldButton).toBeVisible()
    await userEvent.click(addFieldButton)
    const field1 = await screen.findByTestId('field1')
    expect(field1).toBeTruthy()
    expect(within(field1).getByText('Field 2')).toBeVisible()
    expect(within(field1).getByText('Label')).toBeVisible()
    expect(within(field1).getByText('Field Type')).toBeVisible()
    expect(within(field1).getByTestId('btn-remove_1')).toBeVisible()
  })

  it('should validate duplicate type',async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue('variables', [{ type: 'USER_NAME', label: 'Username' },
        { type: 'USER_NAME', label: 'Username1' }
      ])
      form.setFieldValue('displayTitle', true)
      form.setFieldValue('displayMessageHtml', true)
      return form
    })
    render(
      <Provider>
        <Form form={formRef.current}>
          <DataPromptSettings />
        </Form>
      </Provider>
    )
    expect(screen.queryByTestId('field0')).toBeVisible()
    expect(screen.queryByTestId('field1')).toBeVisible()
    formRef.current.submit()
    expect(await screen.findByText('Please enter title')).toBeVisible()
    expect(await screen.findByText('Please enter page intro text')).toBeVisible()
    const nodes = await screen.findAllByText('Field type already selected')
    expect(nodes).toHaveLength(2)
    expect(nodes[0]).toBeVisible()
    expect(nodes[1]).toBeVisible()
  })
  it('should validate the fields minimum length', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue('variables', [{ type: 'USER_NAME', label: '' }])
      form.setFieldValue('displayTitle', true)
      form.setFieldValue('displayMessageHtml', true)
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <DataPromptSettings />
        </Form>
      </Provider>
    )

    expect(screen.getByTestId('title')).toHaveValue('')
    expect(screen.getByTestId('messageHtml')).toHaveValue('')
    const labelInput = await screen.findByRole('textbox', { name: /Label/ })
    expect(labelInput).toHaveValue('')

    formRef.current.submit()
    expect(await screen.findByText('Please enter title')).toBeVisible()
    expect(await screen.findByText('Please enter page intro text')).toBeVisible()
    expect(await screen.findByText('Please enter Label')).toBeVisible()
  })

  it('should validate no leading or trailing spaces allowed', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue('displayTitle', true)
      form.setFieldValue('displayMessageHtml', true)
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <DataPromptSettings />
        </Form>
      </Provider>
    )

    const pageTitleInput = screen.getByTestId('title')
    expect(pageTitleInput).toHaveValue('')

    const pageBodyInput =screen.getByTestId('messageHtml')
    expect(pageBodyInput).toHaveValue('')

    fireEvent.change(pageTitleInput, { target: { value: '  ' } })

    formRef.current.submit()

    expect(await screen.findByText('No leading or trailing spaces allowed')).toBeVisible()

    fireEvent.change(pageTitleInput, { target: { value: 'a real value' } })
    fireEvent.change(pageBodyInput, { target: { value: '  ' } })

    formRef.current.submit()

    expect(await screen.findByText('No leading or trailing spaces allowed')).toBeVisible()
  })

  it('should validate values that are too long', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue('displayTitle', true)
      form.setFieldValue('displayMessageHtml', true)
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <DataPromptSettings />
        </Form>
      </Provider>
    )

    const pageTitleInput = screen.getByTestId('title')
    expect(pageTitleInput).toHaveValue('')

    const pageBodyInput =screen.getByTestId('messageHtml')
    expect(pageBodyInput).toHaveValue('')

    fireEvent.change(pageTitleInput, { target: { value: 'Longer Than 100 Characters #############'
      + '#################################################################' } })
    fireEvent.change(pageBodyInput, { target: { value: 'Longer Than 1000 Characters #########'
      + '##################################################Longer Than 1000 Characters ##########'
      + '####################################################################Longer Than 1000 '
      + 'Characters ##############################################################################'
      + 'Longer Than 1000 Characters ##############################################################'
      + '################Longer Than 1000 Characters ##############################################'
      + '################################Longer Than 1000 Characters #############################'
      + '#################################################Longer Than 1000 Characters ############'
      + '##################################################################Longer Than 1000 Charact'
      + 'ers ##############################################################################Longer '
      + 'Than 1000 Characters ####################################################################'
      + '##########Longer Than 1000 Characters ###################################################'
      + '##############################################' } })

    expect(await screen.findByText('title must be up to 100 characters')).toBeVisible()
    expect(await screen.findByText('messageHtml must be up to 1000 characters')).toBeVisible()
  })

})
