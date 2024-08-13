import { useState } from 'react'

import { Col, Row }  from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { cssNumber }                             from '@acx-ui/components'
import { useGetEntitlementsAttentionNotesQuery } from '@acx-ui/msp/services'

import { fakeAttentionNotes } from './__tests__/fixtures'
import * as UI                from './styledComponents'



interface ShowMoreNotesLinkProps {
    shownMoreNotesInBanner: boolean
    setShownMoreNotesInBanner: (shown: boolean) => void
}

function ShowMoreNotesLink (props: ShowMoreNotesLinkProps) {
  const { $t } = useIntl()
  const { shownMoreNotesInBanner, setShownMoreNotesInBanner } = props

  return <span
    style={{
      cursor: 'pointer',
      color: 'var(--acx-accents-blue-50)',
      fontSize: cssNumber('--acx-body-4-font-size')
    }}
    onClick={() => setShownMoreNotesInBanner(!shownMoreNotesInBanner)}
  >
    {shownMoreNotesInBanner
      ? $t({ defaultMessage: 'Show less' })
      : $t({ defaultMessage: 'Show more' })
    }
  </span>
}

export const ComplianceBanner = () => {
  const { $t } = useIntl()
  const params = useParams()
  const [ shownMoreNotesInBanner, setShownMoreNotesInBanner ] = useState(false)

  const notesPayload = {
    filters: {
      usageType: 'ASSIGNED'
    }
  }
  const queryData = useGetEntitlementsAttentionNotesQuery(
    { params, payload: notesPayload }, { skip: true })

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
        <Col>
          <ShowMoreNotesLink
            shownMoreNotesInBanner={shownMoreNotesInBanner}
            setShownMoreNotesInBanner={setShownMoreNotesInBanner}
          />
        </Col>

      </Row>
    </UI.BannerVersion>
  )
}

