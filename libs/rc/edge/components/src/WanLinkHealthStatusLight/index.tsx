import { Space, Badge } from 'antd'
import { cloneDeep }    from 'lodash'
import { useIntl }      from 'react-intl'

import { Tooltip }                                                   from '@acx-ui/components'
import { defaultSort, EdgeWanLinkHealthStatusEnum, convertIpToLong } from '@acx-ui/rc/utils'

import { StyledWanLinkTargetWrapper } from './styledComponents'

type EdgeWanLinkHealthStatusLightProps = {
  status: EdgeWanLinkHealthStatusEnum,
  targetIpStatus: { ip: string, status: EdgeWanLinkHealthStatusEnum }[] | undefined
}

export const EdgeWanLinkHealthStatusLight = (props: EdgeWanLinkHealthStatusLightProps) => {
  const { $t } = useIntl()
  const { status, targetIpStatus } = props

  const EdgeWanLinkHealthStatusLightConfig = {
    [EdgeWanLinkHealthStatusEnum.UP]: {
      color: 'var(--acx-semantics-green-50)',
      text: $t({ defaultMessage: 'Up' })
    },
    [EdgeWanLinkHealthStatusEnum.DOWN]: {
      color: 'var(--acx-semantics-red-50)',
      text: $t({ defaultMessage: 'Down' })
    }
  }

  return <Badge
    color={EdgeWanLinkHealthStatusLightConfig[status].color}
    text={<Tooltip
      placement='bottom'
      dottedUnderline
      title={targetIpStatus
        ? <Space direction='vertical' style={{ padding: 4 }}>
          { // clone first to prevent issue if the given array is immutable
            cloneDeep(targetIpStatus)
              .sort((a, b) => defaultSort(convertIpToLong(a.ip), convertIpToLong(b.ip)))
              .map(({ ip, status }) => {
                const config = EdgeWanLinkHealthStatusLightConfig[status]
                return <StyledWanLinkTargetWrapper key={ip} size={10}>
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
      {EdgeWanLinkHealthStatusLightConfig[status].text}
    </Tooltip>}
  />
}