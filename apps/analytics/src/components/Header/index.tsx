import { defineMessage, useIntl } from 'react-intl'

import { NodeType, nodeTypes, useAnalyticsFilter }     from '@acx-ui/analytics/utils'
import { PageHeader, PageHeaderProps, Button, Loader } from '@acx-ui/components'

import { useNetworkNodeInfoQuery } from './services'
import { Divider }                 from './styledComponents'
import NetworkFilter              from '../NetworkFilter'

const labelMap = {
  type: defineMessage({ defaultMessage: 'Type:' }),
  model: defineMessage({ defaultMessage: 'Model:' }),
  firmware: defineMessage({ defaultMessage: 'Firmware:' }),
  version: defineMessage({ defaultMessage: 'Firmware:' }),
  mac: defineMessage({ defaultMessage: 'MAC Address:' }),
  internalIp: defineMessage({ defaultMessage: 'IP Address:' }),
  apCount: defineMessage({ defaultMessage: 'APs:' }),
  clientCount: defineMessage({ defaultMessage: 'Clients:' }),
  portCount: defineMessage({ defaultMessage: 'Ports:' }),
  switchCount: defineMessage({ defaultMessage: 'Switches:' })
}

export type SubTitle = {
  key: string
  value: (number | string)[]
}

export type HeaderData = {
  title: string,
  subTitle: SubTitle[]
}

type HeaderProps = Omit<PageHeaderProps, 'subTitle'> & {
  data: HeaderData
  replaceTitle: boolean
}

export const useSubTitle = (subTitles: SubTitle[]) => {
  const { $t } = useIntl()
  return (<>{subTitles.map(({ key, value }, index) => {
    const labelKey = key as keyof typeof labelMap
    const content = key === 'type'
      ? $t(nodeTypes(value[0] as NodeType))
      : value.length > 1 ? `${value[0]} (${value.length})` : `${value[0]}`
    return (
      <span key={key} title={key === 'type' ? content : value.join(', ')}>
        {$t(labelMap[labelKey])} {content}
        {index < subTitles.length - 1 && <Divider key={key} type='vertical' />}
      </span>
    )
  })}</>)
}

export const Header = ({ data, replaceTitle, ...otherProps }: HeaderProps) => {
  const { $t } = useIntl()
  const { title, subTitle } = data
  const props = { ...otherProps, subTitle: useSubTitle(subTitle) }
  if (replaceTitle) props.title = title
  return (
    <PageHeader {...props}
      extra={[
        <NetworkFilter key='network-filter' />,
        <Button key='date-filter'>{$t({ defaultMessage: 'date filter' })}</Button>
      ]}/>
  )
}

const ConnectedHeader = (props: PageHeaderProps) => {
  const { filters } = useAnalyticsFilter()
  const queryResults = useNetworkNodeInfoQuery(filters)
  return <div>
    <Loader states={[queryResults]}>
      <Header {...props}
        data={queryResults.data as HeaderData}
        replaceTitle={filters.path.length > 1}
      />
    </Loader>
  </div>
}

export default ConnectedHeader
