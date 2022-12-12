
import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { Card, GridCol, GridRow }   from '@acx-ui/components'
import { Demo, PortalLanguageEnum } from '@acx-ui/rc/utils'

import Photo              from '../../../../assets/images/portal-demo/PortalPhoto.svg'
import Powered            from '../../../../assets/images/portal-demo/PoweredLogo.svg'
import Logo               from '../../../../assets/images/portal-demo/RuckusCloud.svg'
import { getLanguage }    from '../../commonUtils'
import PortalPreviewModal from '../PortalPreviewModal'
export default function PortalOverview (props: { demoValue: Demo }) {
  const { $t } = useIntl()
  const { demoValue } = props
  const newDemo = { ...demoValue, poweredImg: demoValue.poweredImg || Powered,
    logo: demoValue.logo || Logo, photo: demoValue.photo || Photo }
  return (
    <Card>
      <GridRow>
        <GridCol col={{ span: 8 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Language' })}
          </Card.Title>
          <Typography.Text>{
            getLanguage(newDemo.displayLangCode as keyof typeof PortalLanguageEnum)}
          </Typography.Text>
        </GridCol>
        <GridCol col={{ span: 12 }}>
          <Card.Title>
            {$t({ defaultMessage: 'WiFi4EU Snippet' })}
          </Card.Title>
          <Typography.Text>{newDemo?.componentDisplay?.wifi4eu?
            $t({ defaultMessage: 'ON' }):$t({ defaultMessage: 'OFF' })}</Typography.Text>
        </GridCol>
        <GridCol col={{ span: 4 }}>
          <Card.Title><PortalPreviewModal demoValue={newDemo}/></Card.Title>
        </GridCol>
      </GridRow>

    </Card>
  )
}
