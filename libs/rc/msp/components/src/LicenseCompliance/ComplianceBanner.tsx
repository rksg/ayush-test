import { useState } from 'react'

import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'
// import { useParams } from 'react-router-dom'

import { cssNumber }        from '@acx-ui/components'
import { InformationSolid } from '@acx-ui/icons'
// import { useGetEntitlementsAttentionNotesQuery } from '@acx-ui/msp/services'

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
  //   const params = useParams()
  const [ shownMoreNotesInBanner, setShownMoreNotesInBanner ] = useState(false)

  //   const notesPayload = {
  //     filters: {
  //       usageType: 'ASSIGNED'
  //     }
  //   }
  //   const queryData = useGetEntitlementsAttentionNotesQuery(
  //     { params, payload: notesPayload }, { skip: true })

  return (
    <UI.BannerComplianceNotes>
      <Row justify='space-between' gutter={[16, 16]}>
        <Col>
          <UI.ComplianceNotesLabel>
            <InformationSolid />
            {$t({ defaultMessage: 'Attention Notes' })}
          </UI.ComplianceNotesLabel>
        </Col>
        <Col>
          <ShowMoreNotesLink
            shownMoreNotesInBanner={shownMoreNotesInBanner}
            setShownMoreNotesInBanner={setShownMoreNotesInBanner}
          />
        </Col>
      </Row>
      {
        fakeAttentionNotes.attentionNotes.map((note) => (
          <div className='note' key={note.summary}>- {note.summary}
            {shownMoreNotesInBanner && note.details &&
              note.details.map((detail) => (
                <div className='detail' key={detail}>{detail}</div>
              ))
            }
          </div>
        ))
      }
    </UI.BannerComplianceNotes>
  )
}

