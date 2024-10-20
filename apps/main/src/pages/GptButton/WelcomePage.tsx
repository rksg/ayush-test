import { Avatar, Card } from 'antd'
import Meta             from 'antd/lib/card/Meta'

import { GptBackground, GptWhiteicon } from '@acx-ui/icons'


// Waiting for new UX design
function WelcomePage () {
  return <>
    <GptBackground
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%'
      }}
    />
    <div
      style={{
        position: 'relative',
        marginTop: '190px',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        marginBottom: '150px'
      }}
    >
      <GptWhiteicon style={{
        width: '90px', height: '90px'
      }} />
      <span style={{
        fontSize: '28px',
        fontWeight: 600, marginTop: '30px',
        fontFamily: 'Montserrat'
      }}>
        Hi, I’m RuckusGPT
      </span>
      <span style={{ fontSize: '14px', color: '#808284', marginTop: '15px' }}>
    Your new personal network assistant
      </span>
    </div>


    <div
      style={{
        position: 'absolute',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px',
        backgroundColor: 'white'
      }}
    >
      <Card
        style={{ width: 780, margin: '30px' }}
      >
        <Meta
          avatar={<Avatar src='https://api.dicebear.com/7.x/miniavs/svg?seed=8' />}
          title='About RuckusGPT'
          style={{ fontFamily: 'Montserrat' }}
          // eslint-disable-next-line max-len
          description='RuckusGPT helps you efficiently build vertical networks tailored to your specific needs, guiding you step-by-step for optimal performance and scalability.'
        />
      </Card>
    </div>
  </>
}

export default WelcomePage
