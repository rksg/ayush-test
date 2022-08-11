import { dataApiURL }                       from '@acx-ui/analytics/services'
import { Provider, store }                  from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { api }   from './services'
import { input } from './services.spec'

import Header, { Header as DumbHeader } from './index'

describe('Analytics dumb header', () => {
  const props = {
    title: 'title',
    replaceTitle: true,
    data: {
      title: 'title',
      subTitle: [
        { key: 'apCount', value: [1] },
        { key: 'version', value: ['1', '2'] }
      ]
    }
  }
  it('should render correctly', () => {
    const { asFragment } = render(<DumbHeader {...props}/>)
    const fragment = asFragment()
    expect(fragment).toMatchSnapshot()
  })
})
describe('Analytics connected header', () => {
  beforeEach(() => store.dispatch(api.util.resetApiState()))

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'NetworkNodeInfo', {
      data: input[1].queryResult
    })
    render(<Provider> <Header title={''}/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render header', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkNodeInfo', {
      data: input[0].queryResult
    })
    render(<Provider><Header title={'Title'}/></Provider>)
    await screen.findByText('Title')
    expect(screen.getByTitle('Entire Organization')).toHaveTextContent('Type:')
  })
})
