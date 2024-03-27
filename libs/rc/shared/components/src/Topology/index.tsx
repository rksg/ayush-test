/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useEffect, useState } from 'react'

import { AutoComplete, Button, Col, Empty, Input, Row, Typography } from 'antd'
import { DefaultOptionType }                                        from 'antd/lib/select'
import * as d3                                                      from 'd3'
import { debounce, uniq }                                           from 'lodash'
import { useIntl }                                                  from 'react-intl'
import { useParams }                                                from 'react-router-dom'

import { Loader, Select } from '@acx-ui/components'
import {
  CloudSolid,
  MagnifyingGlassMinusOutlined,
  MagnifyingGlassPlusOutlined,
  AccessPointWifiMesh,
  AccessPointWifiMeshRoot,
  SearchFitOutlined,
  StackDevice,
  AccessPointWifi,
  Switch, Unknown,
  AccessPointWifiPort,
  SearchOutlined,
  ArrowsOut
} from '@acx-ui/icons'
import { useGetTopologyQuery, useLazyGetSwitchVlanUnionByVenueQuery } from '@acx-ui/rc/services'
import {
  TopologyDeviceStatus,
  DeviceTypes,
  Link,
  Node,
  ShowTopologyFloorplanOn
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'
import { hasAccess }  from '@acx-ui/user'

import LinkTooltip             from './LinkTooltip'
import NodeTooltip             from './NodeTooltip'
import * as UI                 from './styledComponents'
import TopologyTree            from './TopologyTree'
import { TopologyTreeContext } from './TopologyTree/TopologyTreeContext'

type OptionType = {
  value: string;
  label: string | JSX.Element;
  key: string;
  children: string;
  item: Node;
}

interface NodeData {
  id: string;
  name: string;
  type: string;
  isConnectedCloud: boolean;
  untaggedVlan?: string;
  taggedVlan?: string;
  children: NodeData[];
}

type VlanPortData = {
  [key: string]: string[];
}

type SetVlanDataFunction = React.Dispatch<React.SetStateAction<VlanPortData>>

function updateVlanPortData (portNumber: any,
  portData: string, setVlanPortData: SetVlanDataFunction){
  if(Array.isArray(portNumber)){
    portNumber.forEach(port =>
    {
      if(port !== '' && port !== undefined && port) {
        setVlanPortData(prevData => ({
          ...prevData,
          [port]: uniq([...prevData[port] || [], portData])
        }))
      }
    }
    )
  }
}

export function parseTopologyData (topologyData: any, setVlanPortData: SetVlanDataFunction): any {
  const nodes = topologyData.nodes
  const edges = topologyData.edges

  // Create a mapping of node IDs to their corresponding node objects
  const nodeMap: Record<string, NodeData> = {}

  nodes.forEach((node: NodeData) => {
    nodeMap[node.id] = {
      ...node,
      children: []
    }

    const portData = [
      node?.untaggedVlan !== '' && node.untaggedVlan?.split(' '),
      node?.taggedVlan !== '' && node.taggedVlan?.split(' ')
    ]

    updateVlanPortData(portData, `node_${node.id}`, setVlanPortData)
  })

  // Build the tree structure based on the edges
  edges.forEach((edge: Link) => {
    if(edge.from === edge.to){ //invalid edge with same from, to id
      return
    }
    const fromNode = nodeMap[edge.from]
    const toNode = nodeMap[edge.to]

    if((fromNode && toNode)){
      fromNode.children.push(toNode)
    }

    const portData = [
      edge?.connectedPortTaggedVlan !== '' && edge.connectedPortTaggedVlan?.split(' '),
      edge?.connectedPortUntaggedVlan !== '' && edge.connectedPortUntaggedVlan?.split(' '),
      edge?.correspondingPortTaggedVlan !== '' && edge.correspondingPortTaggedVlan?.split(' '),
      edge?.correspondingPortUntaggedVlan !== '' && edge.correspondingPortUntaggedVlan?.split(' ')
    ]

    updateVlanPortData(portData, `link_${edge.from}_${edge.to}`, setVlanPortData)
  })

  const idsToRemove: string[] = []
  function removeDuplicateItems (node: NodeData, nodeMapData: NodeData[]) {

    for(let i=0; i < nodeMapData.length; i++){
      const duplicateIndex = nodeMapData[i].children.findIndex(item => item.id === node.id)

      if (duplicateIndex !== -1 && idsToRemove.indexOf(node.id) === -1) {
        idsToRemove.push(node.id)
      }
      removeDuplicateItems(node, nodeMapData[i].children)
    }
  }

  const nodeMapData = Object.values(nodeMap)

  nodeMapData.forEach(
    node => removeDuplicateItems(
      node, nodeMapData.filter(item => item.id !== node.id )))

  const result: NodeData[] = Object.values(nodeMap).filter(item => {
    return !idsToRemove.includes(item.id)
  })

  return result
}

export function TopologyGraphComponent (props:{ venueId?: string,
  showTopologyOn: ShowTopologyFloorplanOn,
  deviceMac?: string,
  modalVisible: boolean,
  setModalVisible: (visible: boolean) => void }) {

  const { $t } = useIntl()
  const { venueId, showTopologyOn, modalVisible, setModalVisible } = props

  const graphRef = useRef<SVGSVGElement>(null)
  const params = useParams()

  const _venueId = params.venueId || venueId

  const { data: topologyData,
    isLoading: isTopologyLoading } = useGetTopologyQuery({ params: { ...params,
    venueId: _venueId } })
  const [getSwitchesVlan] = useLazyGetSwitchVlanUnionByVenueQuery()

  const [treeData, setTreeData] = useState<any>()
  const [showLinkTooltip, setShowLinkTooltip] = useState<boolean>(false)
  const [showDeviceTooltip, setShowDeviceTooltip] = useState<boolean>(false)
  const [tooltipEdge, setTooltipEdge] = useState<Link>()
  const [tooltipNode, setTooltipNode] = useState<Node>()
  const [tooltipSourceNode, setTooltipSourceNode] = useState<Node>()
  const [tooltipTargetNode, setTooltipTargetNode] = useState<Node>()
  const [filterNodes, setFilterNodes] = useState<OptionType[]>()
  const [scale, setScale] = useState<number>(1.5)
  const [translate, setTranslate] = useState<number[]>([0,0])
  let newScale = useRef(1.5)
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 })
  const [onDrag, setOnDrag] = useState<boolean>(false)
  const [vlansOption, setVlansOption] = useState([] as DefaultOptionType[])
  const [selectedVlan, setSelectedVlan] = useState<string>()
  const [searchValue, setSearchValue] = useState('')
  const [vlanPortData, setVlanPortData] = useState<VlanPortData>({})

  useEffect(() => {
    if(topologyData) {
      const schema1Equivalent = parseTopologyData(topologyData, setVlanPortData)
      const nodes: Node[] = topologyData?.nodes

      setTreeData(
        { data: [{ id: 'Cloud', name: 'Cloud',
          children: schema1Equivalent }] })

      d3.select('#graph-zoom-in').on('click', function () {
        newScale.current *= 1.2
        setScale(newScale.current)
      })

      d3.select('#graph-zoom-out').on('click', function () {
        newScale.current *= 0.8
        setScale(newScale.current)
      })

      d3.select('#graph-zoom-fit').on('click', function () {
        newScale.current = 1.0
        setScale(newScale.current)

        const treeContainer = document.querySelector('.d3-tree-container')
        if(treeContainer?.clientWidth && treeContainer?.clientHeight ){
          const translateX = treeContainer.clientWidth/2
          const translateY = treeContainer.clientHeight/3
          setTranslate([translateX, translateY])
        }
      })

      d3.select('#enter-fullscreen').on('click', function () {
        setModalVisible(true)
      })

      const _formattedNodes = nodes.map(node => ({
        value: (node.name as string || node.id as string).toString(),
        key: (node.id as string).toString(),
        label: <div><Typography.Title style={{ margin: 0 }} level={5} ellipsis={true}>
          {node.name as string}</Typography.Title>
        <Typography.Text type='secondary'>{(node.mac as string)}</Typography.Text>
        <Typography.Text type='secondary'> ({(node.ipAddress as string)})</Typography.Text></div>,
        children: node.label,
        item: node
      })) as OptionType[]

      setFilterNodes(_formattedNodes)

      const treeContainer = document.querySelector('.d3-tree-container')
      if(treeContainer?.clientWidth && treeContainer?.clientHeight ){
        const translateX = treeContainer.clientWidth/2
        const translateY = treeContainer.clientHeight/3
        setTranslate([translateX, translateY])
      }

      async function getVlanList (){
        const vlanList = await getSwitchesVlan({ params }).unwrap()
        const vlansOptionValues: DefaultOptionType[] =
          [{ label: $t({ defaultMessage: 'Select VLAN...' }), value: '' }]
        vlanList.map(item=> vlansOptionValues.push({ label: item.vlanId, value: item.vlanId }))
        setVlansOption(vlansOptionValues)
      }
      if(showTopologyOn === ShowTopologyFloorplanOn.VENUE_OVERVIEW){
        getVlanList()
      }
    }
  }, [topologyData])

  function closeLinkTooltipHandler () {
    setShowLinkTooltip(false)
  }

  const debouncedHandleMouseClick = debounce(function (){
    /** TODO:
    const treeContainer = document.querySelector('.d3-tree-container')

    if(treeContainer?.clientWidth && treeContainer?.clientHeight ){
      const translateX = treeContainer.clientWidth/2
      const translateY = treeContainer.clientHeight/2 - node.x
      setTranslate([translateX, translateY])
      setScale(3)
    } **/
  })

  const debouncedHandleMouseEnter = debounce(function (node, d){
    if(onDrag){
      return
    }

    closeLinkTooltipHandler()
    setShowDeviceTooltip(true)
    setTooltipNode(node.data as typeof node)

    const treeContainer = document.querySelector('.TopologyGraphContainer')
    let x = d?.nativeEvent.layerX + 30
    let y = d?.nativeEvent.layerY
    const cardHeight = node.data.type.includes('Switch') ? 275 : 547
    if(treeContainer?.clientWidth && treeContainer?.clientHeight){
      y = y + cardHeight > treeContainer?.clientHeight ?
        treeContainer?.clientHeight - cardHeight : y
    }
    setTooltipPosition({ x, y })
  }, 100)

  const debouncedHandleMouseEnterLink = debounce(function (edge, d){
    if(onDrag){
      return
    }
    if(topologyData?.edges){
      if (edge.source.data.id === 'Cloud')
        return
      let sourceNode = topologyData.nodes.filter(item => item.id === edge.source.data.id)[0]
      let targetNode = topologyData.nodes.filter(item => item.id === edge.target.data.id)[0]
      let selectedEdge = topologyData.edges.filter(
        item => item.from === edge.source.data.id && item.to === edge.target.data.id)[0]

      closeTooltipHandler()
      setTooltipSourceNode(sourceNode)
      setTooltipTargetNode(targetNode)
      setShowLinkTooltip(true)
      setShowDeviceTooltip(false) // close device detail tooltip if already opened.
      setTooltipEdge(selectedEdge)

      const treeContainer = document.querySelector('.TopologyGraphContainer')
      let x = d?.nativeEvent.layerX + 30
      let y = d?.nativeEvent.layerY
      const cardHeight = sourceNode?.type?.includes('Switch') &&
        targetNode?.type?.includes('Switch') ? 415 : 200
      if(treeContainer?.clientWidth && treeContainer?.clientHeight){
        y = y + cardHeight > treeContainer?.clientHeight ?
          treeContainer?.clientHeight - cardHeight : y
      }
      setTooltipPosition({ x, y })
    }
  }, 100)

  function closeTooltipHandler () {
    setShowDeviceTooltip(false)
    debouncedHandleMouseEnter.cancel()
  }

  const handleVlanChange = async (value: string) => {
    setSelectedVlan(value)
    setSearchValue('')
    document.querySelectorAll('.focusNode').forEach(
      item => item.classList.remove('focusNode'))
    if(Array.isArray(vlanPortData[value])){
      vlanPortData[value].forEach(
        item => document.getElementById(item)?.classList.add('focusNode'))
    }
  }

  return <Loader states={
    [
      { isLoading: false, isFetching: isTopologyLoading }
    ]
  }>
    <div
      id='treeContainer'
      style={{
        width: '100%',
        height: modalVisible? '95%' : 'calc(100% - 100px)'
      }}>{ topologyData?.nodes.length ?
        <>
          {
            (showTopologyOn === ShowTopologyFloorplanOn.VENUE_OVERVIEW)
            && !!filterNodes?.length
            && <UI.HeaderComps>
              <AutoComplete
                id='searchNodes'
                data-testid='searchNodes'
                options={filterNodes}
                value={searchValue}
                searchValue={searchValue}
                filterOption={(inputValue, option) =>{
                  return !!((option as OptionType).item.id as string).toLowerCase()
                    .includes(inputValue.toLowerCase()) ||
                  !!((option as OptionType).item.name as string).toLowerCase()
                    .includes(inputValue.toLowerCase()) ||
                  !!((option as OptionType).item.mac as string).toLowerCase()
                    .includes(inputValue.toLowerCase()) ||
                  !!((option as OptionType).item.ipAddress as string).toLowerCase()
                    .includes(inputValue.toLowerCase())
                }
                }
                style={{ width: 280 }}
                onSelect={(value: any, option: OptionType) => {
                  document.querySelectorAll('.focusNode').forEach(
                    item => item.classList.remove('focusNode'))
                  if(option.item.id){
                    document.getElementById(option.item.id)?.classList.add('focusNode')
                  }
                  setSelectedVlan('')
                  setSearchValue(value)
                }}
                allowClear={true}
                onSearch={
                  (inputValue) => {
                    setSelectedVlan('')
                    setSearchValue(inputValue)
                    if (inputValue === '') {
                      return false
                    }
                    return
                  }
                }
                onClear={() => {
                  document.querySelectorAll('.focusNode').forEach(
                    item => item.classList.remove('focusNode'))
                }}
                notFoundContent={
                  $t({ defaultMessage: 'No results for "{searchValue}"' }, { searchValue })
                }
              >
                <Input
                  prefix={<SearchOutlined />}
                  placeholder={$t({ defaultMessage: 'Search by device name or MAC address' })}
                  title={$t({ defaultMessage: 'Search by device name or MAC address' })}
                />
              </AutoComplete>
              <Select
                style={{ width: 120 }}
                placeholder={$t({ defaultMessage: 'VLANs' })}
                options={vlansOption}
                defaultValue={selectedVlan}
                value={selectedVlan}
                onChange={async (value) => await handleVlanChange(value)}
              />
            </UI.HeaderComps>
          }
          <UI.Topology>
            <TopologyTreeContext.Provider
              value={{ scale, translate, setTranslate, onDrag, setOnDrag }}>
              <TopologyTree
                ref={graphRef}
                data={treeData}
                edges={topologyData.edges}
                onNodeHover={debouncedHandleMouseEnter}
                onNodeClick={debouncedHandleMouseClick}
                onLinkClick={debouncedHandleMouseEnterLink}
                onNodeMouseLeave={closeTooltipHandler}
                onLinkMouseLeave={closeLinkTooltipHandler}
                closeTooltipHandler={closeTooltipHandler}
                closeLinkTooltipHandler={closeLinkTooltipHandler}
              />
            </TopologyTreeContext.Provider>
          </UI.Topology>
        </>
        : <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%'
        }}>
          {
            (showTopologyOn === ShowTopologyFloorplanOn.VENUE_OVERVIEW)
              ? <Empty description={$t({ defaultMessage: 'No devices added yet to this venue' })}>
                { hasAccess() && <Row>
                  <Col span={12}>
                    <TenantLink to='devices/wifi/add'>
                      {$t({ defaultMessage: 'Add Access Point' })}
                    </TenantLink>
                  </Col>
                  <Col span={8} offset={4}>
                    <TenantLink to='devices/switch/add'>
                      {$t({ defaultMessage: 'Add Switch' })}
                    </TenantLink>
                  </Col>
                </Row>}
              </Empty>
              : <Empty description={$t({ defaultMessage: 'This device not added to any venue' })} />
          }
        </div>
      }
      {
        showLinkTooltip && <LinkTooltip
          tooltipPosition={tooltipPosition}
          tooltipSourceNode={tooltipSourceNode as Node}
          tooltipTargetNode={tooltipTargetNode as Node}
          tooltipEdge={tooltipEdge as Link}
          onClose={closeLinkTooltipHandler} />
      }

      { showDeviceTooltip && <NodeTooltip
        tooltipPosition={tooltipPosition}
        tooltipNode={tooltipNode as Node}
        closeTooltip={closeTooltipHandler} />
      }
      {
        !! topologyData?.nodes.length && !modalVisible && <UI.FullScreenButtonsContainer>
          <ArrowsOut
            data-testid='enter-fullscreen'
            id='enter-fullscreen'
            width={16}
            height={16} />
        </UI.FullScreenButtonsContainer>
      }
      {
        !! topologyData?.nodes.length && <UI.ImageButtonsContainer>
          <Button
            data-testid='graph-zoom-in'
            id='graph-zoom-in'
            type='link'
            size='middle'
            icon={<MagnifyingGlassPlusOutlined />} />
          <Button
            data-testid='graph-zoom-out'
            id='graph-zoom-out'
            type='link'
            size='middle'
            icon={<MagnifyingGlassMinusOutlined />} />
          <Button
            data-testid='graph-zoom-fit'
            id='graph-zoom-fit'
            size='middle'
            type='link'
            icon={<SearchFitOutlined />}/>
        </UI.ImageButtonsContainer>
      }
    </div>
  </Loader>
}

export function TopologyGraph (props:{ venueId?: string,
  showTopologyOn: ShowTopologyFloorplanOn,
  deviceMac?: string }) {
  const [modalVisible, setModalVisible] = useState<boolean>(false)

  return (
    <>
      {modalVisible &&
        <UI.TopologyGraphModal
          visible={true}
          onCancel={() => setModalVisible(false)}
          destroyOnClose
          title={''}
          width={'90%'}
          style={{ overflow: 'hidden' }}
          okButtonProps={{ style: { display: 'none' } }}
          cancelButtonProps={{ style: { display: 'none' } }}
        >
          <div className='TopologyGraphContainer'>
            <TopologyGraphComponent
              {...props}
              modalVisible={modalVisible}
              setModalVisible={setModalVisible}
            />
          </div>
        </UI.TopologyGraphModal>}
      {!modalVisible &&
        <TopologyGraphComponent
          {...props}
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
        />
      }
    </>
  )
}

export function DeviceIcon (props: { deviceType: DeviceTypes,
  deviceStatus: TopologyDeviceStatus }) {
  const { deviceType, deviceStatus } = props

  function getDeviceIcon () {
    switch (deviceType) {
      case DeviceTypes.Switch:
        return <Switch width={24} height={24} x={-12} y={-12} />
      case DeviceTypes.SwitchStack:
        return <StackDevice />
      case DeviceTypes.Ap:
        return <AccessPointWifi width={24} height={24} x={-12} y={-12} />
      case DeviceTypes.Cloud:
        return <CloudSolid />
      case DeviceTypes.ApMesh:
        return <AccessPointWifiMesh />
      case DeviceTypes.ApMeshRoot:
        return <AccessPointWifiMeshRoot />
      case DeviceTypes.ApWired:
        return <AccessPointWifiPort />
      default:
        return <Unknown />
    }
  }

  return (
    <UI.Device deviceStatus={deviceStatus}>
      {
        getDeviceIcon()
      }
    </UI.Device>
  )
}