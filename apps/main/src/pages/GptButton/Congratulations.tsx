import { Button }  from 'antd'
import { useIntl } from 'react-intl'

import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { useUserProfileContext }      from '@acx-ui/user'

import * as UI from './styledComponents'

function Congratulations (props: { closeModal: () => void }) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToNetework = useTenantLink('/networks/wireless')
  const linkToWiredProfiles = useTenantLink('networks/wired/profiles')
  const {
    data: userProfileData
  } = useUserProfileContext()
  const name = userProfileData?.lastName || userProfileData?.firstName || ''
  return (
    <UI.Container>
      <UI.Title>
        {`${$t({ defaultMessage: 'Congratulations' })} ${name}!`}
      </UI.Title>
      <UI.Subtitle>
        {// eslint-disable-next-line max-len
          $t({ defaultMessage: 'You have finished onboarding your new <VenueSingular></VenueSingular>!' })}
      </UI.Subtitle>
      <UI.BottomSection>
        <UI.StyledCard>
          <UI.StyledList>
            <li>
              {$t({ defaultMessage: 'View/Edit' })}
              <b> {$t({ defaultMessage: 'Wireless Network' })}</b> ({
                <Button type='link'
                  size='small'
                  onClick={() => {
                    navigate(linkToNetework)
                    props.closeModal()
                  }}>
                  {$t({ defaultMessage: 'Click Here' })}
                </Button>})
            </li>
            <li>
              {$t({ defaultMessage: 'View/Edit' })}
              <b> {$t({ defaultMessage: 'Wired Configurations' })}</b> ({
                <Button type='link'
                  size='small'
                  onClick={() => {
                    navigate(linkToWiredProfiles)
                    props.closeModal()
                  }}>
                  {$t({ defaultMessage: ' Click Here' })}
                </Button>})
            </li>
          </UI.StyledList>
        </UI.StyledCard>
      </UI.BottomSection>
    </UI.Container>
  )
}

export default Congratulations
