import { PageHeader }                     from '@acx-ui/components'
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

  return (
    <PageHeader
      title={name}
      breadcrumb={[
        { text: 'Business Insights' },
        { text: 'Reports', link: '/reports' }
      ]}
      extra={usePageHeaderExtra(type, showFilter)}
      footer={props.footer && props.footer}
      footerSpacer={false}
    />
  )
}
