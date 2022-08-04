import { render, screen } from '@testing-library/react'

import { dataApiURL }       from '@acx-ui/analytics/services'
import { BrowserRouter }    from '@acx-ui/react-router-dom'
import { Provider, store }  from '@acx-ui/store'
import { mockGraphqlQuery } from '@acx-ui/test-utils'

import { api }   from './services'
import { input } from './services.spec'

import Header, { Header as DumbHeader } from './index'

describe('Analytics dumb header', () => {

  const props = {
    title: 'title',
    replaceTitle: true,
    data: {
      title: 'title',
      subTitle: [{ key: '1', value: ['1'] }, { key: '12', value: ['1', '2'] }]
    }
  }
  it('should render correctly', () => {
    const { asFragment } = render(
      <BrowserRouter><DumbHeader {... props}/> </BrowserRouter>)
    const fragment = asFragment()
    expect(fragment).toMatchSnapshot()
  })
})
describe('Analytics connected header', () => {

  beforeEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'NetworkNodeInfo', {
      data: input[1].queryResult
    })
    render( <Provider> <Header title={''}/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render header', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkNodeInfo', {
      data: input[0].queryResult
    })
    const { asFragment } =render( <Provider><Header title={'Title'}/></Provider>)
    await screen.findByText('Title')
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('span[title="Network"]')).toHaveTextContent('Type:')
  })
})
