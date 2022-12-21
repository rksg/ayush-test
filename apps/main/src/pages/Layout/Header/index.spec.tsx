import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'


// import About       from './About'
import ActivityButton from './ActivityButton'
import AlarmButton    from './AlarmButton'
// import Firewall    from './Firewall'


const aboutJSON = {
  currentVersion: {
    id: 'acx-hybrid',
    name: 'acx-hybrid',
    description: 'acx-hybidrd descriptopn',
    releaseNotesUrl: 'http://google.com',
    affectsNetwork: true,
    type: 'STANDARD',
    features: [
      'featuring acx-hbrid'
    ],
    slots: null,
    impacts: [
      'impacting acxhybirid'
    ],
    category: null,
    destResourceProfiles: null,
    createdDate: '2022-07-18T17:48:02.129+0000',
    scheduleNow: false
  },
  futureVersion: null,
  versionUpgradeDate: null,
  slotId: null,
  scheduleVersionList: null
}

const dashboardOverview = {
  summary: {
    clients: {
      summary: { },
      clientDto: [ ],
      totalCount: 0
    },
    aps: {

    },
    alarms: {
      summary: {
        major: 1
      },
      totalCount: 1
    },
    switches: {
      summary: { },
      totalCount: 0
    },
    venues: {
      summary: { },
      totalCount: 13
    },
    switchClients: {
      summary: { },
      totalCount: 0
    }
  },
  aps: {
    apsStatus: [],
    totalCount: 0
  },
  switches: {
    switchesStatus: [ ],
    totalCount: 0
  },
  venues: [ ]
}

const alarmList = {
  totalCount: 1,
  page: 1,
  data: [
    {
      severity: 'Major',
      serialNumber: '272002000493',
      entityType: 'AP',
      startTime: 1667879968000,
      entityId: '272002000493',
      id: '272002000493_ap_status',
      message: '{ "message_template": "AP @@apName disconnected from the cloud controller." }'
    }
  ],
  subsequentQueries: [
    {
      fields: [
        'venueName',
        'apName',
        'switchName'
      ],
      url: '/api/eventalarmapi/e3d0c24e808d42b1832d47db4c2a7914/alarm/meta'
    }
  ],
  fields: [
    'startTime',
    'severity',
    'message',
    'id',
    'serialNumber',
    'entityType',
    'entityId',
    'sourceType'
  ]
}

const alarmMeta = {
  data: [
    {
      venueName: 'test_amy',
      switchName: '272002000493',
      id: '272002000493_ap_status',
      isSwitchExists: false,
      apName: 'testamy_ap'
    }
  ],
  fields: [
    'venueName',
    'apName',
    'switchName'
  ]
}

describe('Header Component', () => {

  let params: { tenantId: string }
  beforeEach(async () => {
    params = {
      tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1'
    }
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getCloudVersion.url,
        (req, res, ctx) => res(ctx.json(aboutJSON))
      ),
      rest.get(
        CommonUrlsInfo.getDashboardOverview.url,
        (req, res, ctx) => res(ctx.json(dashboardOverview))
      ),
      rest.post(
        CommonUrlsInfo.getAlarmsList.url,
        (req, res, ctx) => res(ctx.json(alarmList))
      ),
      rest.post(
        CommonUrlsInfo.getAlarmsListMeta.url,
        (req, res, ctx) => res(ctx.json(alarmMeta))
      )
    )
  })

  // it('should render <About/> component correctly', async () => {
  //   render(
  //     <Provider>
  //       <About modalState={true} setIsModalOpen={() => {}}/>
  //     </Provider>, {
  //       route: { params }
  //     })
  //   expect(await screen.findByText(('acx-hybrid'))).toBeInTheDocument()
  //   const modalComponent = screen.getByTestId('modal-about-id')
  //   expect(modalComponent).toMatchSnapshot()
  //   const cancelBtn = await screen.findByRole('button')
  //   await userEvent.click(cancelBtn)
  // })

  // it('should render <Firewall/> component correctly', async () => {
  //   render(
  //     <Provider>
  //       <Firewall modalState={true} setIsModalOpen={() => {}}/>
  //     </Provider>, {
  //       route: { params }
  //     })
  //   expect(await screen.findByText(('https://ruckus.cloud'))).toBeInTheDocument()
  //   expect(await screen.findByText(('device.ruckus.cloud'))).toBeInTheDocument()
  //   const modalComponent = screen.getByTestId('drawer-firewall-id')
  //   expect(modalComponent).toMatchSnapshot()
  //   const cancelBtn = await screen.findByRole('button',{ name: 'Close' })
  //   await userEvent.click(cancelBtn)
  // })

  it('should render Alarm component correctly', async () => {
    render(<Provider>
      <AlarmButton/>
    </Provider>, {
      route: { params, path: '/:tenantId/' }
    })
    const alarmBtn = await screen.findByRole('button')
    await userEvent.click(alarmBtn)
    await waitFor(async () => {
      expect(await screen.findByText(('testamy_ap'))).toBeInTheDocument()
    })
    const cancelBtn = await screen.findByRole('button',{ name: 'Close' })
    await userEvent.click(cancelBtn)
  })

  it('should render Activity component correctly', async () => {
    render(<Provider>
      <ActivityButton/>
    </Provider>, {
      route: { params, path: '/:tenantId/' }
    })
    const activityBtn = screen.getByRole('button', { name: /clock\-circle/i })
    await userEvent.click(activityBtn)
    const cancelBtn = await screen.findByRole('button',{ name: 'Close' })
    await userEvent.click(cancelBtn)
  })

})
