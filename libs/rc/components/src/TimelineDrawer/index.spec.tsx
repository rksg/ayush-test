import '@testing-library/jest-dom'

import { render, screen, fireEvent }   from '@testing-library/react'
import { IntlProvider, defineMessage } from 'react-intl'

import { Activity } from '@acx-ui/rc/utils'

import { TimelineDrawer } from '.'

describe('TimelineDrawer', () => {
  const data = [
    { title: defineMessage({ defaultMessage: 'Title' }), value: 'Value' }
  ]
  it('should render', () => {
    render(<IntlProvider locale='en'>
      <TimelineDrawer
        title={defineMessage({ defaultMessage: 'Test Details' })}
        visible
        onClose={()=>{}}
        data={data}
      />
    </IntlProvider>)
    expect(screen.getByText('Test Details')).toBeDefined()
    expect(screen.getByText('Title')).toBeDefined()
    expect(screen.getByText('Value')).toBeDefined()
  })
  it('should render with timeline', async () => {
    const activity = {
      status: 'INPROGRESS',
      steps: [{
        id: '1',
        status: 'INPROGRESS',
        startDatetime: '2022-12-20T04:27:30Z',
        description: 'UpdateSwitchPosition'
      }]
    } as Activity
    render(<IntlProvider locale='en'>
      <TimelineDrawer
        title={defineMessage({ defaultMessage: 'Test Details' })}
        visible
        onClose={()=>{}}
        data={data}
        activity={activity}
      />
    </IntlProvider>)
    expect((await screen.findAllByText('In progress')).length).toBe(2)
  })
  it('should render timeline with fail error', async () => {
    const activity = {
      status: 'FAIL',
      steps: [{
        id: '2',
        status: 'FAIL',
        startDatetime: '2023-04-20T04:20:00Z',
        endDatetime: '2023-04-20T10:20:00Z',
        description: 'Add AP',
        error: '{\"requestId\":\"123456\",\"errors\":[\"{\\\"code\\\":\\\"WIFI-10130\\\"}\"]}'
      }]
    } as Activity
    render(<IntlProvider locale='en'>
      <TimelineDrawer
        title={defineMessage({ defaultMessage: 'Test Details' })}
        visible
        onClose={()=>{}}
        data={data}
        activity={activity}
      />
    </IntlProvider>)
    expect((await screen.findAllByText('Failed')).length).toBe(2)
    fireEvent.click((await screen.findAllByTestId('PlusSquareSolid'))[0])
    expect((await screen.findByText('Copy to clipboard'))).toBeVisible()
  })
})
