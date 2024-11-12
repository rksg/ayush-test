import { MessageDescriptor, defineMessage } from 'react-intl'

export const sampleUserProfile = {
  initials: 'FL',
  fullName: 'First Last',
  email: 'test123@gmail.com',
  role: 'admin'
}

export const roleStringMap: Record<string, MessageDescriptor> = {
  admin: defineMessage({ defaultMessage: 'Administrator' })
}
