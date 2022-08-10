import { EnvironmentOutlined }            from '@ant-design/icons'
import { Col, Divider, Form, Input, Row } from 'antd'
import { useIntl }                        from 'react-intl'

import { StepsForm, Subtitle }   from '@acx-ui/components'
import { useCloudpathListQuery } from '@acx-ui/rc/services'
import { 
  CreateNetworkFormFields,
  NetworkTypeEnum,
  transformDisplayText
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { networkTypes } from '../contentsMap'

import { AaaSummaryForm }  from './AaaSummaryForm'
import { DpskSummaryForm } from './DpskSummaryForm'
import { PskSummaryForm }  from './PskSummaryForm'


export function SummaryForm (props: {
  summaryData: CreateNetworkFormFields
}) {
  const { $t } = useIntl()
  const { summaryData } = props
  const selectedId = summaryData.cloudpathServerId
  const { selected } = useCloudpathListQuery({ params: useParams() }, {
    selectFromResult ({ data }) {
      return {
        selected: data?.find((item) => item.id === selectedId)
      }
    }
  })
  const getVenues = function () {
    const venues = summaryData.venues
    const rows = []
    if (venues && venues.length > 0) {
      for (const venue of venues) {
        rows.push(
          <li key={(venue as any).venueId} style={{ margin: '10px 0px' }}>
            <EnvironmentOutlined />
            {(venue as any).name}
          </li>
        )
      }
      return rows
    } else {
      return transformDisplayText()
    }
  }

  return (
    <>
      <StepsForm.Title>{ $t({ defaultMessage: 'Summary' }) }</StepsForm.Title>
      <Row gutter={20}>
        <Col flex={1}>
          <Subtitle level={4}>
            { $t({ defaultMessage: 'Network Info' }) }
          </Subtitle>
          <Form.Item label={$t({ defaultMessage: 'Network Name:' })} children={summaryData.name} />
          <Form.Item
            label={$t({ defaultMessage: 'Info:' })}
            children={transformDisplayText(summaryData.description)}
          />
          <Form.Item
            label={$t({ defaultMessage: 'Type:' })}
            children={$t(networkTypes[summaryData.type])}
          />
          {summaryData.type !== NetworkTypeEnum.PSK &&
          <Form.Item
            label={$t({ defaultMessage: 'Use Cloudpath Server:' })}
            children={summaryData.isCloudpathEnabled ? 'Yes' : 'No'}
          />
          }
          {summaryData.isCloudpathEnabled && selected &&
            <>
              <Form.Item
                label={$t({ defaultMessage: 'Cloudpath Server' })}
                children={selected.name}
              />
              <Form.Item
                label={$t({ defaultMessage: 'Deployment Type' })}
                children={selected.deploymentType}
              />
              <Form.Item
                label={$t({ defaultMessage: 'Authentication Server' })}
                children={`${selected.authRadius.primary.ip}:${selected.authRadius.primary.port}`}
              />
              <Form.Item
                label={$t({ defaultMessage: 'Shared Secret' })}
                children={<Input.Password
                  readOnly
                  bordered={false}
                  value={selected.authRadius.primary.sharedSecret}
                />}
              />
            </>
          }
          {summaryData.type === NetworkTypeEnum.AAA && !summaryData.isCloudpathEnabled &&
           <AaaSummaryForm summaryData={summaryData} />
          }
          {summaryData.type === NetworkTypeEnum.DPSK &&
            <DpskSummaryForm summaryData={summaryData} />
          }
          {summaryData.type === NetworkTypeEnum.PSK && 
            <PskSummaryForm summaryData={summaryData} />
          }
        </Col>
        <Divider type='vertical' style={{ height: '300px' }}/>
        <Col flex={1}>
          <Subtitle level={4}>
            { $t({ defaultMessage: 'Activated in venues' }) }
          </Subtitle>
          <Form.Item children={getVenues()} />
        </Col>
      </Row>
    </>
  )
}
