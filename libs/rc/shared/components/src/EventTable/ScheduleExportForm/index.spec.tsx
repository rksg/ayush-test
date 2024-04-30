/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  AdministrationUrlsInfo,
  EventExportSchedule,
  EventScheduleFrequency,
  eventSeverityMapping,
  eventTypeMapping } from
  '@acx-ui/rc/utils'
import { Provider  } from '@acx-ui/store'
import {
  render,
  screen,
  mockServer,
  renderHook
} from '@acx-ui/test-utils'


import { ScheduleExportForm } from '.'


const adminList = [{
  id: '01b35c76411544999550f038304f18f8',
  createdDate: '2023-08-16T19:12:05.983+00:00',
  updatedDate: '2023-08-16T19:12:05.987+00:00',
  description: 'primeAdmin',
  endpoints: [
    {
      type: 'EMAIL',
      id: 'bed16f134e28411ba6df5de8a3204df7',
      createdDate: '2023-08-16T19:12:05.984+00:00',
      updatedDate: '2023-08-16T19:12:05.984+00:00',
      destination: 'efg.cheng@email.com',
      active: true,
      status: 'OK'
    },
    {
      type: 'SMS',
      id: 'bed16f134e28411ba6df5de8a3204df9',
      createdDate: '2023-08-16T19:12:05.984+00:00',
      updatedDate: '2023-08-16T19:12:05.984+00:00',
      destination: 'efg2.cheng@email.com',
      active: true,
      status: 'OK'
    }
  ]
},
{
  id: '01b35c76411544999550f038304f18f5',
  createdDate: '2023-08-16T19:12:05.983+00:00',
  updatedDate: '2023-08-16T19:12:05.987+00:00',
  description: 'primeAdmin1',
  endpoints: [
    {
      type: 'EMAIL',
      id: 'bed16f134e28411ba6df5de8a3204df8',
      createdDate: '2023-08-16T19:12:05.984+00:00',
      updatedDate: '2023-08-16T19:12:05.984+00:00',
      destination: 'efg1.cheng@email.com',
      active: true,
      status: 'OK'
    }
  ]
}
]

const scheduleExport: EventExportSchedule = {
  type: 'Event',
  clientTimeZone: 'Asia/Calcutta',
  sortOrder: 'DESC',
  sortField: 'event_datetime',
  enable: true,
  recipients: [
    'efg.cheng@email.com'
  ],
  reportSchedule: {
    type: EventScheduleFrequency.Weekly,
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
        AdministrationUrlsInfo.getNotificationRecipients.url,
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
      scheduleExportData={scheduleWeeklyExport}
      fetchingEditData={false}
      onSubmit={submitFn}
    />, { route: { params }, wrapper: Provider })

    userEvent.click(await screen.findByRole('combobox', { name: 'Frequency' }))
    userEvent.click(await screen.findByRole('option', { name: 'Monthly' }))

    await expect(await screen.findByRole('option', { name: 'Monthly' })).toBeInTheDocument()

    userEvent.click(await screen.findByRole('button', { name: 'Change' }))

    await expect(await screen.findByText('primeAdmin')).toBeInTheDocument()

  })

})
