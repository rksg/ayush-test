/* eslint-disable max-len */
import { Col, Form, Row } from 'antd'
import { useIntl }        from 'react-intl'

import { StepsForm, Subtitle }                                       from '@acx-ui/components'
import { useNetworkListQuery }                                       from '@acx-ui/rc/services'
import { Network, Portal, PortalLanguageEnum, transformDisplayText } from '@acx-ui/rc/utils'
import { useParams }                                                 from '@acx-ui/react-router-dom'

import PortalPreviewModal from './PortalPreviewModal'


const defaultPayload = {
  searchString: '',
  fields: [
    'name',
    'id'
  ]
}

export function PortalSummaryForm (props: {
  summaryData: Portal | undefined
}) {
  const { $t } = useIntl()
  const { summaryData } = props
  const params = useParams()


  const { data } = useNetworkListQuery({ params:
    { tenantId: params.tenantId, networkId: 'UNKNOWN-NETWORK-ID' }, payload: defaultPayload })

  const networkList = data?.data.reduce<Record<Network['id'], Network>>((map, obj) => {
    map[obj.id] = obj
    return map
  }, {})

  const getNetworks = function () {
    const networks = summaryData?.network
    const rows = []
    if (networks && networks.length > 0) {
      for (const network of networks) {
        const networkId = network.id || ''
        rows.push(
          <li key={networkId} style={{ margin: '10px 0px' }}>
            {networkList && networkList[networkId] ? networkList[networkId].name : networkId}
          </li>
        )
      }
      return rows
    } else {
      return transformDisplayText()
    }
  }
  const getAlternativeLang = (alternativeLang:{ [key:string]: boolean } )=>{
    let langs = ''
    Object.keys(alternativeLang || {}).map((key) =>{
      return langs+=alternativeLang?.[key]?PortalLanguageEnum[key as keyof typeof PortalLanguageEnum]+
      '  ':''
    })
    return langs
  }
  return (
    <>
      <StepsForm.Title>{$t({ defaultMessage: 'Summary' })}</StepsForm.Title>
      <Row >
        <Subtitle level={4}>
          {$t({ defaultMessage: 'Settings' })}
        </Subtitle>
      </Row>
      <Row gutter={20}>
        <Col span={10}>

          <Form.Item label={$t({ defaultMessage: 'Service Name:' })} children={summaryData?.serviceName} />
        </Col>
        <Col span={10}>
          <Form.Item
            label={$t({ defaultMessage: 'Language:' })}
            children={PortalLanguageEnum[summaryData?.demo?.displayLang as keyof typeof PortalLanguageEnum]}
          />
        </Col>

      </Row>
      <Row gutter={20}>
        <Col span={10}>
          <Form.Item
            label={$t({ defaultMessage: 'Alternative languages:' })}
            children={getAlternativeLang(summaryData?.demo?.alternativeLang as { [key:string]: boolean })}
          />
        </Col>
        <Col span={10}>
          <PortalPreviewModal demoValue={summaryData?.demo}/>
        </Col>
      </Row>
      <Row>
        <Col>
          <Subtitle level={4}>
            {$t({ defaultMessage: 'Wireless Networks ({count})' }, { count: summaryData?.network?.length })}
          </Subtitle>
          <Form.Item children={getNetworks()} />
        </Col>
      </Row>
    </>
  )
}
