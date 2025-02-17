import userEvent     from '@testing-library/user-event'
import { cloneDeep } from 'lodash'
import { rest }      from 'msw'

import { EdgeNokiaOnuPortData, EdgeOltFixtures, EdgeTnmServiceUrls } from '@acx-ui/rc/utils'
import { Provider }                                                  from '@acx-ui/store'
import { screen, render, within, mockServer }                        from '@acx-ui/test-utils'

import { EdgeNokiaOnuPortTable } from './'

const { mockOlt, mockOltCageList, mockOnuList } = EdgeOltFixtures

jest.mock('./TextInlineEditor', () => ({
  TextInlineEditor: (props: { value: number, onChange: (data: number) => Promise<void> }) =>
    <div data-testid='TextInlineEditor'>
      <div data-testid='value'>{props.value}</div>
      <button onClick={async () => props.onChange(12)}>Test onChange</button>
    </div>
}))
describe('EdgeNokiaOnuPortTable', () => {
  const mockCageName = mockOltCageList[0].cage
  const mockOnuName = mockOnuList[0].name
  const mockPortList = mockOnuList[0].portDetails as EdgeNokiaOnuPortData[]

  it('renders with valid props', () => {
    const props = {
      data: mockPortList,
      oltData: mockOlt,
      cageName: mockCageName,
      onuName: mockOnuName
    }
    render(<Provider>
      <EdgeNokiaOnuPortTable {...props} />
    </Provider>)
    expect(screen.getByText('Port')).toBeVisible()
    expect(screen.getByText('Status')).toBeVisible()
    screen.getByRole('row', { name: /1 UP 5% \(2.5 \/ 50 W\)/ })
    screen.getByRole('row', { name: /2 DOWN 20% \(10 \/ 50 W\)/ })
    expect(screen.getByRole('row', { name: /3 UP 6% \(3 \/ 50 W\)/ })).toBeVisible()
  })

  it('renders with empty data', () => {
    const props = {
      data: [],
      oltData: mockOlt
    }
    render(<Provider>
      <EdgeNokiaOnuPortTable {...props} />
    </Provider>)
    expect(screen.getByText('Port')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('should correctly handle VLAN change', async () => {
    const mockSetVlanReq = jest.fn()
    mockServer.use(
      rest.put(
        EdgeTnmServiceUrls.setEdgeOnuPortVlan.url,
        (_, res, ctx) => {
          mockSetVlanReq()
          return res(ctx.status(202))
        }))

    const props = {
      data: mockPortList,
      oltData: mockOlt,
      cageName: mockCageName,
      onuName: mockOnuName
    }

    render(<Provider>
      <EdgeNokiaOnuPortTable {...props} />
    </Provider>)
    const row = screen.getByRole('row', { name: /DOWN/ })
    const onChangeButton = within(row).getByRole('button', { name: 'Test onChange' })
    await userEvent.click(onChangeButton)
    expect(mockSetVlanReq).toBeCalled()
  })

  it('translate vlan to 0 when it is invalid string number', () => {
    const mockInvalidVlanData = cloneDeep(mockPortList)
    mockInvalidVlanData[0].vlan = ['test']

    const props = {
      data: mockInvalidVlanData,
      oltData: mockOlt,
      cageName: mockCageName,
      onuName: mockOnuName
    }
    render(<Provider>
      <EdgeNokiaOnuPortTable {...props} />
    </Provider>)
    expect(screen.getByText('Port')).toBeVisible()
    expect(screen.getByText('Status')).toBeVisible()
    const targetRow= screen.getByRole('row', { name: /1 UP 5% \(2.5 \/ 50 W\)/ })
    expect(within(within(targetRow).getByTestId('TextInlineEditor'))
      .getByTestId('value')).toHaveTextContent('0')
  })

  it('translate vlan to 0 when it is undefined', () => {
    const mockInvalidVlanData = mockOnuList[1].portDetails as EdgeNokiaOnuPortData[]

    const props = {
      data: mockInvalidVlanData,
      oltData: mockOlt,
      cageName: mockCageName,
      onuName: mockOnuName
    }
    render(<Provider>
      <EdgeNokiaOnuPortTable {...props} />
    </Provider>)
    expect(screen.getByText('Port')).toBeVisible()
    expect(screen.getByText('Status')).toBeVisible()
    const targetRow= screen.getByRole('row', { name: /1 DOWN 0% \(0 \/ 50 W\)/ })
    expect(within(within(targetRow).getByTestId('TextInlineEditor'))
      .getByTestId('value')).toHaveTextContent('0')
  })
})