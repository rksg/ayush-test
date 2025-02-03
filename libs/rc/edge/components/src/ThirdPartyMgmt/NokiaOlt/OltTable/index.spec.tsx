import { EdgeOltFixtures, EdgeTnmServiceUrls } from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { render, screen, mockServer }          from '@acx-ui/test-utils'

import { EdgeNokiaOltTable } from './index'

describe('EdgeNokiaOltTable', () => {

  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeTnmServiceUrls.addEdgeOlt.url,
        (_, res, ctx) => {
          return res(ctx.status(202))
        }
      ),
      rest.delete(
        EdgeTnmServiceUrls.deleteEdgeOlt.url,
        (_, res, ctx) => {
          return res(ctx.status(202))
        }
      )
    )
  })

  it('renders with loading state', () => {
    render(<Provider>
      <EdgeNokiaOltTable data={EdgeOltFixtures.mockOltList} isFetching />
    </Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeInTheDocument()
  })

  it('renders with data', () => {
    render(<EdgeNokiaOltTable data={EdgeOltFixtures.mockOltList} />)
    expect(screen.getByText('TestOlt')).toBeInTheDocument()
  })

  it('should display OLT data when edit', () => {
    render(<EdgeNokiaOltTable data={EdgeOltFixtures.mockOltList} />)
    expect(screen.getByText('TestOlt')).toBeInTheDocument()
  })

  it('should be able to create OLT', () => {
    render(<EdgeNokiaOltTable data={EdgeOltFixtures.mockOltList} />)
    expect(screen.getByText('Add')).toBeInTheDocument()
  })

  it('should delete OLT', () => {
    render(<EdgeNokiaOltTable data={EdgeOltFixtures.mockOltList} />)
    expect(screen.getByText('TestOlt')).toBeInTheDocument()
  })
})