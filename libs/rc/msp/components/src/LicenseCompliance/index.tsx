import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

// import { cssNumber } from '@acx-ui/components'

import * as UI from './styledComponents'


// interface ShowMoreFirmwaresLinkProps {
//     shownMoreFirmwaresInBanner: boolean
//     setShownMoreFirmwaresInBanner: (shown: boolean) => void
// }

// function ShowMoreNotesLink (props: ShowMoreFirmwaresLinkProps) {
//   const { $t } = useIntl()
//   const { shownMoreFirmwaresInBanner, setShownMoreFirmwaresInBanner } = props

//   return <span
//     style={{
//       cursor: 'pointer',
//       color: 'var(--acx-accents-blue-50)',
//       fontSize: cssNumber('--acx-body-4-font-size')
//     }}
//     onClick={() => setShownMoreFirmwaresInBanner(!shownMoreFirmwaresInBanner)}
//   >
//     {shownMoreFirmwaresInBanner
//       ? $t({ defaultMessage: 'Show less' })
//       : $t({ defaultMessage: 'Show more' })
//     }
//   </span>
// }

const ComplianceBanner = () => {
  const { $t } = useIntl()
  // const [ shownMoreFirmwaresInBanner, setShownMoreFirmwaresInBanner ] = useState(false)

  return (
    <UI.BannerVersion>
      <Row justify='space-between' gutter={[16, 16]}>
        <Col style={{ width: '100%' }}>
          <UI.LatestVersion>
            {$t({ defaultMessage: 'Attention Notes' })}
          </UI.LatestVersion>
        </Col>
      </Row>
    </UI.BannerVersion>
  )
}


export const LicenseCompliance = () => {
  return (
    <ComplianceBanner />
  )
}
