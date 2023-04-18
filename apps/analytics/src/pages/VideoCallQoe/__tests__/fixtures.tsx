
import { Form } from 'antd'

import { render, screen, within, renderHook } from '@acx-ui/test-utils'

export const getAllCallQoeTests = {
  getAllCallQoeTests: [
    {
      id: 13,
      name: 'ACX_test',
      meetings: [
        {
          id: 13,
          zoomMeetingId: '94909091023',
          status: 'ENDED',
          invalidReason: null,
          joinUrl: 'https://zoom.us/j/94909091023?pwd=UU1tT0FBRHZvdkhEY2wxSTZwMEJwZz09',
          participantCount: 2,
          mos: 4.6,
          createdTime: '2023-04-06T09:55:41.000Z',
          startTime: '2023-04-06T09:56:21.000Z'
        }
      ]
    },
    {
      id: 74,
      name: 'Test call',
      meetings: [
        {
          id: 74,
          zoomMeetingId: '97992181330',
          status: 'INVALID',
          invalidReason: 'ZOOM_CALL_NO_PARTICIPANT_ON_WIFI',
          joinUrl: 'https://zoom.us/j/97992181330?pwd=VXZ4YWZlZkJRZlg1QmtwazJtcVhRdz09',
          participantCount: 0,
          mos: null,
          createdTime: '2023-04-12T09:56:58.000Z',
          startTime: null
        }
      ]
    },
    {
      id: 57,
      name: 'Asraf - Test1',
      meetings: [
        {
          id: 57,
          zoomMeetingId: '98908385463',
          status: 'ENDED',
          invalidReason: null,
          joinUrl: 'https://zoom.us/j/98908385463?pwd=bkErOUIxc0tPSVJVYWlJVWI5bWJtZz09',
          participantCount: 2,
          mos: 3.3,
          createdTime: '2023-04-11T04:39:28.000Z',
          startTime: '2023-04-11T04:40:20.000Z'
        }
      ]
    }
  ],
  noData: []
}

export const withinField = () => within(screen.getByTestId('field'))

export const renderFormHook = () => {
  const { result: { current: form } } = renderHook(() => {
    const [form] = Form.useForm()
    return form
  })
  return { form, formRender: render(<Form form={form} data-testid='form' />) }
}
