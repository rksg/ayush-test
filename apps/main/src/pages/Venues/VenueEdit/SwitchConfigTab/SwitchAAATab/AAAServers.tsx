import { Select, Collapse } from 'antd'
import { useIntl }          from 'react-intl'

import { Alert }                 from '@acx-ui/components'
import { useCloudpathListQuery } from '@acx-ui/rc/services'
import { useParams }             from '@acx-ui/react-router-dom'

import { AAAServerTable }                     from './AAAServerTable'
import { AAANotification, AAAServerTypeEnum } from './contentsMap'
import * as UI                                from './styledComponents'
const { Option } = Select
const { Panel } = Collapse


export function AAAServers () {
  const { $t } = useIntl()
  const notification = true
  const PanelHeader = {
    [AAAServerTypeEnum.RADIUS]: $t({ defaultMessage: 'RADIUS Servers' }),
    [AAAServerTypeEnum.TACACS]: $t({ defaultMessage: 'TACACS+ Servers' }),
    [AAAServerTypeEnum.LOCAL_USER]: $t({ defaultMessage: 'Local Users' })
  }
  const getPanelHeader = (type: AAAServerTypeEnum, count: number) => {
    return PanelHeader[type] + ' (' + count + ')'
  }

  const { selectOptions, selected } = useCloudpathListQuery({ params: useParams() }, {
    selectFromResult ({ data }) {
      let selectoptions = data?.map(item => ({ label: item.name, value: item.id })) || []
      selectoptions.unshift({ label: 'No model selected', value: '' })
      return {
        selectOptions: selectoptions?.map(
          item => <Option key={item.value}>{item.label}</Option>) ?? [],
        selected: ''
      }
    }
  })

  return (
    <UI.AAAServers>
      {
        notification &&
        <Alert message={$t(AAANotification)} type='info' showIcon />
      }
      <Collapse
        defaultActiveKey={['1', '2', '3']}
        expandIconPosition='end'
        ghost={true}
        bordered={false}
      >
        <Panel header={getPanelHeader(AAAServerTypeEnum.RADIUS, 0)} key='1' >
          <AAAServerTable type={AAAServerTypeEnum.RADIUS} />   
        </Panel>

        <Panel header={getPanelHeader(AAAServerTypeEnum.TACACS, 0)} key='2' >
          <AAAServerTable type={AAAServerTypeEnum.TACACS} />   
        </Panel>

        <Panel header={getPanelHeader(AAAServerTypeEnum.LOCAL_USER, 0)} key='3' >
          <AAAServerTable type={AAAServerTypeEnum.LOCAL_USER} /> 
        </Panel>
      </Collapse>
    </UI.AAAServers>
  )
}