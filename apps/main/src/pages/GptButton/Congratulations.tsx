import { Button }  from 'antd'
import { useIntl } from 'react-intl'

import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

function Congratulations (props: { closeModal: () => void }) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToNetework = useTenantLink('/networks/wireless')
  const linkToWiredProfiles = useTenantLink('networks/wired/profiles')

  return (
    <>
      <UI.Container>
        <UI.GptSuccessStyled />
        <UI.Title>
          {$t({ defaultMessage: 'Congratulations!' })}
        </UI.Title>
        <UI.Subtitle>
          {$t({ defaultMessage: 'Your network is now fully configured.' })}
        </UI.Subtitle>
      </UI.Container>

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
    </>
  )
}

export default Congratulations
