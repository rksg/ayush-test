import userEvent, { PointerEventsCheckLevel } from '@testing-library/user-event'

import { Features }                                                  from '@acx-ui/feature-toggle'
import { EdgeLagFixtures, EdgePortConfigFixtures, VirtualIpSetting } from '@acx-ui/rc/utils'
import { render, screen, within }                                    from '@acx-ui/test-utils'
import { EdgeScopes, SwitchScopes, WifiScopes }                      from '@acx-ui/types'
import { getUserProfile, setUserProfile }                            from '@acx-ui/user'

import { useIsEdgeFeatureReady } from '../useEdgeActions'

import { EdgeLagTable } from '.'

const { mockedEdgeLagList, mockEdgeLagStatusList } = EdgeLagFixtures
const { mockEdgePortConfig } = EdgePortConfigFixtures

jest.mock('./LagDrawer', () => ({
  ...jest.requireActual('./LagDrawer'),
  LagDrawer: () => <div data-testid='LagDrawer' />
}))

jest.mock('../useEdgeActions', () => ({
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
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

  describe('ABAC permission', () => {
    it('should dispaly with custom scopeKeys', async () => {
      setUserProfile({
        allowedOperations: [],
        profile: {
          ...getUserProfile().profile
        },
        abacEnabled: true,
        isCustomRole: true,
        scopes: [EdgeScopes.READ, EdgeScopes.UPDATE, SwitchScopes.READ, WifiScopes.READ]
      })

      render(
        <EdgeLagTable
          lagList={mockedEdgeLagList.content}
          lagStatusList={mockEdgeLagStatusList.data}
          portList={mockEdgePortConfig.ports}
          onAdd={async () => {}}
          onEdit={async () => {}}
          onDelete={async () => {}}
          actionScopes={{
            add: [EdgeScopes.UPDATE],
            edit: [EdgeScopes.UPDATE],
            delete: [EdgeScopes.UPDATE]
          }}
        />)

      expect(screen.getByTestId('LagDrawer')).toBeVisible()
      const row = await screen.findByRole('row', { name: /LAG 1/i })
      expect(screen.queryByRole('button', { name: 'Add LAG' })).toBeValid()
      await userEvent.click(within(row).getByRole('radio'))
      expect(screen.queryByRole('button', { name: 'Edit' })).toBeValid()
      expect(screen.queryByRole('button', { name: 'Delete' })).toBeValid()
    })

    it('should correctly hide with custom scopeKeys', async () => {
      setUserProfile({
        allowedOperations: [],
        profile: {
          ...getUserProfile().profile
        },
        abacEnabled: true,
        isCustomRole: true,
        scopes: [EdgeScopes.READ, EdgeScopes.CREATE, SwitchScopes.READ, WifiScopes.READ]
      })

      render(
        <EdgeLagTable
          lagList={mockedEdgeLagList.content}
          lagStatusList={mockEdgeLagStatusList.data}
          portList={mockEdgePortConfig.ports}
          onAdd={async () => {}}
          onEdit={async () => {}}
          onDelete={async () => {}}
          actionScopes={{
            add: [EdgeScopes.UPDATE],
            edit: [EdgeScopes.UPDATE],
            delete: [EdgeScopes.UPDATE]
          }}
        />)

      expect(screen.getByTestId('LagDrawer')).toBeVisible()
      const row = await screen.findByRole('row', { name: /LAG 1/i })
      expect(screen.queryByRole('button', { name: 'Add LAG' })).toBeNull()
      expect(within(row).queryByRole('radio')).toBeNull()
    })
  })

  describe('Core Access', () => {
    beforeEach(() => {
      // eslint-disable-next-line max-len
      jest.mocked(useIsEdgeFeatureReady).mockImplementation(ff => ff === Features.EDGE_CORE_ACCESS_SEPARATION_TOGGLE)
    })

    afterEach(() => {
      jest.mocked(useIsEdgeFeatureReady).mockReset()
    })

    it('should show core port and access port column when FF is on', async () => {
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

      expect(screen.getByRole('columnheader', { name: 'Core Port' })).toBeVisible()
      expect(screen.getByRole('columnheader', { name: 'Access Port' })).toBeVisible()
    })
  })
})