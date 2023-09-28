import '@testing-library/jest-dom'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { DNSRecordsTab } from '.'


describe('RWGDetails DNS Records', () => {

  it('should render DNS Records tab correctly', async () => {

    render(<Provider><DNSRecordsTab /> </Provider>)

    expect(await screen.findByText('DNS Records')).toBeInTheDocument()

  })

})
