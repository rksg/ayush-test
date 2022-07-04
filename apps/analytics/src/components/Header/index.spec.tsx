import { render } from '@testing-library/react'

import { BrowserRouter } from '@acx-ui/react-router-dom'

import { Header } from './index'



describe('Analytics dumb header', () => {

  const props = {
    title: 'title',
    subTitles: [{ key: '1', value: ['1'] }, { key: '12', value: ['1', '2'] }],
    breadCrumb: [{ text: 'page', link: 'link' }]
  }
  it('should render correctly', () => {
    const { asFragment } = render(
      <BrowserRouter><Header {... props}/> </BrowserRouter>)
    const fragment = asFragment()
    expect(fragment).toMatchSnapshot()
  })
})
