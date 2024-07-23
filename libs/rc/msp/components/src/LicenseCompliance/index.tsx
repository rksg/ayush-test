import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

// import { cssNumber } from '@acx-ui/components'

import { Card } from '@acx-ui/components'

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
          <div>{$t({ defaultMessage: `- On January 1, 2025 RUCKUS One will 
            stop adding 5% courtesy licenses to the MSP subscriptions.` })}</div>
          <div>{$t({ defaultMessage: `- On March 1, 2025 RUCKUS One will start enforcing 
            subscription expiration policy, which may have an impact on your network operation.` })}
          </div>
        </Col>
      </Row>
    </UI.BannerVersion>
  )
}

const DeviceNetworking = () => {
  const { $t } = useIntl()
  return (
    <Col style={{ width: '395px', paddingLeft: 0, marginTop: '15px' }}>
      <Card
        title={$t({ defaultMessage: 'Device Networking Subscriptions' })}
        subTitle={$t({ defaultMessage: 'License Expiration' })}
      >
        {/* <Title>{$t({ defaultMessage: 'Attention Notes' })}</Title> */}
        {/* <Description>{description}</Description>
    { categories.length > 0 &&
      <CategoryWrapper>{categories.map(category=> {
        const set = categoryMapping[category]
        return set && <Category key={category} color={set.color}>{$t(set.text)}</Category>
      })}
      </CategoryWrapper>}
    {(type === 'button' && buttonText) &&
      <Button onClick={onClick} size='small' type='primary'>{$t(buttonText)}</Button>}
    {type === 'radio' && <Radio value={value} {...rest}/>} */}
      </Card></Col>

  )
}

export const LicenseCompliance = () => {
  return <>
    <ComplianceBanner />
    <DeviceNetworking />
  </>
}
