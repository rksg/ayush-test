import { Button }  from 'antd'
import { useIntl } from 'react-intl'

import { cssStr }                     from '@acx-ui/components'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { useUserProfileContext }      from '@acx-ui/user'

import * as UI from './styledComponents'

function Congratulations (props: {
  closeModal: () => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  configResponse: any
}) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToNetework = useTenantLink('/networks/wireless')
  const linkToWiredProfiles = useTenantLink('networks/wired/profiles')
  const {
    data: userProfileData
  } = useUserProfileContext()
  const name = userProfileData?.firstName || userProfileData?.lastName || ''
  return (
    <UI.CongratContainer>
      <UI.CongrateTitle>
        {`${$t({ defaultMessage: 'Congratulations' })} ${name}!`}
      </UI.CongrateTitle>
      <UI.CongratSubtitle>
        {// eslint-disable-next-line max-len
          $t({ defaultMessage: 'You have finished onboarding your new <VenueSingular></VenueSingular>!' })}
      </UI.CongratSubtitle>
      <UI.CongratBox>
        <UI.CongratCard>
          <div style={{
            marginBottom: '20px',
            fontSize: cssStr('--acx-headline-5-font-size')
          }}>
            { // eslint-disable-next-line max-len
              $t({ defaultMessage: 'You are welcome to review and modify your <venueSingular></venueSingular> network and switch configurations from the list provided below. This will help ensure that all settings have been successfully configured to meet your needs.' })}
          </div>
          <UI.StyledList>
            <li>
              {$t({ defaultMessage: 'View/Edit' })}
              <b> {$t({ defaultMessage: 'Wireless Network' })}</b> ({
                <Button type='link'
                  style={{ fontSize: '14px' }}
                  data-testid='network-link'
                  onClick={() => {
                    navigate(linkToNetework)
                    props.closeModal()
                  }}>
                  {$t({ defaultMessage: 'Click Here' })}
                </Button>})
            </li>
            {Array.isArray(props.configResponse?.['vlan']) &&
              props.configResponse['vlan'].length > 0 &&
              <li>
                {$t({ defaultMessage: 'View/Edit' })}
                <b> {$t({ defaultMessage: 'Wired Configurations' })}</b> ({
                  <Button type='link'
                    style={{ fontSize: '14px' }}
                    data-testid='wired-link'
                    onClick={() => {
                      navigate(linkToWiredProfiles)
                      props.closeModal()
                    }}>
                    {$t({ defaultMessage: ' Click Here' })}
                  </Button>})
              </li>
            }
          </UI.StyledList>
        </UI.CongratCard>
      </UI.CongratBox>
    </UI.CongratContainer>
  )
}

export default Congratulations
