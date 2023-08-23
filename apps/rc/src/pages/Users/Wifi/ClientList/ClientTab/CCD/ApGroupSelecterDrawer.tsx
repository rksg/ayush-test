import { useEffect, useRef, useState } from 'react'

import { Tree, TreeProps } from 'antd'
import { DataNode }        from 'antd/lib/tree'
import { useIntl }         from 'react-intl'
import { useParams }       from 'react-router-dom'

import { Drawer }             from '@acx-ui/components'
import { useLazyApListQuery } from '@acx-ui/rc/services'
import { APExtendedGrouped }  from '@acx-ui/rc/utils'

type ApGroupSelecterDrawerProps = {
  visible: boolean,
  venueId?: string,
  updateSelectAps: (aps: string[], apGroups:string[]) => void
  onCancel: () => void
}
/*
const fakeData = [
  {
    aps: [
      {
        serialNumber: '302002030366',
        name: 'R550_0601',
        model: 'R550',
        fwVersion: '7.0.0.103.390',
        venueId: '0e2f68ab79154ffea64aa52c5cc48826',
        venueName: 'My-Venue',
        deviceStatus: '2_00_Operational',
        IP: '10.206.78.138',
        apMac: '34:20:E3:1D:0C:50',
        apStatusData: {
          APRadio: [
            {
              txPower: null,
              channel: 1,
              band: '2.4G',
              Rssi: null,
              radioId: 0
            },
            {
              txPower: null,
              channel: 64,
              band: '5G',
              Rssi: null,
              radioId: 1
            }
          ]
        },
        meshRole: 'DISABLED',
        deviceGroupId: 'f2863482681e489ab8566e2f229572aa',
        deviceGroupName: ''
      },
      {
        serialNumber: '922102004888',
        name: 'T750SE',
        model: 'T750SE',
        fwVersion: '7.0.0.103.390',
        venueId: '991eb992ece042a183b6945a2398ddb9',
        venueName: 'joe-test',
        deviceStatus: '1_09_Offline',
        IP: '192.168.5.103',
        apMac: '58:FB:96:1A:18:40',
        apStatusData: {
          APRadio: [
            {
              txPower: null,
              channel: 5,
              band: '2.4G',
              Rssi: null,
              radioId: 0
            },
            {
              txPower: null,
              channel: 104,
              band: '5G',
              Rssi: null,
              radioId: 1
            }
          ]
        },
        meshRole: 'DISABLED',
        deviceGroupId: '75f7751cd7d34bf19cc9446f92d82ee5',
        tags: '',
        deviceGroupName: ''
      }
    ],
    deviceGroupId: 'f2863482681e489ab8566e2f229572aa',
    deviceGroupName: '',
    venueId: '0e2f68ab79154ffea64aa52c5cc48826',
    networks: {
      count: 3,
      names: [
        'bess_google',
        'app5-gpass',
        'joe-psk'
      ]
    },
    members: 2,
    incidents: 0,
    clients: 0
  }, {
    deviceGroupId: 'f2863482681e489ab8566e2f229572bb',
    deviceGroupName: 'test-apGroup',
    venueId: '0e2f68ab79154ffea64aa52c5cc48826',
    aps: [
      {
        serialNumber: '302002030377',
        name: 'R550_tttt',
        model: 'R550',
        fwVersion: '7.0.0.103.390',
        venueId: '0e2f68ab79154ffea64aa52c5cc48826',
        venueName: 'My-Venue',
        deviceStatus: '2_00_Operational',
        IP: '10.206.78.138',
        apMac: '34:20:E3:1D:0C:77',
        apStatusData: {
          APRadio: [
            {
              txPower: null,
              channel: 1,
              band: '2.4G',
              Rssi: null,
              radioId: 0
            },
            {
              txPower: null,
              channel: 64,
              band: '5G',
              Rssi: null,
              radioId: 1
            }
          ]
        },
        meshRole: 'DISABLED',
        deviceGroupId: 'f2863482681e489ab8566e2f229572bb',
        deviceGroupName: ''
      }],
    members: 1,
    incidents: 0,
    clients: 0
  }
]
*/
const ApGroupSelecterDrawer = (props: ApGroupSelecterDrawerProps) => {
  const { $t } = useIntl()
  const { tenantId } = useParams()

  const { visible, venueId, updateSelectAps } = props

  const [ getApsByApGroup ] = useLazyApListQuery()

  const selectedKeysRef = useRef<string[]>()
  const apGroupMapRef = useRef<Map<string, string>>()

  const [ apsTreeData, setApsTreeData] = useState<DataNode[]>([])



  useEffect(() => {
    if (venueId) {
      const converteToTreeData = (apGroupData?: APExtendedGrouped[]) => {
        if (apGroupData) {
          const apGroupMap = new Map()
          const treeData = apGroupData.map(data => {
            const { deviceGroupName, deviceGroupId, members, aps } = data
            const groupName = (deviceGroupName ==='')? 'Ungrouped APs' : deviceGroupName

            apGroupMap.set(deviceGroupId, groupName)

            const childrenTreeData = aps?.map(ap => {
              const { name, apMac, serialNumber } = ap
              return {
                title: `${name} (${apMac})`,
                key: `${deviceGroupId}-${serialNumber}`
              }
            })

            return {
              title: `${groupName} (${members} APs)`,
              key: deviceGroupId,
              children: childrenTreeData
            }
          })

          apGroupMapRef.current = apGroupMap

          return treeData
        }
        return []
      }

      const createAPGroupTreeData = async (venueId: string) => {
        const payload = {
          fields: ['name', 'apMac', 'serialNumber', 'deviceGroupName', 'deviceStatus', 'venueId' ],
          filters: {
            venueId: [venueId],
            deviceStatusSeverity: ['2_Operational']
          },
          groupBy: 'deviceGroupName',
          groupByFields: [
            'name', 'apMac', 'serialNumber',
            'deviceGroupName', 'deviceStatus', 'venueId' ],
          page: 1,
          pageSize: 10000,
          sortField: 'name',
          sortOrder: 'ASC',
          total: 0
        }

        const { data } = await getApsByApGroup({ params: { tenantId }, payload }, true)
        const treeData = converteToTreeData(data?.data as APExtendedGrouped[])
        //const treeData = converteToTreeData(fakeData as APExtendedGrouped[])
        setApsTreeData(treeData as DataNode[])
      }

      createAPGroupTreeData(venueId)
    }

  }, [venueId])

  const onApsCheck: TreeProps['onCheck'] = (checkedKeys) => {
    selectedKeysRef.current = checkedKeys as string[]
  }

  const content = (<Tree checkable
    onCheck={onApsCheck}
    treeData={apsTreeData}
  />)

  // reset form fields when drawer is closed
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      selectedKeysRef.current = []
    }
  }


  return (
    <Drawer
      title={$t({ defaultMessage: 'Select Available APs' })}
      visible={visible}
      onClose={props.onCancel}
      children={content}
      destroyOnClose={true}
      width={'500px'}
      afterVisibleChange={handleOpenChange}
      footer={
        <Drawer.FormFooter
          buttonLabel={({
            save: $t({ defaultMessage: 'Apply' })
          })}
          onCancel={props.onCancel}
          onSave={async () => {
            try {
              const selectedKeys = selectedKeysRef.current
              const selectedApKeys = selectedKeys?.filter(key => key.includes('-')) || []
              const selectedAps = selectedApKeys.map(apKey => apKey.split('-')[1])

              const apgMap = apGroupMapRef.current

              let selectedApGroups = []
              if (apgMap) {
                for (let key of apgMap.keys()) {
                  const aps = selectedApKeys.filter(apKey => apKey.includes(key+'-'))
                  const numOfAps = (aps && aps.length) || 0
                  if (numOfAps > 0) {
                    const apgName = apgMap.get(key)
                    selectedApGroups.push(`${apgName} (${numOfAps} APs)`)
                  }
                }
              }

              updateSelectAps(selectedAps, selectedApGroups)
              props.onCancel()
            } catch (error) {
              if (error instanceof Error) throw error
            }
          }}
        />
      }
    />
  )
}

export default ApGroupSelecterDrawer

