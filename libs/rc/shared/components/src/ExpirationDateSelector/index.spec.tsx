import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { ExpirationDateEntity, ExpirationType } from '@acx-ui/rc/utils'
import { act, render, renderHook, screen }      from '@acx-ui/test-utils'

import { ExpirationDateSelector } from '.'

describe('ExpirationDateSelector', () => {
  const mockedLabel = 'Expiration'
  const mockedInputName = 'expiration'

  it('should render the selector', async () => {
    const { asFragment } = render(
      <Form>
        <ExpirationDateSelector label={mockedLabel} />
      </Form>
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it('should render the selector with the given data', async () => {
    const expirationByDate: ExpirationDateEntity = new ExpirationDateEntity()
    expirationByDate.setToByDate('2022-12-01')

    const expirationAfterTime: ExpirationDateEntity = new ExpirationDateEntity()
    expirationAfterTime.setToAfterTime(ExpirationType.DAYS_AFTER_TIME, 2)

    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue(mockedInputName, expirationByDate)
      return form
    })

    // Verify expiration date - By date
    const { rerender } = render(
      <Form form={formRef.current}>
        <ExpirationDateSelector label={mockedLabel} inputName={mockedInputName} />
      </Form>
    )

    const selectDateElem = await screen.findByDisplayValue('12/01/2022')
    expect(selectDateElem).toBeInTheDocument()

    // Verify expiration date - After...
    rerender(
      <Form form={formRef.current}>
        <ExpirationDateSelector label={mockedLabel} inputName={mockedInputName} />
      </Form>
    )

    act(() => {
      formRef.current.resetFields()
      formRef.current.setFieldValue(mockedInputName, expirationAfterTime)
    })

    const afterTimeOffetElem = await screen.findByRole('spinbutton')
    expect(afterTimeOffetElem).toHaveValue(expirationAfterTime.offset!.toString())

    const afterTimeTypeElem = await screen.findByText('Days')
    expect(afterTimeTypeElem).toBeInTheDocument()
  })

  it('should get normalized date after selecting from the Datepicker', async () => {
    Date.now = jest.fn().mockReturnValue(new Date('2022-11-01T00:00:00.000Z'))

    const expirationByDate: ExpirationDateEntity = new ExpirationDateEntity()
    expirationByDate.setToByDate('2022-11-02')

    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue(mockedInputName, expirationByDate)
      return form
    })

    render(
      <Form form={formRef.current}>
        <ExpirationDateSelector label={mockedLabel} inputName={mockedInputName} />
      </Form>
    )

    const selectDateElem = await screen.findByDisplayValue('11/02/2022')

    await userEvent.click(selectDateElem)
    await userEvent.click(await screen.findByRole('cell', { name: /25/ }))

    await screen.findByDisplayValue('11/25/2022')
    const values = formRef.current.getFieldValue(mockedInputName)

    expect(values.date).toBe('2022-11-25T00:00:00.000Z')
  })
})
