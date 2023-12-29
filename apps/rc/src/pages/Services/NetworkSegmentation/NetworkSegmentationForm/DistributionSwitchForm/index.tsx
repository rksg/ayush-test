import { useEffect, useState } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { Alert, StepsForm, TableProps, useStepFormContext } from '@acx-ui/components'
import { useGetAvailableSwitchesQuery, useGetEdgeQuery }    from '@acx-ui/rc/services'
import { AccessSwitch, DistributionSwitch }                 from '@acx-ui/rc/utils'
import { useParams }                                        from '@acx-ui/react-router-dom'

import { NetworkSegmentationGroupFormData } from '..'

import { DistributionSwitchDrawer } from './DistributionSwitchDrawer'
import { DistributionSwitchTable }  from './DistributionSwitchTable'
import { StaticRouteModal }         from './StaticRouteModal'


export function DistributionSwitchForm () {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const { form } = useStepFormContext<NetworkSegmentationGroupFormData>()

  const [openDrawer, setOpenDrawer] = useState(false)
  const [selected, setSelected] = useState<DistributionSwitch>()
  const distributionSwitchInfos = Form.useWatch('distributionSwitchInfos', form) ||
    form.getFieldValue('distributionSwitchInfos')
  const accessSwitchInfos = form.getFieldValue('accessSwitchInfos') as AccessSwitch []
  const venueId = form.getFieldValue('venueId') as string
  const edgeId = form.getFieldValue('edgeId') as string
  const edgeName = form.getFieldValue('edgeName') as string

  const { availableSwitches, refetch: refetchSwitchesQuery } = useGetAvailableSwitchesQuery({
    params: { tenantId, venueId }
  }, {
    skip: !venueId,
    selectFromResult: ({ data }) => ({
      availableSwitches: data?.switchViewList?.filter(sw=>
        // filter out switches already selected in this MDU
        !distributionSwitchInfos?.find(ds => ds.id === sw.id) &&
        !accessSwitchInfos?.find(ds => ds.id === sw.id)
      )
    })
  })

  const { data: edgeData } = useGetEdgeQuery({
    params: { serialNumber: edgeId }
  }, { skip: !!edgeName || !edgeId })

  useEffect(()=>{
    if (distributionSwitchInfos) {
      refetchSwitchesQuery()
    }
  }, [distributionSwitchInfos, accessSwitchInfos])

  const rowActions: TableProps<DistributionSwitch>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    onClick: (selectedRows) => {
      setSelected(selectedRows[0])
      setOpenDrawer(true)
    }
  }, {
    label: $t({ defaultMessage: 'Delete' }),
    onClick: (selectedRows) => {
      setSelected(undefined)
      const newList = distributionSwitchInfos?.filter(ds=>{
        return !selectedRows.map(r=>r.id).includes(ds.id)
      })

      saveToContext(newList)
    }
  }]

  const saveToContext = (newList: DistributionSwitch[]) => {
    const newAsList = newList.map(ds => {
      return ds.accessSwitches || []
    }).flat()

    form.setFieldValue('distributionSwitchInfos', newList)
    form.setFieldValue('accessSwitchInfos', newAsList)
  }

  const addHandler = () => {
    setSelected(undefined)
    setOpenDrawer(true)
  }

  const handleSaveDS = (values: DistributionSwitch) => {
    let newList = distributionSwitchInfos || []
    if (!selected) { // Add
      newList = newList.concat(values)
    }
    else { // edit
      newList = newList.map(ds => {
        if (selected.id === ds.id) {
          return { ...selected, ...values }
        }
        return ds
      })
    }
    setSelected(undefined)
    setOpenDrawer(false)

    saveToContext(newList)
  }

  return (<>
    <StepsForm.Title>
      {$t({ defaultMessage: 'Distribution Switch Settings' })}
    </StepsForm.Title>
    <DistributionSwitchTable rowActions={rowActions}
      actions={[{
        key: 'addDs',
        label: $t({ defaultMessage: 'Add Distribution Switch' }),
        onClick: () => addHandler()
      }]}
      dataSource={distributionSwitchInfos}
      rowSelection={{
        type: 'radio',
        selectedRowKeys: selected ? [selected.id] : [],
        onChange: (_, selectedRows) => {
          setSelected(selectedRows[0])
        }
      }} />
    <Form.Item name='distributionSwitchInfos' children={<Input type='hidden'/>} />
    <DistributionSwitchDrawer
      open={openDrawer}
      editRecord={selected}
      availableSwitches={availableSwitches || []}
      onSaveDS={handleSaveDS}
      onClose={()=>setOpenDrawer(false)} />
    { distributionSwitchInfos && distributionSwitchInfos.length > 0 && <Alert type='info'
      message={$t({ defaultMessage:
        'Attention Required: Please ensure to configure {staticRoute} on SmartEdge ({edgeName}) ' +
        'for the distribution switch’s loopback IP addresses to establish the connection.' }, {
        staticRoute: <StaticRouteModal edgeId={edgeId} edgeName={edgeName || edgeData?.name!} />,
        edgeName: edgeName || edgeData?.name
      })}
      showIcon
    /> }
  </>)
}
