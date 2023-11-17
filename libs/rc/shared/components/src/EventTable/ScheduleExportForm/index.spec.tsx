/* eslint-disable max-len */
import { userEvent } from '@storybook/testing-library'
import { Form }      from 'antd'
import { rest }      from 'msw'

import { useIsSplitOn }                                                                                                from '@acx-ui/feature-toggle'
import { AdministrationUrlsInfo, EventExportSchedule, EventScheduleFrequency, eventSeverityMapping, eventTypeMapping } from '@acx-ui/rc/utils'
import { Provider  }                                                                                                   from '@acx-ui/store'
import {
  render,
  screen,
  mockServer,
  renderHook
} from '@acx-ui/test-utils'


import { ScheduleExportForm } from '.'


const adminList = [{
  id: '0587cbeb13404f3b9943d21f9e1d1e9e',
  email: 'efg.cheng@email.com',
  name: 'primeAdmin',
  role: 'PRIME_ADMIN',
  delegateToAllECs: true,
  detailLevel: 'debug'
}
]

const scheduleExport: EventExportSchedule = {
  type: 'Event',
  clientTimeZone: 'Asia/Calcutta',
  sortOrder: 'DESC',
  sortField: 'event_datetime',
  enable: true,
  recipients: [
    'bival.ray@commscope.com'
  ],
  reportSchedule: {
    type: EventScheduleFrequency.Monthly,
    dayOfWeek: 'MON',
    hour: 12,
    minute: 30,
    dayOfMonth: 1
  },
  context: {
    severity: [
      eventSeverityMapping
    ],
    entity_type: [
      eventTypeMapping
    ]
  }
}

const scheduleWeeklyExport: EventExportSchedule = {
  ...scheduleExport,
  reportSchedule: {
    type: EventScheduleFrequency.Weekly,
    dayOfWeek: 'MON',
    hour: 12,
    minute: 30,
    dayOfMonth: 1
  }
}

const params = { tenantId: 'tenant-id' }
describe('ScheduleExportForm', () => {

  beforeEach(() => {

    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getAdministrators.url,
        (req, res, ctx) => {
          return res(ctx.json(adminList))
        }
      )
    )
  })

  it('should render correctly', async () => {
    const submitFn = jest.fn()

    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })
    render(<ScheduleExportForm
      form={formRef.current}
      scheduleExportData={scheduleExport}
      fetchingEditData={false}
      onSubmit={submitFn}
    />, { route: { params }, wrapper: Provider })

    await expect(await screen.findByText('bival.ray@commscope.com')).toBeInTheDocument()

  })

  it('should click change recipients', async () => {
    const submitFn = jest.fn()

    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(<ScheduleExportForm
      form={formRef.current}
      scheduleExportData={scheduleWeeklyExport}
      fetchingEditData={false}
      onSubmit={submitFn}
    />, { route: { params }, wrapper: Provider })

    userEvent.click(await screen.findByRole('button', { name: 'Change' }))

    await expect(await screen.findByText('primeAdmin')).toBeInTheDocument()

  })

})
