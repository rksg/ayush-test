import { Button, Card } from 'antd'

import { GptSuccess }                 from '@acx-ui/icons'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'




function Congratulations (props: {
  closeModal: () => void
}) {
  const navigate = useNavigate()
  const linkToNetework = useTenantLink('/networks/wireless')
  const linkToWiredProfiles = useTenantLink('networks/wired/profiles')
  return <>
    <div
      style={{
        position: 'relative',
        marginTop: '100px',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        marginBottom: '250px'
      }}
    >
      <GptSuccess style={{
        width: '50px', height: '50px'
      }} />
      <span style={{ fontSize: '28px',
        fontWeight: 600,
        marginTop: '30px',
        fontFamily: 'Montserrat' }}>
      Congratulations!
      </span>
      <span style={{ fontSize: '14px', color: '#808284', marginTop: '15px' }}>
      Your network is now fully configured.
      </span>
    </div>


    <div
      style={{
        position: 'absolute',
        bottom: '130px',
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
        style={{
          width: '723px',
          margin: '30px',
          backgroundColor: '#F7F7F7',
          border: '0px',
          borderRadius: '8px',
          height: '90px'
        }}
      >
        <ul style={{
          rowGap: '8px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <li>
            View/Edit <b>Wireless Network</b> ({
              <Button type='link'
                size='small'
                onClick={() => {
                  navigate(linkToNetework)
                  props.closeModal()
                }}>
                Click Here
              </Button>})
          </li>
          <li>
          View/Edit <b>Wired Configurations</b> ({
              <Button type='link'
                size='small'
                onClick={() => {
                  navigate(linkToWiredProfiles)
                  props.closeModal()
                }}>
                Click Here
              </Button>})
          </li>
        </ul>
      </Card>
    </div>
  </>
}

export default Congratulations
