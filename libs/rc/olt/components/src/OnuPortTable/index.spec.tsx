import userEvent     from '@testing-library/user-event'
import { cloneDeep } from 'lodash'
// import { rest }      from 'msw'

import { OltOnuPort, OltFixtures }            from '@acx-ui/olt/utils'
import { Provider }                           from '@acx-ui/store'
import { screen, render, within, mockServer } from '@acx-ui/test-utils'

import { OnuPortTable } from './'

const { mockOlt, mockOltCageList, mockOnuList } = OltFixtures

jest.mock('./TextInlineEditor', () => ({
  TextInlineEditor: (props: { value: number, onChange: (data: number) => Promise<void> }) =>
    <div data-testid='TextInlineEditor'>
      <div data-testid='value'>{props.value}</div>
      <button onClick={async () => props.onChange(12)}>Test onChange</button>
    </div>
}))
describe('OnuPortTable', () => {
  const mockCageName = mockOltCageList[0].cage
  const mockOnuName = mockOnuList[0].name
  const mockPortList = mockOnuList[0].portDetails as OltOnuPort[]

  it('renders with valid props', () => {
    const props = {
      data: mockPortList,
      oltDetails: mockOlt,
      cageName: mockCageName,
      onuName: mockOnuName
    }
    render(<Provider>
      <OnuPortTable {...props} />
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
      oltDetails: mockOlt
    }
    render(<Provider>
      <OnuPortTable {...props} />
    </Provider>)
    expect(screen.getByText('Port')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  xit('should correctly handle VLAN change', async () => {
    const mockSetVlanReq = jest.fn()
    mockServer.use(
    )

    const props = {
      data: mockPortList,
      oltDetails: mockOlt,
      cageName: mockCageName,
      onuName: mockOnuName
    }

    render(<Provider>
      <OnuPortTable {...props} />
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
      oltDetails: mockOlt,
      cageName: mockCageName,
      onuName: mockOnuName
    }
    render(<Provider>
      <OnuPortTable {...props} />
    </Provider>)
    expect(screen.getByText('Port')).toBeVisible()
    expect(screen.getByText('Status')).toBeVisible()
    const targetRow= screen.getByRole('row', { name: /1 UP 5% \(2.5 \/ 50 W\)/ })
    expect(within(within(targetRow).getByTestId('TextInlineEditor'))
      .getByTestId('value')).toHaveTextContent('0')
  })

  it('translate vlan to 0 when it is undefined', () => {
    const mockInvalidVlanData = mockOnuList[1].portDetails as OltOnuPort[]

    const props = {
      data: mockInvalidVlanData,
      oltDetails: mockOlt,
      cageName: mockCageName,
      onuName: mockOnuName
    }
    render(<Provider>
      <OnuPortTable {...props} />
    </Provider>)
    expect(screen.getByText('Port')).toBeVisible()
    expect(screen.getByText('Status')).toBeVisible()
    const targetRow= screen.getByRole('row', { name: /1 DOWN 0% \(0 \/ 50 W\)/ })
    expect(within(within(targetRow).getByTestId('TextInlineEditor'))
      .getByTestId('value')).toHaveTextContent('0')
  })
})