import '@testing-library/jest-dom'
import * as router from 'react-router-dom'

import * as rc_utils            from '@acx-ui/rc/utils'
import { Provider }             from '@acx-ui/store'
import { render, screen }       from '@acx-ui/test-utils'
import type { AnalyticsFilter } from '@acx-ui/utils'


import { SwitchIncidentsTab } from '.'

const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useParams: jest.fn()
}))
jest.mock('@acx-ui/analytics/components', () => ({
  ...jest.requireActual('@acx-ui/analytics/components'),
  IncidentTabContent: (props: { filters: AnalyticsFilter }) => <div
    data-testid='incidents-table'>{JSON.stringify(props.filters)}</div>
}))

const switchContext = {
  switchId: '60:9C:9F:52:C9:86', networkPath: [{
    name: 'Alphanet-BDC',
    type: 'system'
  },
  {
    type: 'switchGroup',
    name: 'MadySWITCH'
  },
  {
    name: '60:9C:9F:52:C9:86',
    type: 'switch'
  }
  ]
}

describe('SwitchIncidentsTab', () => {
  beforeEach(() => {
    mockedUsedNavigate.mockReset()
  })
  it('should render correctly', async () => {
    jest.spyOn(router, 'useParams').mockImplementation(
      () => ({ switchId: '60:9C:9F:52:C9:86' })
    )

    jest.spyOn(rc_utils, 'useSwitchContext').mockImplementation(
      () => ({ switchId: '60:9C:9F:52:C9:86', networkPath: null }) as
      unknown as router.Params<string>
    )

    render(<Provider>
      <SwitchIncidentsTab />
    </Provider>, {
      route: {
        params: { switchId: '60:9C:9F:52:C9:86' },
        path: '/devices/switch/:switchId/serial/details/incidents'
      }
    })
    expect((await screen.findByTestId('incidents-table'))).toBeVisible()
  })
  it('should render correctly with network path', async () => {
    jest.spyOn(router, 'useParams').mockImplementation(
      () => ({ switchId: '60:9C:9F:52:C9:86' })
    )

    jest.spyOn(rc_utils, 'useSwitchContext').mockImplementation(
      () => (switchContext) as unknown as router.Params<string>
    )

    render(<Provider>
      <SwitchIncidentsTab />
    </Provider>, {
      route: {
        params: { switchId: '60:9C:9F:52:C9:86' },
        path: '/devices/switch/:switchId/serial/details/incidents'
      }
    })
    expect((await screen.findByTestId('incidents-table'))).toBeVisible()
  })
})
