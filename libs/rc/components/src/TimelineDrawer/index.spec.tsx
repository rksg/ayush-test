import '@testing-library/jest-dom'

import { render, screen, fireEvent }   from '@testing-library/react'
import { IntlProvider, defineMessage } from 'react-intl'

import { TimelineItem } from '@acx-ui/components'

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
    const timeline = [
      {
        status: 'INPROGRESS',
        startDatetime: '2022-12-20T04:27:30Z',
        description: 'UpdateSwitchPosition',
        children: <div style={{ border: '1px solid black' }}>
          { new Array(5).fill(0).map((_, i) => <p key={i}>More content</p>) }
        </div>
      }
    ] as TimelineItem[]
    render(<IntlProvider locale='en'>
      <TimelineDrawer
        title={defineMessage({ defaultMessage: 'Test Details' })}
        visible
        onClose={()=>{}}
        data={data}
        timeLine={timeline}
      />
    </IntlProvider>)
    expect((await screen.findAllByText('In progress')).length).toBe(2)
  })
  it('should render timeline with fail error', async () => {
    const timeline = [
      {
        status: 'FAIL',
        startDatetime: '2023-04-20T04:20:00Z',
        description: 'Add AP',
        error: '{\"requestId\":\"123456\",\"errors\":[\"{\\\"code\\\":\\\"WIFI-10130\\\"}\"]}',
        endDatetime: '2023-04-20T10:20:00Z'
      }
    ] as TimelineItem[]
    render(<IntlProvider locale='en'>
      <TimelineDrawer
        title={defineMessage({ defaultMessage: 'Test Details' })}
        visible
        onClose={()=>{}}
        data={data}
        timeLine={timeline}
      />
    </IntlProvider>)
    expect((await screen.findAllByText('Failed')).length).toBe(2)
    fireEvent.click((await screen.findAllByTestId('PlusSquareSolid'))[0])
    expect((await screen.findByText('Copy to clipboard'))).toBeVisible()
  })
})
