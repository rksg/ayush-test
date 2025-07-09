import '@testing-library/jest-dom'
import userEvent        from '@testing-library/user-event'
import { Button, Form } from 'antd'

import {
  renderHook,
  render,
  screen,
  fireEvent
} from '@acx-ui/test-utils'

import { DraggableTagField }                  from './DraggableTagField'
import { DraggableTag, DraggableTagSelector } from './DraggableTagSelector'


const options = ['Option1', 'Option2', 'Option3', 'Option4']
const renderForm = () => {
  const { result: formRef } = renderHook(() => {
    const [ form ] = Form.useForm()
    return form
  })
  render (<Form
    form={formRef.current}
    onFinish={async (values: { name?: string, tags: DraggableTag[] }) => {
      console.log(values) // eslint-disable-line no-console
    }}
    labelCol={{ span: 2 }}
    wrapperCol={{ span: 10 }}
  >
    <Form.Item label='Tags'>
      <DraggableTagField
        name='tags'
        options={options}
        rules={[
          { required: true, message: 'Please select at least one tag' }
        ]}
        maxTags={8}
        customTags={{
          maxLength: 10
        }}
      />
    </Form.Item>

    <Form.Item wrapperCol={{ offset: 2, span: 10 }}>
      <Button type='primary' htmlType='submit'>Submit</Button>
    </Form.Item>

  </Form>)
}

describe('DraggableTagSelector', () => {
  it('should render correctly', async () => {
    render(
      <DraggableTagSelector
        options={options}
        maxTags={5}
        customTagRules={[]}
      />
    )
    expect((await screen.findByText(/Add attribute/))).toBeVisible()
  })
})

describe('DraggableTagField', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render correctly', async () => {
    render (<Form>
      <Form.Item label='Tags'>
        <DraggableTagField
          name='tags'
          options={options}
          maxTags={8}
          customTags={{}}
        />
      </Form.Item>
    </Form>)
    expect((await screen.findByText(/Add attribute/))).toBeVisible()
    expect(screen.queryByTestId('add-tag')).not.toBeInTheDocument()
  })

  it('should add tags correctly', async () => {
    jest.spyOn(console, 'log')
    // eslint-disable-next-line no-console
    const log = jest.mocked(console.log).mockImplementation(() => {})
    renderForm()

    expect((await screen.findByText(/Add attribute/))).toBeVisible()
    await userEvent.click(await screen.findByText(/Add attribute/))
    const opt1 = await screen.findAllByText(/Option1/)
    await userEvent.click(opt1[1])

    expect((await screen.findByText(/Option1/))).toBeVisible()
    expect((await screen.findByTestId('add-tag'))).toBeVisible()

    fireEvent.click(await screen.findByTestId('add-tag'))
    const opt2 = await screen.findAllByText(/Option2/)
    await userEvent.click(opt2[1])
    expect((await screen.findByText(/Option2/))).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: 'Submit' }))
    expect(log).toBeCalledWith(expect.objectContaining({
      tags: expect.arrayContaining([
        expect.objectContaining({
          value: 'Option1',
          isCustom: false,
          valid: true
        }),
        expect.objectContaining({
          value: 'Option2',
          isCustom: false,
          valid: true
        })
      ])
    }))
  })

  it('should remove tag correctly', async () => {
    renderForm()

    expect((await screen.findByText(/Add attribute/))).toBeVisible()
    await userEvent.click(await screen.findByText(/Add attribute/))
    const opt1 = await screen.findAllByText(/Option1/)
    await userEvent.click(opt1[1])

    expect((await screen.findByText(/Option1/))).toBeVisible()
    expect((await screen.findByTestId('add-tag'))).toBeVisible()

    await userEvent.click(await screen.findByTestId('close'))
    expect((await screen.findByText(/Please select at least one tag/))).toBeVisible()
  })

  it('should add custom tag correctly', async () => {
    renderForm()

    expect((await screen.findByText(/Add attribute/))).toBeVisible()
    await userEvent.click(await screen.findByText(/Add attribute/))
    expect((await screen.findAllByText(/Option1/))).toHaveLength(2)

    let input = await screen.findByRole('combobox')
    await userEvent.type(input, 'Custom')
    let opts = await screen.findAllByText(/Custom/)
    await userEvent.click(opts[2])

    expect((await screen.findByTestId('add-tag'))).toBeVisible()

    fireEvent.click(await screen.findByTestId('add-tag'))
    await userEvent.click(await screen.findByText(/Custom/))
    expect((await screen.findByTestId('add-tag'))).toBeVisible()
  })

  it('should validate custom tag correctly', async () => {
    renderForm()

    expect((await screen.findByText(/Add attribute/))).toBeVisible()
    await userEvent.click(await screen.findByText(/Add attribute/))
    expect((await screen.findAllByText(/Option1/))).toHaveLength(2)

    let input = await screen.findByRole('combobox')
    await userEvent.type(input, 'LongCustomTagName')
    let opts = await screen.findAllByText(/Custom/)
    await userEvent.click(opts[2])
    expect((await screen.findByText(/Up to 10 characters allowed per attribute/))).toBeVisible()
  })

})
