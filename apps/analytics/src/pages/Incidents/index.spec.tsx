import '@testing-library/jest-dom'

import { render, screen } from '@acx-ui/test-utils'

import Incidents from '.'

jest.mock('../../components/Header', () => () => <div>Incidents</div>)
jest.mock('../../components/NetworkHistory', () => () => <div>Network</div>) 
jest.mock('antd', () => ({
  Col: () => <div>col</div>,
  Row: () => <div>row</div>
}))

describe('Incidents Page', () => {
  it('should render page header and grid layout', () => {
    render(<Incidents />)
    expect(screen.getByText('Incidents')).toBeVisible()
    expect(screen.getByText('row')).toBeVisible()
  })
})
