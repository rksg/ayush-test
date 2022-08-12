import React from 'react'

import { PageHeader }   from '..'
import { SeverityPill } from '../../Pill'

export function WithTitleExtra () {
  return <PageHeader
    title='With Title Extra'
    titleExtra={<SeverityPill severity='P1' />}
  />
}

