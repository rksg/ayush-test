import { render, screen } from '@acx-ui/test-utils'

import Assoc from './Details/Assoc'
import Auth from './Details/Auth'
import Dhcp from './Details/Dhcp'
import Eap from './Details/Eap'
import Radius from './Details/Radius'

describe('incident details', () => {
  it('should render assoc properly', () => {
    const { asFragment } = render(<Assoc />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render auth properly', () => {
    const { asFragment } = render(<Auth />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render dhcp properly', () => {
    const { asFragment } = render(<Dhcp />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render eap properly', () => {
    const { asFragment } = render(<Eap />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render radius properly', () => {
    const { asFragment } = render(<Radius />)
    expect(asFragment()).toMatchSnapshot()
  })
})
