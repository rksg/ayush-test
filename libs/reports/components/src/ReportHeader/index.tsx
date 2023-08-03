import { PageHeader }             from '@acx-ui/components'
import { get }                    from '@acx-ui/config'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

import { ReportType }         from '../mapping/reportsMapping'
import { usePageHeaderExtra } from '../PageHeaderExtra'


export function ReportHeader (props: {
  name: string,
  showFilter?: boolean
  footer?: React.ReactNode,
  type: ReportType }) {
  const {
    name,
    showFilter=true,
    type
  } = props
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)
  const isMLISA = get('IS_MLISA_SA')

  return (
    <PageHeader
      title={name}
      breadcrumb={isNavbarEnhanced || isMLISA
        ? [
          { text: 'Business Insights' },
          { text: 'Reports', link: '/reports' }
        ] : [
          { text: 'Reports', link: '/reports' }
        ]}
      extra={usePageHeaderExtra(type, showFilter)}
      footer={props.footer && props.footer}
      footerSpacer={false}
    />
  )
}
