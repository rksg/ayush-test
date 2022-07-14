import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'

import Incidents from '.'

jest.mock('@acx-ui/components', () => ({
  PageHeader: () => <div>header</div>,
  Button: () => <div>button</div>
}))
jest.mock('antd', () => ({
  Col: () => <div>col</div>,
  Row: () => <div>row</div>
}))

describe('Incidents Page', () => {
  it('should render page header and grid layout', () => {
    render(<Incidents />)
    expect(screen.getByText('header')).toBeVisible()
    expect(screen.getByText('row')).toBeVisible()
  })
})
