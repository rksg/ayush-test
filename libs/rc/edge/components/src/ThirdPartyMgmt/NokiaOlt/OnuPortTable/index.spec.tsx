import userEvent from '@testing-library/user-event'

import { screen, render, within } from '@acx-ui/test-utils'

import { EdgeNokiaOnuPortTable } from './'

jest.mock('./TextInlineEditor', () => ({
  TextInlineEditor: (props: { value: number, onChange: (data: number) => void }) =>
    <div data-test='TextInlineEditor'>
      <div data-test='value'>{props.value}</div>
      <button onClick={() => props.onChange(12)}>Test onChange</button>
    </div>
}))
describe('EdgeNokiaOnuPortTable', () => {
  it('renders with valid props', () => {
    const props = {
      data: [
        { status: 'up', vlan: ['3', '2'] },
        { status: 'down', vlan: [] },
        { status: 'up', vlan: ['6'] }
      ]
    }
    render(<EdgeNokiaOnuPortTable {...props} />)
    expect(screen.getByText('Port')).toBeVisible()
    expect(screen.getByText('Status')).toBeVisible()
    screen.getByRole('row', { name: /UP 3/ })
    screen.getByRole('row', { name: /DOWN 0/ })
    expect(screen.getByRole('row', { name: /UP 6/ })).toBeVisible()
  })

  it('renders with empty data', () => {
    const props = {
      data: []
    }
    render(<EdgeNokiaOnuPortTable {...props} />)
    expect(screen.getByText('Port')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('should correctly handle VLAN change', async () => {
    const props = {
      data: [
        { status: 'up', vlan: ['7'] },
        { status: 'down', vlan: [] }
      ]
    }
    render(<EdgeNokiaOnuPortTable {...props} />)
    const row = screen.getByRole('row', { name: /7/ })
    screen.getByRole('row', { name: /DOWN 0/ })
    const onChangeButton = within(row).getByRole('button', { name: 'Test onChange' })
    await userEvent.click(onChangeButton)
  })
})