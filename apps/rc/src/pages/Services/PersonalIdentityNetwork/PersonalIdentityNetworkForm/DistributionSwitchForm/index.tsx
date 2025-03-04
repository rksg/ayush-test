import React, { useContext, useEffect, useState } from 'react'

import { Form, Input, Typography } from 'antd'
import { useIntl }                 from 'react-intl'

import { Alert, StepsForm, TableProps, useStepFormContext }                  from '@acx-ui/components'
import { Features }                                                          from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }                                             from '@acx-ui/rc/components'
import { useGetEdgeListQuery }                                               from '@acx-ui/rc/services'
import { AccessSwitch, DistributionSwitch, PersonalIdentityNetworkFormData } from '@acx-ui/rc/utils'

import { PersonalIdentityNetworkFormContext } from '../PersonalIdentityNetworkFormContext'

import { DistributionSwitchDrawer } from './DistributionSwitchDrawer'
import { DistributionSwitchTable }  from './DistributionSwitchTable'
import { StaticRouteModal }         from './StaticRouteModal'

export function DistributionSwitchForm () {
  const { $t } = useIntl()
  const isEdgePinEnhanceReady = useIsEdgeFeatureReady(Features.EDGE_PIN_ENHANCE_TOGGLE)

  const { form } = useStepFormContext<PersonalIdentityNetworkFormData>()
  const {
    switchList,
    refetchSwitchesQuery
  } = useContext(PersonalIdentityNetworkFormContext)
  const [openDrawer, setOpenDrawer] = useState(false)
  const [selected, setSelected] = useState<DistributionSwitch>()
  const distributionSwitchInfos = Form.useWatch('distributionSwitchInfos', form) ||
    form.getFieldValue('distributionSwitchInfos')
  const accessSwitchInfos = form.getFieldValue('accessSwitchInfos') as AccessSwitch []
  const edgeClusterId = form.getFieldValue('edgeClusterId') as string
  const venueId = form.getFieldValue('venueId') as string

  const { data: edgeList } = useGetEdgeListQuery({
    payload: {
      fields: ['serialNumber', 'name'],
      filters: { clusterId: [edgeClusterId] }
    } }, {
    skip: !edgeClusterId
  })

  useEffect(()=>{
    if (distributionSwitchInfos) {
      refetchSwitchesQuery()
    }
  }, [distributionSwitchInfos, accessSwitchInfos])

  const availableSwitches = switchList?.filter(sw=>
    // filter out switches already selected in this MDU
    !distributionSwitchInfos?.find(ds => ds.id === sw.id) &&
    !accessSwitchInfos?.find(ds => ds.id === sw.id)
  )

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
    <Typography.Paragraph>{$t({ defaultMessage:
      `Please add distribution switches and connected access switches to the list below,
      and then configure the VLAN range and loopback settings.`
    })}</Typography.Paragraph>
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
    <Form.Item
      name='distributionSwitchInfos'
      children={<Input type='hidden'/>}
    />
    <DistributionSwitchDrawer
      open={openDrawer}
      editRecord={selected}
      availableSwitches={availableSwitches || []}
      onSaveDS={handleSaveDS}
      onClose={()=>setOpenDrawer(false)} />
    {!isEdgePinEnhanceReady && distributionSwitchInfos?.length > 0 && <Alert type='info'
      showIcon
      message={$t({ defaultMessage:
        `Attention Required: Please ensure to configure Static Route on RUCKUS Edge {edgeNames}
         for the distribution switch’s loopback IP addresses to establish the connection.` }, {
        edgeNames: <>{
          (edgeList?.data || []).map((edge, index) =>
            <React.Fragment key={edge.serialNumber}>
              {index !== 0 && ', '}
              <StaticRouteModal
                edgeClusterId={edgeClusterId}
                edgeId={edge.serialNumber}
                edgeName={edge.name}
                venueId={venueId}>
                {edge.name}
              </StaticRouteModal>
            </React.Fragment>
          )
        }</>
      })}
    /> }
  </>)
}