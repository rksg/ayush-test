import { ReactNode } from 'react'

import userEvent from '@testing-library/user-event'


import { get }            from '@acx-ui/config'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { ConfigChange } from '.'

jest.mock('./Chart', () => ({ Chart: (props:{ onClick: (props: { id: number }) => void }) =>
  <div data-testid='Chart'onClick={() => { props.onClick({ id: 1 })}} /> }))
jest.mock('./KPI', () => ({ KPIs: () => <div data-testid='KPIs' /> }))
jest.mock('./Table', () => ({ Table: (props: { onRowClick: () => void }) =>
  <div data-testid='Table' onClick={() => { props.onRowClick()}} /> }))

jest.mock('./NetworkFilter', () => ({
  NetworkFilter: () => <div data-testid='NetworkFilter' />
}))

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  GridCol: (props: { children: ReactNode, style: Record<string, string> }) =>
    <div {...props} data-testid='GridCol' />
}))

const mockGet = get as jest.Mock
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))
beforeEach(() => mockGet.mockReturnValue(''))

describe('ConfigChange', () => {
  it('should render component correctly', async () => {
    render(<ConfigChange/>, { wrapper: Provider, route: {} })
    expect(await screen.findByTestId('Chart')).toBeVisible()
    expect(await screen.findByTestId('KPIs')).toBeVisible()
    expect(await screen.findByTestId('Table')).toBeVisible()
    expect((await screen.findAllByTestId('GridCol'))[0]).toHaveStyle('minHeight: 170px')
  })
  it('should render component correctly when IS_MLISA_SA', async () => {
    mockGet.mockReturnValue('true')
    render(<ConfigChange/>, { wrapper: Provider, route: {} })
    expect(await screen.findByTestId('Chart')).toBeVisible()
    expect(await screen.findByTestId('KPIs')).toBeVisible()
    expect(await screen.findByTestId('Table')).toBeVisible()
    expect((await screen.findAllByTestId('GridCol'))[0]).toHaveStyle('minHeight: 200px')
  })
  it('should handle onClick', async () => {
    render(<ConfigChange/>, { wrapper: Provider, route: {} })
    await userEvent.click(await screen.findByTestId('Chart'))
    await userEvent.click(await screen.findByTestId('Table'))
  })
})
