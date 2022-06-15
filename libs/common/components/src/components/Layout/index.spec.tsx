import '@testing-library/jest-dom'
import { render }        from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

import menuConfig from './stories/menuConfig'

import { Layout } from '.'

describe('Layout', () => {
  it('should render correctly', async () => {
    const { asFragment } = render(
      <BrowserRouter>
        <Layout
          menuConfig={menuConfig}
          rightHeaderContent={<div>Right header</div>}
          leftHeaderContent={<div>Left header</div>}
          content={<div>content</div>}
        />
      </BrowserRouter>
    )
    expect(asFragment()).toMatchSnapshot()
  })
})