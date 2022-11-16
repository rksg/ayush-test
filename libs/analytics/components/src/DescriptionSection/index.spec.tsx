import { screen, render, fireEvent } from '@testing-library/react'

import { DescriptionRow, DescriptionSection } from '.'

describe('DescriptionRow', () => {
  const props = {
    label: 'label',
    tooltip: 'tooltip',
    children: <div data-testid='children'>Children</div>
  }
  it('should match snapshot', () => {
    const { asFragment } = render(<DescriptionRow {...props} onClick={jest.fn()}/>)
    expect(asFragment()).toMatchSnapshot()

    const { asFragment: asNoClickFragment } = render(<DescriptionRow {...props}/>)
    expect(asNoClickFragment()).toMatchSnapshot()

    const {
      asFragment: asChildrenTitleFragment
    } = render(<DescriptionRow label='label' children='children'/>)
    expect(asChildrenTitleFragment()).toMatchSnapshot()

    const {
      asFragment: asNoTitleFragment
    } = render(<DescriptionRow label='label' children={<div data-testid='children'/>}/>)
    expect(asNoTitleFragment()).toMatchSnapshot()
  })
  it('should handle onClick', async () => {
    const onClick = jest.fn()
    render(<DescriptionRow {...props} onClick={onClick}/>)
    const component = await screen.findByText('Children')
    fireEvent.click(component)
    expect(onClick).toBeCalledTimes(1)
  })
})


describe('DescriptionSection', () => {
  const props = {
    fields: new Array(3).fill(0).map((_, index) => ({
      label: `label-${index}`,
      tooltip: `tooltip-${index}`,
      children: <div data-testid={`children-${index}`}/>,
      onClick: jest.fn()
    }))
  }
  it('should match snapshot', () => {
    const { asFragment } = render(<DescriptionSection {...props}/>)
    expect(asFragment()).toMatchSnapshot()

    const {
      asFragment: asFragmentWithDiffColumn
    } = render(<DescriptionSection {...props} column={3}/>)
    expect(asFragmentWithDiffColumn()).toMatchSnapshot()
  })
})
