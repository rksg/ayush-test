import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgePinUrls, EdgePinFixtures } from '@acx-ui/rc/utils'
import { Provider }                     from '@acx-ui/store'
import { mockServer, render, screen }   from '@acx-ui/test-utils'

import { AccessSwitchTable, AccessSwitchTableDataType } from './AccessSwitchTable'

const { mockPinSwitchInfoData, mockWebAuthList } = EdgePinFixtures
const accessSwitchData = mockPinSwitchInfoData.accessSwitches.map((as, idx) =>({
  ...as,
  distributionSwitchName: `DS-${idx}`
}))

describe('PersonalIdentityNetwork DetailTableGroup - AccessSwitchTable', () => {

  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgePinUrls.getWebAuthTemplateList.url,
        (_req, res, ctx) => res(ctx.json({ data: mockWebAuthList }))
      )
    )
  })

  it('Should render AccessSwitchTable successfully', async () => {
    render(<Provider>
      <AccessSwitchTable dataSource={accessSwitchData} />
    </Provider>
    )

    const rows = await screen.findAllByRole('row', { name: /FEK3224R09N---AS---3/i })
    expect(rows.length).toBe(1)
  })

  it('renders table with data and edit handler', async () => {
    const props = {
      dataSource: accessSwitchData,
      editHandler: jest.fn()
    }

    delete props.dataSource[0].vlanId
    render(<Provider><AccessSwitchTable {...props} /></Provider>)
    expect(screen.getByText('FEK3224R09N---AS---3')).toBeInTheDocument()
    expect(screen.getByText('ICX7150-C12P')).toBeInTheDocument()
    expect(await screen.findByText(mockWebAuthList[0].name)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button'))
    expect(props.editHandler).toHaveBeenCalledTimes(1)
  })

  it('renders table with data and no edit handler', async () => {
    const props = {
      dataSource: [
        {
          id: '1',
          name: 'Switch 1',
          model: 'Model 1',
          distributionSwitchId: '1',
          uplinkInfo: { uplinkId: '1' },
          vlanId: 222,
          templateId: mockWebAuthList[0].id,
          webAuthPageType: 'TEMPLATE'
        }
      ] as AccessSwitchTableDataType[]
    }

    render(<Provider><AccessSwitchTable {...props} /></Provider>)
    expect(screen.getByText('Switch 1')).toBeInTheDocument()
    expect(screen.getByText(props.dataSource[0].model!)).toBeInTheDocument()
    expect(screen.getByText(props.dataSource[0].vlanId+'')).toBeInTheDocument()
    await screen.findByText(mockWebAuthList[0].name)
  })

  it('renders column with different data types', () => {
    const props = {
      dataSource: [
        {
          id: '1',
          name: 'Switch 1',
          model: 'Model 1',
          distributionSwitchId: '1',
          uplinkInfo: { uplinkId: '1' },
          vlanId: 100,
          templateId: '1',
          webAuthPageType: 'TEMPLATE'
        },
        {
          id: '2',
          name: 'Switch 2',
          model: 'Model 2',
          distributionSwitchId: '2',
          uplinkInfo: null,
          vlanId: null,
          templateId: '2',
          webAuthPageType: 'USER_DEFINED'
        }
      ] as AccessSwitchTableDataType[]
    }

    render(<Provider><AccessSwitchTable {...props} /></Provider>)
    expect(screen.getByText('Switch 1')).toBeInTheDocument()
    expect(screen.getByText('Model 1')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('template')).toBeInTheDocument()

    expect(screen.getByText('Switch 2')).toBeInTheDocument()
    expect(screen.getByText('Model 2')).toBeInTheDocument()
    expect(screen.getByText('custom')).toBeInTheDocument()
  })

  it('renders templateId with different webAuthPageType values', () => {
    const props = {
      dataSource: [
        {
          id: '1',
          name: 'Switch 1',
          model: 'Model 1',
          distributionSwitchId: '1',
          distributionSwitchName: 'mocked-ds-1-name',
          uplinkInfo: { uplinkId: '1' },
          vlanId: 22,
          templateId: '1',
          webAuthPageType: 'TEMPLATE'
        },
        {
          id: '2',
          name: 'Switch 2',
          model: 'Model 2',
          distributionSwitchId: '2',
          distributionSwitchName: 'mocked-ds-2-name',
          uplinkInfo: null,
          vlanId: null,
          templateId: '2',
          webAuthPageType: 'USER_DEFINED'
        }
      ] as AccessSwitchTableDataType[]
    }

    render(<Provider><AccessSwitchTable {...props} /></Provider>)
    expect(screen.getByText('template')).toBeInTheDocument()
    expect(screen.getByText('custom')).toBeInTheDocument()
  })
})
