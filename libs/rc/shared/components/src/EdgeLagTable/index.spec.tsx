import { EdgeLagFixtures, EdgePortConfigFixtures } from '@acx-ui/rc/utils'
import { render, screen }                          from '@acx-ui/test-utils'

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
})