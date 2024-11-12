import { render, screen } from '@testing-library/react'
import { IntlProvider }   from 'react-intl'

import { sampleUserProfile, roleStringMap } from './__tests__/fixtures'

import { UserProfileSection } from '.'

describe('UserProfileSection', () => {
  it('should render correctly', async () => {
    render(<IntlProvider locale='en'>
      <UserProfileSection
        userProfile={sampleUserProfile}
        tenantId={'0015000000Gl19SAAV'}
        roleStringMap={roleStringMap}
      />
    </IntlProvider>)

    expect(screen.getByText('FL')).toBeVisible()
    expect(screen.getByText('First Last')).toBeVisible()
    expect(screen.getByText('Administrator')).toBeVisible()
    expect(screen.getByText('test123@gmail.com')).toBeVisible()
    expect(screen.getByText('0015000000Gl19SAAV')).toBeVisible()
  })
})
