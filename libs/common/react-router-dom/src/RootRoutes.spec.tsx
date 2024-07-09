import '@testing-library/jest-dom'
import { createMemoryHistory } from 'history'
import { Router, Route }       from 'react-router-dom'

import { render, screen } from '@acx-ui/test-utils'

import { rootRoutes } from './RootRoutes'

/*
jest.mock('react-router-dom', () => ({
  Route: jest.fn()
}))
*/
describe('RootRoutes', () => {
  it('renders routes with base path', () => {
    const history = createMemoryHistory()
    history.push('/page')
    render(
      <Router location={history.location} navigator={history}>
        {rootRoutes(<Route path='/page' element={<div>page</div>} />)}
      </Router>
    )
    expect(screen.getByText('page')).toBeVisible()
  })
})
