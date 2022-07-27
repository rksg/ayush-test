import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { Tabs }   from 'antd'

import { BrowserRouter } from '@acx-ui/react-router-dom'

import { PageHeader } from '.'

describe('PageHeader', () => {
  it('should render basic page header', () => {
    const { asFragment } = render(<PageHeader title='Basic' />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render page header with tabs', () => {
    const { asFragment } = render(
      <BrowserRouter>
        <PageHeader
          title='With Tabs'
          breadcrumb={[
            { text: 'Networks', link: '/networks' }
          ]}
          footer={
            <Tabs>
              <Tabs.TabPane tab='Overview' key='1' />
            </Tabs>
          }
        />
      </BrowserRouter>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render page header with title, breadcrumb & subtitle', () => {
    const { asFragment } = render(
      <BrowserRouter>
        <PageHeader
          title='With Subtitle'
          breadcrumb={[
            { text: 'Networks', link: '/networks' }
          ]}
          subTitle={<span>Subtitle</span>}
        />
      </BrowserRouter>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render page header with sideHeader', () => {
    const { asFragment } = render(
      <BrowserRouter>
        <PageHeader
          title='With Subtitle'
          sideHeader={<div>sideHeader</div>}
        />
      </BrowserRouter>
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
