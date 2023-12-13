/* eslint-disable max-len */
import { userEvent, waitFor, waitForElementToBeRemoved } from '@storybook/testing-library'
import { rest }                                          from 'msw'
import { defineMessage }                                 from 'react-intl'

import { useIsSplitOn }                           from '@acx-ui/feature-toggle'
import { AdministrationUrlsInfo, CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider  }                              from '@acx-ui/store'
import {
  render,
  screen,
  mockServer
} from '@acx-ui/test-utils'


import { ScheduleExportDrawer } from '.'


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

const scheduleExport = {
  type: 'Event',
  clientTimeZone: 'Asia/Calcutta',
  sortOrder: 'DESC',
  sortField: 'event_datetime',
  enable: true,
  recipients: [
    'bival.ray@commscope.com'
  ],
  reportSchedule: {
    type: 'Weekly',
    day: 'MON',
    hour: 12,
    minute: 30,
    dayOfMonth: 1
  },
  context: {
    severity: [
      'Critical'
    ],
    entity_type: [
      'ADMIN',
      'NOTIFICATION'
    ]
  }
}

const params = { tenantId: 'tenant-id' }
describe('ScheduleExportDrawer', () => {

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
    const mockedReqFn =jest.fn()
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getExportSchedules.url,
        (req, res, ctx) => {
          mockedReqFn()
          return res(ctx.json(scheduleExport))
        }
      ),
      rest.put(
        CommonUrlsInfo.updateExportSchedules.url,
        (req, res, ctx) => {
          return res(ctx.json({}))
        }
      )
    )
    render(<ScheduleExportDrawer
      visible={true}
      onSubmit={submitFn}
      onClose={jest.fn()}
      title={defineMessage({ defaultMessage: 'Schedule Event Export' })}
    />, { route: { params }, wrapper: Provider })

    expect(await screen.findByText('Schedule Event Export')).toBeInTheDocument()

    await waitFor(() => expect(mockedReqFn).toBeCalled())

    await expect(await screen.findByText('bival.ray@commscope.com')).toBeInTheDocument()

    const saveButton = await screen.findByRole('button', { name: 'Apply' })
    await userEvent.click(saveButton)

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loading' }))
    expect(saveButton).toBeInTheDocument()

  })

  it('should add new event schedule export', async () => {
    const submitFn = jest.fn()
    const mockedReqFn =jest.fn()
    const mockedApplyFn =jest.fn()
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getExportSchedules.url,
        (req, res, ctx) => {
          mockedReqFn()
          return res(ctx.json({}))
        }
      ),
      rest.post(
        CommonUrlsInfo.addExportSchedules.url,
        (req, res, ctx) => {
          mockedApplyFn(req.body)
          return res(ctx.json({}))
        }
      )
    )
    render(<ScheduleExportDrawer
      visible={true}
      onSubmit={submitFn}
      onClose={jest.fn()}
      title={defineMessage({ defaultMessage: 'Schedule Event Export' })}
    />, { route: { params }, wrapper: Provider })

    expect(await screen.findByText('Schedule Event Export')).toBeInTheDocument()

    await waitFor(() => expect(mockedReqFn).toBeCalled())

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    userEvent.click(await screen.findByRole('combobox', { name: 'Product' }))
    userEvent.click(await screen.findByRole('option', { name: 'General' }))

    await userEvent.click(await screen.findByRole('combobox', { name: 'Severity' }))
    userEvent.click(await screen.findByText('Warning'))

    await userEvent.click(await screen.findByRole('combobox', { name: 'Event Type' }))
    userEvent.click(await screen.findByRole('option', { name: 'AP' }))
    userEvent.click(await screen.findByRole('option', { name: 'Security' }))

    const saveButton = await screen.findByRole('button', { name: 'Apply' })
    await userEvent.click(saveButton)
    await waitFor(() => expect(mockedApplyFn).toBeCalled())
    expect(saveButton).toBeInTheDocument()

  })

})
