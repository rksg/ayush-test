import { useState } from 'react'

import { Col, Row }  from 'antd'
import _             from 'lodash'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { cssNumber }                                              from '@acx-ui/components'
import { Features, useIsSplitOn }                                 from '@acx-ui/feature-toggle'
import { InformationSolid }                                       from '@acx-ui/icons'
import { useGetEntitlementsAttentionNotesQuery }                  from '@acx-ui/msp/services'
import { GeneralAttentionNotesPayload, MspAttentionNotesPayload } from '@acx-ui/msp/utils'

import * as UI from './styledComponents'

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
  const isAttentionNotesToggleEnabled = useIsSplitOn(Features.ENTITLEMENT_ATTENTION_NOTES_TOGGLE)

  const { data: queryData } = useGetEntitlementsAttentionNotesQuery(
    { params, payload: isAttentionNotesToggleEnabled
      ? GeneralAttentionNotesPayload : MspAttentionNotesPayload })

  return (
    _.isEmpty(queryData?.data) ? <></>
      : <UI.BannerComplianceNotes>
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
          queryData?.data.map((note) => (
            <div className='note' key={note.summary}>- {note.summary}
              {shownMoreNotesInBanner && note.details &&
              <div className='detail' key={note.details}>{note.details}</div>
              }
            </div>
          ))
        }
      </UI.BannerComplianceNotes>
  )
}

