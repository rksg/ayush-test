import { Form } from 'antd'

import { EdgeDualWanFixtures, EdgeMultiWanModeEnum, EdgeWanMember } from '@acx-ui/rc/utils'
import { render, screen }                                           from '@acx-ui/test-utils'

import { DualWanSettingsForm, DualWanSettingsFormProps } from './DualWanSettingsForm'
const { mockDualWanData } = EdgeDualWanFixtures

jest.mock('./WanPriorityTable', () => ({
  WanPriorityTable: (props: {
      data?: EdgeWanMember[],
      onChange?: (data: EdgeWanMember[]) => void
    }) =>
    <div data-testid='WanPriorityTable'>
      {props.data && <p>{JSON.stringify(props.data)}</p>}
    </div>
}))

type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string) => void
  options?: Array<{ label: string, value: unknown }>
  loading?: boolean
  dropdownClassName?: string
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({
    loading, children, onChange, options, dropdownClassName, ...props
  }: MockSelectProps) => (
    <select {...props} onChange={(e) => onChange?.(e.target.value)}>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      {children ? children : ''}
    </select>
  )
  Select.Option = 'option'
  return { ...components, Select }
})

const MockComponent = (props: DualWanSettingsFormProps) => {
  return <Form initialValues={{ multiWanSettings: mockDualWanData }}>
    <DualWanSettingsForm nodeNameMapping={props.nodeNameMapping} />
  </Form>
}
describe('DualWanSettingsForm', () => {
  const nodeNameMapping = {
    'serialNumber-1': 'Node 1',
    'serialNumber-2': 'Node 2'
  }

  it('correctly render the dual-wan mode select', () => {
    render(<MockComponent nodeNameMapping={nodeNameMapping} />)
    const select = screen.getByLabelText('Dual-WAN Mode')
    expect(select).toBeInTheDocument()
    expect(select).toBeDisabled()
    // eslint-disable-next-line max-len
    expect(screen.getByRole('combobox', { name: 'Dual-WAN Mode' })).toHaveValue(EdgeMultiWanModeEnum.ACTIVE_BACKUP)
  })

  it('renders the WAN links management table', () => {
    render(<MockComponent nodeNameMapping={nodeNameMapping} />)
    expect(screen.getByText('WAN Links Management')).toBeInTheDocument()
    // eslint-disable-next-line max-len
    expect(screen.getByTestId('WanPriorityTable')).toHaveTextContent(JSON.stringify(mockDualWanData.wanMembers))
  })
})