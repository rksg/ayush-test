import {
  Form,
  Tooltip,
  Input,
  Space
} from 'antd'
import { useIntl } from 'react-intl'

import { Button }               from '@acx-ui/components'
import {
  QuestionMarkCircleOutlined
} from '@acx-ui/icons'
import { walledGardensRegExp } from '@acx-ui/rc/utils'

/* eslint-disable max-len */
export function WalledGardenTextArea ({ enableDefaultWalledGarden }: { enableDefaultWalledGarden: Boolean }) {

  const { $t } = useIntl()
  const form = Form.useFormInstance()

  const defaultWalledGarden = [
    '*.Ggpht.com',
    '*.accounts.google.com',
    '*.airport.us',
    '*.android.clients.google.com',
    '*.android.com',
    '*.appengine.google.com',
    '*.apple.com',
    '*.apple.com.edgekey.net',
    '*.appleiphonecell.com',
    '*.captive.apple.com',
    '*.clients.google.com',
    '*.clients3.google.com',
    '*.cloud.google.com',
    '*.cloudpath.net',
    '*.geotrust.com',
    '*.googleapis.com',
    '*.googleusercontent.com',
    '*.gsp1.apple.com',
    '*.gvt1.com',
    '*.gstatic.com',
    '*.ibook.info',
    '*.itools.info',
    '*.myaccount.google.com',
    '*.ocsp.godaddy.com',
    '*.play.google.com',
    '*.play.googleapis.com',
    '*.ruckuswireless.com',
    '*.ruckus.cloud',
    '*.settings.crashlytics.com',
    '*.ssl.gstatic.com',
    'Android.clients.google.com',
    'Android.l.google.com',
    'Ggpht.com',
    'captive.apple.com',
    'clients3.google.com',
    'connectivitycheck.android.com',
    'connectivitycheck.gstatic.com',
    'play.googleapis.com',
    'urs.microsoft.com',
    'w.apprep.smartscreen.microsoft.com',
    'www.airport.us',
    'www.appleiphonecell.com',
    'www.googleapis.com',
    'www.ibook.info',
    'www.itools.info',
    'www.thinkdifferent.us',
    '172.217.0.0/16',
    '216.58.0.0/16'
  ]

  return (<Form.Item
    name={['guestPortal', 'walledGardens']}
    rules={[
      { validator: (_, value) => walledGardensRegExp(value.toString()) }
    ]}
    initialValue={enableDefaultWalledGarden ? defaultWalledGarden.toString().replace(/,/g, '\n') : ''}
    label={<>{$t({ defaultMessage: 'Walled Garden' })}
      <Tooltip title={$t({
        defaultMessage: 'Unauthenticated users will be allowed '
                    + 'to access these destinations(i.e., without redirection to captive ' +
                    'portal).'
      }) + '\n' +
                $t({ defaultMessage: 'Each destination should be entered in a new line.' }) + '\n' +
                $t({ defaultMessage: 'Accepted formats for destinations are:' }) + '\n\n' +
                $t({ defaultMessage: '-IP address(e.g. 10.11.12.13)' }) + '\n\n' +
                $t({ defaultMessage: '-IP address range(e.g. 10.11.12.13-10.11.12.15)' }) + '\n\n' +
                $t({ defaultMessage: '-CIDR(e.g. 10.11.12.13/28)' }) + '\n\n' +
                $t({ defaultMessage: '-IP address and mask(e.g. 10.11.12.13 255.255.255.0)' }) + '\n\n' +
                $t({ defaultMessage: '-Website FQDN(e.g. www.ruckus.com)' }) + '\n\n' +
                $t({ defaultMessage: '-Website FQDN with a wildcard(e.g. *.amazon.com; *.com)' }) + '\n'}
      placement='bottom'>
        <QuestionMarkCircleOutlined />
      </Tooltip>
      {enableDefaultWalledGarden &&
                <Button onClick={() => {
                  form.setFieldValue(['guestPortal', 'walledGardens'], defaultWalledGarden)
                }}
                style={{ marginLeft: 90, marginRight: 10 }}
                type='link'>
                  {$t({ defaultMessage: 'Reset to default' })}
                </Button>
      }
      <Space />
      <Button onClick={() => {
        form.setFieldValue(['guestPortal', 'walledGardens'], [])
      }}
      type='link'>
        {$t({ defaultMessage: 'Clear' })}
      </Button>
    </>}
    children={
      <Input.TextArea rows={15}
        style={{ resize: 'none' }}
        onChange={(e) => {
          const values = e.target.value.split('\n')
          const walledGardens = [] as string[]
          values.map(value => {
            if (value.trim()) walledGardens.push(value)
          })
          form.setFieldValue(['guestPortal', 'walledGardens'], walledGardens)
        }}
        placeholder={$t({
          defaultMessage: 'Enter permitted walled ' +
                        'garden destinations and IP subnets, a new line for each ' +
                        'entry. Hover over the question mark for help with this field.'
        })}
      />
    }
  />)
}