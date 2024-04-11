import { Typography }                 from 'antd'
import { MessageDescriptor, useIntl } from 'react-intl'

import { UserProfile } from '@acx-ui/user'

import * as UI from './styledComponents'

interface UserProfileSectionProps {
  userProfile?: Pick<UserProfile, 'initials' | 'fullName' | 'email'> & {
    role: string | UserProfile['role']
  }
  tenantId?: string
  roleStringMap: Record<string, MessageDescriptor>
}

export const UserProfileSection = (props: UserProfileSectionProps) => {
  const { $t } = useIntl()
  const { Paragraph } = Typography
  return (
    <UI.UserDataWrapper>
      <UI.UserData>
        <UI.UserCircle>{props.userProfile?.initials}</UI.UserCircle>
        {props.userProfile && <div>
          <UI.UserName>{props.userProfile?.fullName}</UI.UserName>
          <UI.UserRole>
            {$t(props.roleStringMap[props.userProfile?.role])}
          </UI.UserRole>
          <UI.UserAttributes>
            <div>
              <b><UI.EnvelopClosedSolidIcon /></b>
              <Paragraph>{props.userProfile?.email}</Paragraph>
            </div>
            <div>
              <b>Tenant ID</b>
              <Paragraph copyable>{props.tenantId}</Paragraph>
            </div>
          </UI.UserAttributes>
        </div>}
      </UI.UserData>
    </UI.UserDataWrapper>
  )
}
