import { within } from '@testing-library/react'

import { ApDeviceStatusEnum, NewAPExtendedGrouped, NewAPModelExtended } from '@acx-ui/rc/utils'
import { render, screen }                                               from '@acx-ui/test-utils'

import { getGroupableConfig } from './newGroupByConfig'

const mockApData = {
  status: ApDeviceStatusEnum.OPERATIONAL,
  model: 'R550',
  apGroupName: 'TestGroup-01',
  aps: [
    {
      serialNumber: '193749002133',
      name: 'AP-1',
      apGroupId: '532e0f68fcff47b9a59c8f615f7fad23'
    },
    {
      serialNumber: '491749002332',
      name: 'UI-test-ap-1',
      apGroupId: '532e0f68fcff47b9a59c8f615f7fad23'
    }
  ],
  members: 2,
  incidents: 6,
  clients: 7,
  networks: {
    count: 8
  },
  networksInfo: {
    count: 8,
    // eslint-disable-next-line max-len
    names: ['Network1', 'Network2', 'Network3', 'Network4', 'Network5', 'Network6', 'Network7', 'Network8']
  }
} as NewAPModelExtended | NewAPExtendedGrouped

describe('newGroupByConfig', () => {
  it('should render group by status correctly', async () => {
    const { deviceStatusGroupableOptions } = getGroupableConfig()

    const statusAttributes = deviceStatusGroupableOptions.attributes
    const { rerender } = render(statusAttributes[0].renderer(mockApData))
    expect(screen.getByText('Operational')).toBeVisible()
    rerender(statusAttributes[1].renderer(mockApData))
    expect(screen.getByText('Venue:')).toBeVisible()
    rerender(statusAttributes[2].renderer(mockApData))
    expect(screen.getByText('Members: 2')).toBeVisible()
    rerender(statusAttributes[3].renderer(mockApData))
    expect(screen.getByText('Incidents (24 hours): 6')).toBeVisible()
    rerender(statusAttributes[4].renderer(mockApData))
    expect(screen.getByText('Connected Clients: 7')).toBeVisible()
    rerender(statusAttributes[5].renderer(mockApData))

    const wirelessNetworksElement = screen.getByText('Wireless Networks:')
    expect(wirelessNetworksElement).toBeVisible()
    const numberElement = within(wirelessNetworksElement).getByText('8')
    expect(numberElement).toBeVisible()
  })

  it('should render group by groupName correctly', async () => {
    const { deviceGroupNameGroupableOptions } = getGroupableConfig()
    const groupNameActions = deviceGroupNameGroupableOptions.actions
    const { rerender } = render(<>{groupNameActions[0].renderer(mockApData)}</>,
      { route: true })
    expect(screen.getByRole('link', { name: 'Edit' })).toBeVisible()
    rerender(<>{groupNameActions[1].renderer(mockApData)}</>)
    expect(screen.getByRole('button', { name: 'Delete' })).toBeVisible()
    const groupNameAttributes = deviceGroupNameGroupableOptions.attributes
    rerender(<>{groupNameAttributes[0].renderer(mockApData)}</>)
    expect(screen.getByText('TestGroup-01')).toBeVisible()
    rerender(<>{groupNameAttributes[1].renderer(mockApData)}</>)
    expect(screen.getByText('Venue:')).toBeVisible()
    rerender(<>{groupNameAttributes[2].renderer(mockApData)}</>)
    expect(screen.getByText('Members: 2')).toBeVisible()
    rerender(<>{groupNameAttributes[3].renderer(mockApData)}</>)
    expect(screen.getByText('Incidents (24 hours): 6')).toBeVisible()
    rerender(<>{groupNameAttributes[4].renderer(mockApData)}</>)
    expect(screen.getByText('Connected Clients: 7')).toBeVisible()
    rerender(<>{groupNameAttributes[5].renderer(mockApData)}</>)

    const wirelessNetworksElement = screen.getByText('Wireless Networks:')
    expect(wirelessNetworksElement).toBeVisible()
    const numberElement = within(wirelessNetworksElement).getByText('8')
    expect(numberElement).toBeVisible()
  })

  it('should render group by model correctly', async () => {
    const { modelGroupableOptions } = getGroupableConfig()

    const modelAttributes = modelGroupableOptions.attributes
    const { rerender } = render(modelAttributes[0].renderer(mockApData))
    expect(screen.getByText('R550')).toBeVisible()
    rerender(modelAttributes[1].renderer(mockApData))
    expect(screen.getByText('Venue:')).toBeVisible()
    rerender(modelAttributes[2].renderer(mockApData))
    expect(screen.getByText('Members: 2')).toBeVisible()
    rerender(modelAttributes[3].renderer(mockApData))
    expect(screen.getByText('Incidents (24 hours): 6')).toBeVisible()
    rerender(modelAttributes[4].renderer(mockApData))
    expect(screen.getByText('Connected Clients: 7')).toBeVisible()
    rerender(modelAttributes[5].renderer(mockApData))

    const wirelessNetworksElement = screen.getByText('Wireless Networks:')
    expect(wirelessNetworksElement).toBeVisible()
    const numberElement = within(wirelessNetworksElement).getByText('8')
    expect(numberElement).toBeVisible()
  })
})
