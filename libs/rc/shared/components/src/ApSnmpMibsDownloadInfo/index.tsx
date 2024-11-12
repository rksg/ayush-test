/* eslint-disable max-len */
import { Space }            from 'antd'
import { FormattedMessage } from 'react-intl'

import { InformationSolid } from '@acx-ui/icons'
import { NewTabLink }       from '@acx-ui/react-router-dom'


export const ApSnmpMibsDownloadInfo = () => {

  return (<Space align='start' size={'small'} style={{ width: '600px' }}>
    <InformationSolid />
    <FormattedMessage
      defaultMessage={`You can <supportSiteLink>download RUCKUS One MIBs file</supportSiteLink> and load it into your SNMP console 
      to monitor the objects that are defined in the MIBs.`}
      values={{
        supportSiteLink: (content) => (<NewTabLink to='https://support.ruckuswireless.com/software?query=Ruckus+One'>
          {content}
        </NewTabLink>)
      }}
    />
  </Space>)
}