import { storiesOf } from '@storybook/react'

import { sampleUserProfile, roleStringMap } from './__tests__/fixtures'

import { UserProfileSection } from '.'

storiesOf('UserProfileSection', module)
  .add('Basic', () => <UserProfileSection
    userProfile={sampleUserProfile}
    tenantId={'0015000000Gl19SAAV'}
    roleStringMap={roleStringMap}
  />)

export {}
