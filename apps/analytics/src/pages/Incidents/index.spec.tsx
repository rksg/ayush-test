import '@testing-library/jest-dom'

import { render, screen } from '@acx-ui/test-utils'

import Incidents from '.'

jest.mock('../../components/Header', () => () => <div>Incidents</div>)
jest.mock('../../components/NetworkHistory', () => () => <div>Network</div>)
jest.mock('../../components/IncidentBySeverity', () => () => <div>bar chart</div>)

describe('Incidents Page', () => {
  it('should render page header and grid layout', () => {
    render(<Incidents />)
    expect(screen.getByText('Incidents')).toBeVisible()
    expect(screen.getByText('table')).toBeVisible()
  })
})
