import { OltSlotType, OltCageStateEnum } from '@acx-ui/olt/utils'
import { OltFixtures }                   from '@acx-ui/olt/utils'
import { Provider }                      from '@acx-ui/store'
import { screen, render }                from '@acx-ui/test-utils'

import { UnitIcon } from './Unit'

import { OltFrontPanel } from './'

const { mockNetworkCardSlots, mockLineCardSlots } = OltFixtures

describe('OltFrontPanel', () => { //TODO
  const params = { tenantId: 'tenant-id', oltId: 'olt-id' }

  it('should render OLT front panel correctly', async () => {
    render(<Provider>
      <OltFrontPanel
        title='Panel Title'
        data={[
          ...mockNetworkCardSlots,
          ...mockLineCardSlots
        ]}
      />
    </Provider>, { route: { params } })

    expect(screen.getByText('Panel Title')).toBeInTheDocument()
    expect(screen.getByText('NT 1')).toBeInTheDocument()
    expect(screen.getByText('PON LC 2')).toBeInTheDocument()
  })

  it('should render ONU front panel correctly', async () => {
    render(<Provider>
      <OltFrontPanel
        data={[{
          type: OltSlotType.ONT,
          slots: Array.from({ length: 6 }, (_, index) => ({
            label: `S1/${index + 1}`,
            type: index === 2 ? 'lag' : '',
            status: index === 4 ? OltCageStateEnum.UP : OltCageStateEnum.DOWN,
            info: '%info%',
            portSpeed: '1 Gb/sec'
          }))
        }]}
      />
    </Provider>, { route: { params } })

    expect(screen.getByText('05')).toBeInTheDocument()
  })
})

describe('UnitIcon', () => {
  it('should render uplink icon correctly', async () => {
    render(<UnitIcon type='uplink' />)
    expect(screen.getByTestId('UplinkPortSolid')).toBeInTheDocument()
  })
  it('should render lag icon correctly', async () => {
    render(<UnitIcon type='lag' />)
    expect(screen.getByTestId('LagMemberSolid')).toBeInTheDocument()
  })
  it('should render poe icon correctly', async () => {
    render(<UnitIcon type='poe' />)
    expect(screen.getByTestId('PoeUsage')).toBeInTheDocument()
  })
})

