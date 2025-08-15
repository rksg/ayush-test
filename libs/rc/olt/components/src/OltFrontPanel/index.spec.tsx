import { OltSlotType, OltCageStateEnum } from '@acx-ui/olt/utils'
import { Provider }                      from '@acx-ui/store'
import { screen, render }                from '@acx-ui/test-utils'


import { OltFrontPanel } from './'

describe('OltFrontPanel', () => { //TODO
  const params = { tenantId: 'tenant-id', oltId: 'olt-id' }

  it('should render correctly', async () => {
    render(<Provider>
      <OltFrontPanel
        title={'Panel Title'}
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

    expect(screen.getByText('Panel Title')).toBeInTheDocument()
    expect(screen.getByText('05')).toBeInTheDocument()
  })

})
