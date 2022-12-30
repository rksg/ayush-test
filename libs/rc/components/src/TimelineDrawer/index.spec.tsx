import '@testing-library/jest-dom'

import { render, screen }              from '@testing-library/react'
import { IntlProvider, defineMessage } from 'react-intl'

import { TimelineDrawer } from '.'

describe('TimelineDrawer', () => {
  it('should render', () => {
    const data = [
      { title: defineMessage({ defaultMessage: 'Title' }), value: 'Value' }
    ]
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
})
