import { render } from '@testing-library/react'

import { StatusLight } from './index'

describe('StatusLight', () => {
  const config = {
    REQUIRES_ATTENTION: {
      color: '--acx-semantics-red-50',
      text: 'Requires Attention'
    },
    TEMPORARILY_DEGRADED: {
      color: '--acx-semantics-yellow-50',
      text: 'Temporarily Degraded'
    },
    IN_SETUP_PHASE: {
      color: '--acx-neutrals-50',
      text: 'In Setup Phase'
    },
    OFFLINE: {
      color: '--acx-neutrals-50',
      text: 'Offline'
    },
    OPERATIONAL: {
      color: '--acx-semantics-green-50',
      text: 'Operational'
    }
  }
  it('should render correctly', () => {
    const { asFragment } = render(<>
      <StatusLight config={config} data='REQUIRES_ATTENTION' />
      <StatusLight config={config} data='TEMPORARILY_DEGRADED' />
      <StatusLight config={config} data='IN_SETUP_PHASE' />
      <StatusLight config={config} data='OFFLINE' />
      <StatusLight config={config} data='OPERATIONAL' />
      <StatusLight config={config} data='OPERATIONAL' showText={false} />
    </>)
    expect(asFragment()).toMatchSnapshot()
  })
})