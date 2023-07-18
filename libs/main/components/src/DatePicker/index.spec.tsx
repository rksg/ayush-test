import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent          from '@testing-library/user-event'
import { IntlProvider }   from 'react-intl'

import {
  UserProfile as UserProfileInterface,
  UserProfileContext,
  UserProfileContextProps,
  setUserProfile
}         from '@acx-ui/user'

import { DatePicker } from '.'
const userProfile = {
  initials: 'FL',
  fullName: 'First Last',
  email: 'dog12@email.com',
  dateFormat: 'yyyy/mm/dd',
  detailLevel: 'su'
} as UserProfileInterface


describe('DatePicker', () => {
  it('should open when click on date select', async () => {
    setUserProfile({ profile: userProfile, allowedOperations: [] })

    render(
      <IntlProvider locale='en'>
        <UserProfileContext.Provider
          value={{ data: userProfile } as UserProfileContextProps}
        ></UserProfileContext.Provider>
        <DatePicker />
      </IntlProvider>
    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Select date')
    await user.click(calenderSelect)
    expect(await screen.findByText('Su')).toBeDefined()
  })
})