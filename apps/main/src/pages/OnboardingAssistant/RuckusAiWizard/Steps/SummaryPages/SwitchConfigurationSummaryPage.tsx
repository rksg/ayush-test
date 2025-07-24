import { Col, Form, Row } from 'antd'
import _                  from 'lodash'
import { useIntl }        from 'react-intl'

import { Loader, Subtitle }                                                    from '@acx-ui/components'
import { useGetVlanOnboardConfigsQuery }                                       from '@acx-ui/rc/services'
import { SpanningTreeProtocolName, transformDisplayOnOff, transformTitleCase } from '@acx-ui/rc/utils'

import * as UI from '../styledComponents'
export function SwitchConfigurationSummaryPage (
  props: {
    summaryId: string,
    summaryTitle: string
  }) {
  const { summaryTitle, summaryId } = props
  const { $t } = useIntl()

  const gptSummaryResult =
    useGetVlanOnboardConfigsQuery({ params: { id: summaryId } }, { skip: _.isEmpty(summaryId) })
  const data = gptSummaryResult.data

  return (
    <Loader states={[gptSummaryResult]}>
      <Row gutter={20}>
        <Col flex={1}>
          <Subtitle level={4}>
            {summaryTitle}
          </Subtitle>

          <Form.Item label={$t({ defaultMessage: 'IPv4 DHCP Snooping' })}
            children={transformDisplayOnOff(data?.ipv4DhcpSnooping || false)} />

          <Form.Item label={$t({ defaultMessage: 'ARP Inspection' })}
            children={transformDisplayOnOff(data?.arpInspection || false)} />

          <Form.Item label={$t({ defaultMessage: 'IGMP Snooping' })}
            children={data?.igmpSnooping ? transformTitleCase(data?.igmpSnooping) : '--'} />

          <Form.Item label={$t({ defaultMessage: 'Multicast Version' })}
            children={data?.multicastVersion || '--'} />

          <Form.Item label={$t({ defaultMessage: 'Spanning tree protocol' })}
            children={data?.spanningTreeProtocol ?
              SpanningTreeProtocolName[data?.spanningTreeProtocol] : '--'} />

          <Form.Item
            label={$t({ defaultMessage: 'Ports' })}
          >
            {data?.switchFamilyModels?.length ? (
              <UI.SummaryUl>
                {data.switchFamilyModels.map((item, index) => (
                  <UI.VlanSummaryLi key={index} style={{ marginBottom: '5px' }}>
                    <div style={{ marginBottom: '5px' }}>{item.model}</div>
                    <UI.SummaryUl>
                      <UI.VlanSummaryLi>
                        { // eslint-disable-next-line max-len
                          $t({ defaultMessage: 'Untagged Ports' })}: {item.untaggedPorts?.replace(/,/g, ', ') || '--'}
                      </UI.VlanSummaryLi>
                      <UI.VlanSummaryLi>
                        { // eslint-disable-next-line max-len
                          $t({ defaultMessage: 'Tagged Ports' })}: {item.taggedPorts?.replace(/,/g, ', ') || '--'}
                      </UI.VlanSummaryLi>
                    </UI.SummaryUl>
                  </UI.VlanSummaryLi>
                ))}
              </UI.SummaryUl>
            ) : (
              '--'
            )}
          </Form.Item>
        </Col>
      </Row>
    </Loader>
  )
}

