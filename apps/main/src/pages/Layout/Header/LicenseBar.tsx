
import { useIntl } from 'react-intl'

import { LayoutUI, Button } from '@acx-ui/components'
import { BulbOutlined }     from '@acx-ui/icons'


export default function RegionButton () {
  const { $t } = useIntl()

  return <div style={{
    display: 'flex',
    width: '50%',
    minWidth: 330,
    backgroundColor: 'rgb(26, 26, 26)',
    height: 40,
    borderRadius: 4,
    marginLeft: 15
  }}>
    <div style={{ width: '10%', display: 'flex',
      alignItems: 'center', justifyContent: 'center' }}>
      <LayoutUI.Icon children={<BulbOutlined />} />
    </div>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      lineHeight: '20px'
    }}>
      <div>{$t({ defaultMessage: 'License for 20 APs will expire in 25 days' })}</div>
      <div>
        <Button type='link' style={{ height: 20, color: '#EC7100', fontWeight: 700 }}>
          {$t({ defaultMessage: 'ensure service level, Act now' })}
        </Button>
      </div>
    </div>
  </div>
}
