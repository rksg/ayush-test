import { PageHeader }                     from '@acx-ui/components'
import { Features, useIsSplitOn }         from '@acx-ui/feature-toggle'
import { ReportType, usePageHeaderExtra } from '@acx-ui/reports/components'

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

  return (
    <PageHeader
      title={name}
      breadcrumb={isNavbarEnhanced
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
