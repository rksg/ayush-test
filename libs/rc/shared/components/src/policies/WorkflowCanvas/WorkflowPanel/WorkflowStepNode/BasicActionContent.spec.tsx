import React from 'react'

import { AupActionTypeIcon } from '@acx-ui/icons'
import { Provider }          from '@acx-ui/store'
import { render, screen }    from '@acx-ui/test-utils'

import BasicActionContent from './BasicActionContent'


describe('BasicActionContent', () => {
  it('should render basic information correctly', async () => {
    const expected = {
      icon: <AupActionTypeIcon data-testid={'expected-icon'}/>,
      title: 'basic title',
      content: 'basic content'
    }
    render(<Provider><BasicActionContent {...expected} /></Provider> )

    expect(screen.getByTestId('expected-icon')).toBeVisible()
    expect(await screen.findByText(expected.title)).toBeVisible()
    expect(await screen.findByText(expected.content)).toBeVisible()
  })
})
