import '@testing-library/jest-dom'
import { render } from '@testing-library/react'

import { NewTabLink } from './NewTabLink'

import type { LinkProps } from 'react-router-dom'

jest.mock('react-router-dom', () => ({
  Link: (props: LinkProps) => <div>{JSON.stringify(props)}</div>
}))

describe('NewTabLink', () => {
  it('should render a Link with correct props', () => {
    const { asFragment } = render(<NewTabLink to='/some/url'>link text</NewTabLink>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render an anchor with correct attributes', () => {
    const { asFragment } = render(<NewTabLink to='https://test.com'>link text</NewTabLink>)
    expect(asFragment()).toMatchSnapshot()
  })
})
