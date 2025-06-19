import { Space, Badge } from 'antd'
import { cloneDeep }    from 'lodash'

import { Tooltip }                                                   from '@acx-ui/components'
import { defaultSort, EdgeWanLinkHealthStatusEnum, convertIpToLong } from '@acx-ui/rc/utils'
import { getIntl, noDataDisplay }                                    from '@acx-ui/utils'

import { StyledWanLinkTargetWrapper } from './styledComponents'

type EdgeWanLinkHealthStatusLightProps = {
  status: EdgeWanLinkHealthStatusEnum,
  targetIpStatus: { ip: string, status: EdgeWanLinkHealthStatusEnum }[] | undefined
}

export const EdgeWanLinkHealthStatusLight = (props: EdgeWanLinkHealthStatusLightProps) => {
  const { status, targetIpStatus } = props

  return <Badge
    color={getEdgeWanLinkHealthStatusLightConfig(status).color}
    text={<Tooltip
      placement='bottom'
      dottedUnderline
      title={targetIpStatus
        ? <Space direction='vertical' style={{ padding: 4 }}>
          { // clone first to prevent issue if the given array is immutable
            cloneDeep(targetIpStatus)
              .sort((a, b) => defaultSort(convertIpToLong(a.ip), convertIpToLong(b.ip)))
              .map(({ ip, status }) => {
                const config = getEdgeWanLinkHealthStatusLightConfig(status)
                return <StyledWanLinkTargetWrapper key={ip} >
                  <span>{ip}</span>
                  <Badge
                    key={ip}
                    color={config.color}
                    text={config.text}
                  />
                </StyledWanLinkTargetWrapper>
              })}
        </Space>
        : ''}
    >
      {getEdgeWanLinkHealthStatusLightConfig(status).text}
    </Tooltip>}
  />
}

const getEdgeWanLinkHealthStatusLightConfig = (status: EdgeWanLinkHealthStatusEnum | string) => {
  const { $t } = getIntl()

  switch (status) {
    case EdgeWanLinkHealthStatusEnum.UP:
      return {
        color: 'var(--acx-semantics-green-50)',
        text: $t({ defaultMessage: 'Up' })
      }
    case EdgeWanLinkHealthStatusEnum.DOWN:
      return {
        color: 'var(--acx-semantics-red-50)',
        text: $t({ defaultMessage: 'Down' })
      }
    case EdgeWanLinkHealthStatusEnum.INVALID:
    default:
      return {
        color: 'var(--acx-neutrals-50)',
        text: noDataDisplay
      }
  }
}