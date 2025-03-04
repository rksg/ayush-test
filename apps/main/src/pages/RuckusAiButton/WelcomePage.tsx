import { Card }    from 'antd'
import { useIntl } from 'react-intl'

import { Features, useIsTierAllowed }               from '@acx-ui/feature-toggle'
import { DogAndPerson, OnboardingDog, WelcomeLogo } from '@acx-ui/icons'
import { RuckusAiDog }                              from '@acx-ui/icons-new'
import { useUserProfileContext }                    from '@acx-ui/user'

import * as UI from './styledComponents'

function WelcomePage () {
  const { $t } = useIntl()
  const {
    data: userProfileData
  } = useUserProfileContext()
  const isCanvasEnabled = useIsTierAllowed(Features.CANVAS)
  const name = userProfileData?.firstName || userProfileData?.lastName || ''
  return <div
    style={{
      position: 'relative',
      marginTop: '60px',
      zIndex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      height: '100%',
      minHeight: '200px',
      maxHeight: 'calc(100vh - 250px)',
      overflowY: 'auto'
    }}
  >
    <div style={{
      height: '110px'
    }} >
      {
        isCanvasEnabled ? <RuckusAiDog style={{
          width: '110px', height: '110px'
        }} />:
          <WelcomeLogo style={{
            width: '110px', height: '110px'
          }} />
      }
    </div>

    <span style={{
      fontSize: '24px',
      fontWeight: 700,
      marginTop: '25px',
      fontFamily: 'Montserrat'
    }}>
      {`${$t({ defaultMessage: 'Hello' })} ${name},`}
    </span>
    {
      isCanvasEnabled ? <span style={{
        fontSize: '24px',
        fontWeight: 500,
        fontFamily: 'Montserrat'
      }}>
        {$t({ defaultMessage: 'Welcome! Let' })}
        {/* <RuckusAiLogo
          style={{
            height: '20px',
            marginBottom: '-1px'
          }} /> */}
        <span
          style={{
            fontSize: '24px',
            fontWeight: 700,
            fontFamily: 'Montserrat',
            color: '#EC7100',
            margin: '0 7px 0 2px'
          }}
        > {$t({ defaultMessage: 'RUCKUS AI' })}
        </span>
        {$t({ defaultMessage: 'simplify your work' })}
      </span> : <span style={{
        fontSize: '24px',
        fontWeight: 700,
        fontFamily: 'Montserrat'
      }}>
        {$t({ defaultMessage: "I'm your personal" })}
        {/* <RuckusAiLogo
        style={{
          height: '20px',
          marginBottom: '-1px'
        }} /> */}
        <span
          style={{
            fontSize: '24px',
            fontWeight: 700,
            fontFamily: 'Montserrat',
            color: '#EC7100'
          }}
        > {$t({ defaultMessage: 'Onboarding Assistant' })}</span>
      </span>
    }
    {
      isCanvasEnabled ? <UI.WelcomeCards>
        <Card>
          <UI.WelcomeMeta
            title={<span
              className='card-title'
            > <OnboardingDog />{$t({ defaultMessage: 'Onboarding Assistant' })}</span>}
            style={{ fontFamily: 'Montserrat' }}
            // eslint-disable-next-line max-len
            description={$t({ defaultMessage: 'Onboarding Assistant automates and optimizes complex network onboarding processes, leading to increased efficiency and productivity.' })}
          />
        </Card>
        <Card>
          <UI.WelcomeMeta
            title={<span
              className='card-title'
            > <OnboardingDog />{$t({ defaultMessage: 'Onboarding Assistant' })}</span>}
            style={{ fontFamily: 'Montserrat' }}
            // eslint-disable-next-line max-len
            description={$t({ defaultMessage: 'Onboarding Assistant automates and optimizes complex network onboarding processes, leading to increased efficiency and productivity.' })}
          />
        </Card>
      </UI.WelcomeCards> :
        <Card
          style={{
            width: '780px',
            margin: '100px 30px 30px 30px',
            height: '125px',
            background: '#FFFFFFCC'
          }}
        >
          <UI.WelcomeMeta
            avatar={<DogAndPerson style={{
              position: 'absolute',
              top: '-57px',
              left: '-1px',
              zIndex: '1'
            }} />}
            title={<>{$t({ defaultMessage: 'About' })} <span
              style={{
                fontSize: '18px',
                fontWeight: 700,
                fontFamily: 'Montserrat',
                color: '#EC7100'
              }}
            > {$t({ defaultMessage: 'Onboarding Assistant' })}</span></>}
            style={{ fontFamily: 'Montserrat' }}
            // eslint-disable-next-line max-len
            description={$t({ defaultMessage: 'Onboarding Assistant automates and optimizes complex network onboarding processes, leading to increased efficiency and productivity.' })}
          />
        </Card>
    }
  </div>
}

export default WelcomePage
