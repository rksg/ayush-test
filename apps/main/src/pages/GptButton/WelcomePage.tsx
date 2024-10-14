/* eslint-disable max-len */


import { Avatar, Card } from 'antd'
import Meta             from 'antd/lib/card/Meta'

import { GptBackground, GptWhiteicon } from '@acx-ui/icons'




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
      <span style={{ fontSize: '28px', fontWeight: 600, marginTop: '30px', fontFamily: 'Montserrat' }}>
    Hi, I’m RuckusGPT
      </span>
      <span style={{ fontSize: '14px', color: '#808284', marginTop: '15px' }}>
    Your new personal network assistant
      </span>
    </div>


    <div
      style={{
        position: 'absolute', // 绝对定位
        bottom: '30px',        // 固定在底部
        left: '50%',        // 水平居中
        transform: 'translateX(-50%)', // 精确居中
        display: 'flex',
        flexDirection: 'column', // 垂直排列
        alignItems: 'center',   // 水平居中内容
        padding: '16px',        // 增加内边距
        backgroundColor: 'white' // 可选：按钮背景色
      }}
    >
      <Card
        style={{ width: 780, margin: '30px' }}
      >
        <Meta
          avatar={<Avatar src='https://api.dicebear.com/7.x/miniavs/svg?seed=8' />}
          title='About RuckusGPT'
          style={{ fontFamily: 'Montserrat' }}
          description='RuckusGPT helps you efficiently build vertical networks tailored to your specific needs, guiding you step-by-step for optimal performance and scalability.'
        />
      </Card>
    </div>
  </>
}

export default WelcomePage
