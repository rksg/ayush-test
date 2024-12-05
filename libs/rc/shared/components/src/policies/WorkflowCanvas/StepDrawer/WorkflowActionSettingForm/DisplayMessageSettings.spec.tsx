import { Form } from 'antd'

import { ActionType }                            from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { fireEvent, render, renderHook, screen } from '@acx-ui/test-utils'

import { DisplayMessageSetting } from './DisplayMessageSettings'

describe('DisplayMessageSettings', () => {
  it('should render the form with default values', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <DisplayMessageSetting />
        </Form>
      </Provider>
    )

    const pageTitleInput = await screen.findByRole('textbox', { name: /Page Title/ })
    expect(pageTitleInput).toHaveValue('')

    const pageBodyInput = await screen.findByRole('textbox', { name: /Page Body Text/ })
    expect(pageBodyInput).toHaveValue('')

    const generatedName = formRef.current.getFieldValue('name')
    expect(generatedName.split('-')[0]).toBe(ActionType.DISPLAY_MESSAGE)
  })

  it.skip('should validate values that are too long', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <DisplayMessageSetting />
        </Form>
      </Provider>
    )

    const pageTitleInput = await screen.findByRole('textbox', { name: /Page Title/ })
    expect(pageTitleInput).toHaveValue('')

    const pageBodyInput = await screen.findByRole('textbox', { name: /Page Body Text/ })
    expect(pageBodyInput).toHaveValue('')

    const generatedName = formRef.current.getFieldValue('name')
    expect(generatedName.split('-')[0]).toBe(ActionType.DISPLAY_MESSAGE)

    fireEvent.change(pageTitleInput, { target: { value: 'Longer Than 100 Characters ##############'
      + '################################################################' } })
    fireEvent.change(pageBodyInput, { target: { value: 'Longer Than 1000 Characters ##############'
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
      + '#########################################' } })


    expect(await screen.findByText('Page Title must be up to 100 characters')).toBeVisible()
    expect(await screen.findByText('Page Body Text must be up to 1000 characters')).toBeVisible()

  })

  it('should validate the fields minimum length', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <DisplayMessageSetting />
        </Form>
      </Provider>
    )

    const pageTitleInput = await screen.findByRole('textbox', { name: /Page Title/ })
    expect(pageTitleInput).toHaveValue('')

    const pageBodyInput = await screen.findByRole('textbox', { name: /Page Body Text/ })
    expect(pageBodyInput).toHaveValue('')

    const generatedName = formRef.current.getFieldValue('name')
    expect(generatedName.split('-')[0]).toBe(ActionType.DISPLAY_MESSAGE)

    formRef.current.submit()

    expect(await screen.findByText('Please enter Page Title')).toBeVisible()
    expect(await screen.findByText('Please enter Page Body Text')).toBeVisible()
  })

  it.skip('should validate no leading or trailing spaces allowed', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <DisplayMessageSetting />
        </Form>
      </Provider>
    )

    const pageTitleInput = await screen.findByRole('textbox', { name: /Page Title/ })
    expect(pageTitleInput).toHaveValue('')

    const pageBodyInput = await screen.findByRole('textbox', { name: /Page Body Text/ })
    expect(pageBodyInput).toHaveValue('')

    const generatedName = formRef.current.getFieldValue('name')
    expect(generatedName.split('-')[0]).toBe(ActionType.DISPLAY_MESSAGE)

    fireEvent.change(pageTitleInput, { target: { value: '  ' } })

    formRef.current.submit()

    expect(await screen.findByText('No leading or trailing spaces allowed')).toBeVisible()

    fireEvent.change(pageTitleInput, { target: { value: 'a real value' } })
    fireEvent.change(pageBodyInput, { target: { value: '  ' } })

    formRef.current.submit()

    expect(await screen.findByText('No leading or trailing spaces allowed')).toBeVisible()
  })


})
