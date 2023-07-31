import userEvent from '@testing-library/user-event'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { ConfigChange } from '.'

jest.mock('./Chart', () => ({ Chart: (props:{ onClick: (props: { id: number }) => void }) =>
  <div data-testid='Chart'onClick={() => { props.onClick({ id: 1 })}} /> }))
jest.mock('./KPI', () => ({ KPIs: () => <div data-testid='KPIs' /> }))
jest.mock('./Table', () => ({ Table: (props: { onRowClick: () => void }) =>
  <div data-testid='Table' onClick={() => { props.onRowClick()}} /> }))

describe('ConfigChange', () => {
  it('should render page correctly', async () => {
    render(<ConfigChange />, { wrapper: Provider, route: {} })
    expect(await screen.findByTestId('Chart')).toBeVisible()
    expect(await screen.findByTestId('KPIs')).toBeVisible()
    expect(await screen.findByTestId('Table')).toBeVisible()
  })
  it('should handle onClick', async () => {
    render(<ConfigChange />, { wrapper: Provider, route: {} })
    await userEvent.click(await screen.findByTestId('Chart'))
    await userEvent.click(await screen.findByTestId('Table'))
  })
})
