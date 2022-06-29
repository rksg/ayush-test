import {
  Form,
  Input
} from 'antd'

import { useCloudpathListQuery } from '@acx-ui/rc/services'
import { useParams }             from '@acx-ui/react-router-dom'

export function CloudpathSummary (props: any) {
  const selectedId = props.cloudpathServerId
  const { selected } = useCloudpathListQuery({ params: useParams() }, {
    selectFromResult ({ data }) {
      return {
        selected: data?.find((item) => item.id === selectedId)
      }
    }
  }) 
  return (
    <>
      <Form.Item
        label='Cloudpath Server'
        children={selected?.name} />
      <Form.Item
        label='Deployment Type'
        children={selected?.deploymentType} />
      <Form.Item
        label='Authentication Server'
        children={`${selected?.authRadius.primary.ip}:${selected?.authRadius.primary.port}`} />
      <Form.Item
        label='Shared Secret'
        children={<Input.Password
          readOnly
          bordered={false}
          value={selected?.authRadius.primary.sharedSecret} />} />
    </>
  )
}