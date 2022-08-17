import { render, screen } from '@acx-ui/test-utils'

import { GridRow, GridCol } from '.'

describe('Grid', () => {
  it('should render grid row', () => {
    render(<GridRow>row</GridRow>)
    expect(screen.getByText('row')).toBeVisible()
  })
  it('should render grid col', () => {
    render(<GridCol col={{ span: 1 }}>col</GridCol>)
    expect(screen.getByText('col')).toBeVisible()
  })
})
