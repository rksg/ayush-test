import { forwardRef, ReactElement, useEffect, useImperativeHandle, useState } from 'react'

import { Menu, MenuProps } from 'antd'
import _                   from 'lodash'
import { useIntl }         from 'react-intl'

import { Button, Dropdown, Tooltip }                                                                  from '@acx-ui/components'
import { ArrowExpand, Lock, GlobeOutlined }                                                           from '@acx-ui/icons-new'
import { useGetCanvasQuery, useLazyGetCanvasQuery, useCreateCanvasMutation, useUpdateCanvasMutation } from '@acx-ui/rc/services'
import { Canvas as CanvasType }                                                                       from '@acx-ui/rc/utils'

import Layout                                     from './components/Layout'
import * as UI                                    from './styledComponents'
import utils                                      from './utils'
import { compactLayout, compactLayoutHorizontal } from './utils/compact'

// import mockData from './mock'

const compactType = 'horizontal'

export interface LayoutConfig {
  containerWidth: number
  containerHeight: number
  calWidth: number
  rowHeight: number
  col: number
  margin: number[]
  containerPadding: number[]
}

export interface Size {
  width: number
  height: number
}

export interface CardInfo {
  id: string,
  gridx: number
  gridy: number
  width: number
  height: number
  type: string
  isShadow: boolean
  currentSizeIndex: number
  sizes: Size[]
  groupIndex: number
  chartType?: string
  widgetId?: string
  chatId?: string
  canvasId?: string
}
export interface Group {
  id: string
  sectionId: string
  type: string
  cards: CardInfo[]
  index?: number
  defaultTab?: string
  tabValue?: string
  tabLabel?: string
}
export interface Section {
  id: string
  type: string
  hasTab: boolean
  groups: Group[]
}

const layoutConfig:LayoutConfig = {
  containerWidth: 1200,
  containerHeight: 700, // min height
  calWidth: 380,
  rowHeight: 50,
  col: 4, // fixed (for R1)
  margin: [20, 10],
  containerPadding: [0, 0] // deprecated
}

const DEFAULT_CANVAS = [
  {
    id: 'default_section',
    type: 'section',
    hasTab: false,
    groups: [{
      id: 'default_group',
      sectionId: 'default_section',
      type: 'group',
      cards: []
    }]
  }
] as unknown as Section[]

export interface CanvasRef {
  save: () => Promise<void>;
  removeShadowCard: () => void
}

interface CanvasProps {
  onCanvasChange?: (hasChanges: boolean) => void;
  groups: Group[]
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>
}

const Canvas = forwardRef<CanvasRef, CanvasProps>(({ onCanvasChange, groups, setGroups }, ref) => {
  const { $t } = useIntl()
  const [sections, setSections] = useState([] as Section[])
  // const [canvasList, setCanvasList] = useState([] as CanvasType[])
  const [canvasId, setCanvasId] = useState('')
  const [currentCanvas, setCurrentCanvas] = useState({} as CanvasType)
  const [layout, setLayout] = useState(layoutConfig)
  const [shadowCard, setShadowCard] = useState({} as CardInfo)
  const [canvasMenu, setCanvasMenu] = useState<
    ReactElement<MenuProps>>(null as unknown as ReactElement<MenuProps>)

  const [getCanvas] = useLazyGetCanvasQuery()
  const [createCanvas] = useCreateCanvasMutation()
  const [updateCanvas] = useUpdateCanvasMutation()
  const { data: canvasList } = useGetCanvasQuery({})

  useEffect(() => {
    // const data = getFromLS()
    // setSections(data)
    // const group = data.reduce((acc:Section[], cur:Section) => [...acc, ...cur.groups], [])
    // setGroups(group)
    getDefaultCanvas()
  }, [])

  useEffect(() => {
    if(canvasList) {
      setCanvasMenu(<Menu
        onClick={handleMenuClick}
        defaultSelectedKeys={[canvasId]}
        items={[
          ...canvasList.map(c => ({
            icon: c.visible ? <GlobeOutlined size='sm' /> : <Lock size='sm' />,
            key: c.id,
            label: c.name,
            itemIcon: c.dashboardIds && <UI.DashboardIcon size='sm' />
            // style: canvasId == c.id ? {
            //     background: cssStr('--acx-accents-orange-20')
            //   } : {}
          })),
          {
            type: 'divider'
          },
          {
            key: 'New_Canvas',
            label: $t({ defaultMessage: 'New Canvas' })
          },
          {
            key: 'Manage_Canvases',
            label: $t({ defaultMessage: 'Manage My Canvases' })
          }
        ]}/>)
    }
  }, [canvasList])

  useEffect(() => {
    if (!groups.length || !sections.length) return
    const tmp = _.cloneDeep(sections)
    tmp.forEach(s => {
      s.groups = groups.filter(g => g.sectionId === s.id)
    })
    let hasDiff = !_.isEqual(tmp, sections)
    setCanvasChange(hasDiff)
  }, [groups, sections])

  // const getFromLS = () => {
  //   let ls = localStorage.getItem('acx-ui-canvas') ?
  //     JSON.parse(localStorage.getItem('acx-ui-canvas') || '') : DEFAULT_CANVAS // mockData
  //   return ls
  // }

  const setCanvasChange = (hasChanges: boolean) => {
    if (onCanvasChange) {
      onCanvasChange(hasChanges)
    }
  }

  const setupCanvas = (response: CanvasType) => {
    const canvasId = response.id
    setCanvasId(canvasId)
    setCurrentCanvas(response)
    if(response.content) {
      let data = JSON.parse(response.content) as Section[]
      data = data.map(section => ({
        ...section,
        groups: section.groups.map(group => ({
          ...group,
          cards: compactLayout(group.cards)
        }))
      }))
      const groups = data.flatMap(section => section.groups)
      setSections(data)
      setGroups(groups)
      setCanvasChange(false)
    } else {
      emptyCanvas()
    }
  }

  const getDefaultCanvas = async () => {
    const response = await getCanvas({}).unwrap()
    if (response?.length && response[0].content) {
      // setCanvasList(response)
      setupCanvas(response[0])
    } else {
      if (response?.length && response[0].id) {
        setCanvasId(response[0].id)
        setCurrentCanvas(response[0])
      }
      emptyCanvas()
    }
  }

  const onSave = async () => {
    const tmp = _.cloneDeep(sections)
    let widgetIds = [] as string[]
    let hasCard = false
    tmp.forEach(s => {
      s.groups = groups.filter(g => g.sectionId === s.id)
      s.groups.forEach(g => {
        if (g.cards.length && !hasCard) {
          hasCard = true
        }
        const groupWidgets = g.cards.map(i => i.widgetId) as string[]
        widgetIds = widgetIds.concat(groupWidgets)
      })
    })
    if (canvasId) {
      await updateCanvas({
        params: { canvasId },
        payload: {
          content: hasCard ? JSON.stringify(tmp) : '',
          widgetIds
        }
      })
    }
    setCanvasChange(false)
    // localStorage.setItem('acx-ui-canvas', JSON.stringify(tmp))
  }

  useImperativeHandle(ref, () => ({
    save: onSave,
    removeShadowCard: removeShadowCard
  }))

  const emptyCanvas = () => {
    setSections(DEFAULT_CANVAS)
    setGroups(DEFAULT_CANVAS.reduce((acc:Group[], cur:Section) => [...acc, ...cur.groups], []))
    setCanvasChange(false)
  }

  const removeShadowCard = () => {
    const groupIndex = 0
    const groupsTmp = _.cloneDeep(groups)
    groupsTmp[groupIndex].cards = groupsTmp[groupIndex].cards
      .filter((item) => item.id !== shadowCard.id)
      // Remove shadows from all cards within all groups.
    utils.setPropertyValueForCards(groupsTmp, 'isShadow', false)
    // Recompress the layout horizontally within the target group, and due to cross-group dependencies,
    // all groups must be compressed.
    _.forEach(groupsTmp, (g, i) => {
      if (compactType === 'horizontal') {
        let compactedLayout = compactLayoutHorizontal(
          groupsTmp[i].cards,
          layout.col, null
        )
        g.cards = compactedLayout
      } else if (compactType === 'vertical') {
        let compactedLayout = compactLayout(groupsTmp[i].cards)
        g.cards = compactedLayout
      }
    })
    setGroups(groupsTmp)
    setShadowCard({} as CardInfo)
  }

  const onNewCanvas = async () => {
    await createCanvas({}).unwrap().then((res)=>{
      setupCanvas(res)
    })
  }

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if(e.key === 'New_Canvas') {
      onNewCanvas()
    }
  }

  const visibilityMap: { [key:string]: { icon: ReactElement, label: string } } = {
    private: {
      icon: <Lock size='sm' />,
      label: $t({ defaultMessage: 'Private' })
    },
    public: {
      icon: <GlobeOutlined size='sm' />,
      label: $t({ defaultMessage: 'Public' })
    }
  }

  const visibilityMenu = (
    <Menu
      onClick={()=>{}}
      selectable
      defaultSelectedKeys={['private']}
      items={[
        {
          key: 'private',
          icon: visibilityMap['private'].icon,
          label: visibilityMap['private'].label
        },
        {
          key: 'public',
          icon: visibilityMap['public'].icon,
          label: visibilityMap['public'].label
        }
      ]
      }/>
  )

  return (
    <UI.Canvas>
      <div className='header'>
        {
          canvasMenu && <Dropdown overlay={canvasMenu}>{() =>
            <div className='title'>
              {
                currentCanvas.name && <>
                  <span>
                    {currentCanvas.name}
                  </span>
                  <ArrowExpand size='sm' />
                  {currentCanvas.dashboardIds && <UI.DashboardIcon size='sm' />}
                </>
              }
            </div>
          }</Dropdown>
        }
        <div className='actions'>
          <Dropdown overlay={visibilityMenu}>{(selectedKeys) =>
            <div className='visibility-type'>
              {selectedKeys && <div className='label'>
                {visibilityMap[selectedKeys].icon}
                {visibilityMap[selectedKeys].label}
              </div>}
              <ArrowExpand size='sm' />
            </div>
          }</Dropdown>
          <Tooltip.Question
            iconStyle={{ width: '16px', margin: '0px 10px 0px 5px' }}
            overlayStyle={{ maxWidth: '270px' }}
            title={<UI.Visibility>
              <div className='type'>
                <span className='title'>{$t({ defaultMessage: 'Private mode' })}</span>
                <div>
                  {$t({ defaultMessage: `Hide this canvas from the public. 
                     The canvas will be visible to the owner only.` })}
                </div>
              </div>
              <div className='type'>
                <span className='title'>{$t({ defaultMessage: 'Public mode' })}</span>
                <div>
                  {$t({
                    defaultMessage: 'Publish this canvas for all administrators in this tenant.'
                  })}
                </div>
              </div>
            </UI.Visibility>}
            placement='bottom'
          />
          <Button className='black' onClick={()=>{}}>
            {$t({ defaultMessage: 'Preview' })}
          </Button>
          <Button type='primary' onClick={()=>{onSave()}}>
            {$t({ defaultMessage: 'Save' })}
          </Button>
        </div>
      </div>
      <div className='grid' id='grid'>
        <UI.Grid>
          <Layout
            sections={sections}
            groups={groups}
            setGroups={setGroups}
            compactType={compactType}
            layout={layout}
            setLayout={setLayout}
            shadowCard={shadowCard}
            setShadowCard={setShadowCard}
            canvasId={canvasId}
          />
        </UI.Grid>
      </div>
    </UI.Canvas>
  )
})

export default Canvas
