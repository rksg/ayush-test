import { Card }    from 'antd'
import { useIntl } from 'react-intl'

import { DogAndPerson, RuckusAiLogo, WelcomeLogo } from '@acx-ui/icons'
import { useUserProfileContext }                   from '@acx-ui/user'

import * as UI from './styledComponents'

function WelcomePage () {
  const { $t } = useIntl()
  const {
    data: userProfileData
  } = useUserProfileContext()
  const name = userProfileData?.firstName || userProfileData?.lastName || ''
  return <div
    style={{
      position: 'relative',
      marginTop: '60px',
      zIndex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%'
    }}
  >
    <WelcomeLogo style={{
      width: '110px', height: '110px'
    }} />
    <span style={{
      fontSize: '24px',
      fontWeight: 700,
      marginTop: '25px',
      fontFamily: 'Montserrat'
    }}>
      {`${$t({ defaultMessage: 'Hello' })} ${name},`}
    </span>
    <span style={{
      fontSize: '24px',
      fontWeight: 700,
      fontFamily: 'Montserrat'
    }}>
      {$t({ defaultMessage: "I'm" })}
      <RuckusAiLogo
        style={{
          height: '20px',
          marginBottom: '-1px'
        }} />
    </span>
    <span style={{ fontSize: '14px', color: '#808284', marginTop: '15px', fontWeight: 600 }}>
      {$t({ defaultMessage: 'Your personal onboarding assistant' })}
    </span>

    <Card
      style={{ width: '780px', margin: '100px 30px 30px 30px', height: '125px' }}
    >
      <UI.WelcomeMeta
        avatar={<DogAndPerson style={{
          position: 'absolute',
          top: '-57px',
          left: '-1px',
          zIndex: '1'
        }} />}
        title={$t({ defaultMessage: 'About RUCKUS AI' })}
        style={{ fontFamily: 'Montserrat' }}
        // eslint-disable-next-line max-len
        description={$t({ defaultMessage: 'RUCKUS AI automates and optimizes complex network onboarding processes, leading to increased efficiency and productivity.' })}
      />
    </Card>
  </div>
}

export default WelcomePage
