import { useState } from 'react'

import { Col, Row }  from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { cssNumber }                             from '@acx-ui/components'
import { InformationSolid }                      from '@acx-ui/icons'
import { useGetEntitlementsAttentionNotesQuery } from '@acx-ui/msp/services'

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

  const notesPayload = {
    page: 1,
    pageSize: 20,
    fields: ['summary', 'details'],
    sortField: 'status',
    sortOrder: 'DESC',
    filters: {
      type: ['STOP_COURTESY'],
      tenantType: ['MSP', 'ALL'],
      status: ['VALID'],
      licenseCheck: true
    }
  }
  const { data: queryData } = useGetEntitlementsAttentionNotesQuery(
    { params, payload: notesPayload })

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

