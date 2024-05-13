import userEvent, { PointerEventsCheckLevel } from '@testing-library/user-event'

import { EdgeLagFixtures, EdgePortConfigFixtures, VirtualIpSetting } from '@acx-ui/rc/utils'
import { render, screen, within }                                    from '@acx-ui/test-utils'

import { EdgeLagTable } from '.'

const { mockedEdgeLagList, mockEdgeLagStatusList } = EdgeLagFixtures
const { mockEdgePortConfig } = EdgePortConfigFixtures

jest.mock('./LagDrawer', () => ({
  ...jest.requireActual('./LagDrawer'),
  LagDrawer: () => <div data-testid='LagDrawer' />
}))

describe('EdgeLagTable', () => {
  it('should correctly render', async () => {
    render(
      <EdgeLagTable
        lagList={mockedEdgeLagList.content}
        lagStatusList={mockEdgeLagStatusList.data}
        portList={mockEdgePortConfig.ports}
        onAdd={async () => {}}
        onEdit={async () => {}}
        onDelete={async () => {}}
      />
    )

    expect(screen.getByTestId('LagDrawer')).toBeVisible()
    expect(await screen.findByRole('row', { name: /LAG 1/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: /LAG 2/i })).toBeVisible()
  })

  it('should disable the "Delete" button when the interface set as a VRRP interface', async () => {
    render(
      <EdgeLagTable
        serialNumber='test-edge'
        lagList={mockedEdgeLagList.content}
        lagStatusList={mockEdgeLagStatusList.data}
        portList={mockEdgePortConfig.ports}
        vipConfig={[{
          ports: [{
            serialNumber: 'test-edge',
            portName: 'lag2'
          }]
        }] as VirtualIpSetting[]}
        onAdd={async () => {}}
        onEdit={async () => {}}
        onDelete={async () => {}}
      />
    )

    const lag2Row = await screen.findByRole('row', { name: /LAG 2/i })
    expect(lag2Row).toBeVisible()
    await userEvent.click(within(lag2Row).getByRole('radio'))
    const deleteButton = await screen.findByRole('button', { name: 'Delete' })
    expect(deleteButton).toBeDisabled()
    await userEvent.hover(deleteButton, {
      pointerEventsCheck: PointerEventsCheckLevel.Never
    })
    // eslint-disable-next-line max-len
    expect(await screen.findByText('The LAG configured as VRRP interface cannot be deleted')).toBeInTheDocument()
  })
})