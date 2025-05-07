import { forwardRef, ReactElement, useEffect, useImperativeHandle, useState } from 'react'

import { Form, Input, Menu, MenuProps } from 'antd'
import _                                from 'lodash'
import { useIntl }                      from 'react-intl'

import { Button, Dropdown, Tooltip }                              from '@acx-ui/components'
import { ArrowExpand, LockOutlined, GlobeOutlined, Check, Close } from '@acx-ui/icons-new'
import { useGetCanvasQuery, useCreateCanvasMutation, useUpdateCanvasMutation,
  useLazyGetCanvasByIdQuery, usePatchCanvasMutation } from '@acx-ui/rc/services'
import { Canvas as CanvasType, trailingNorLeadingSpaces, validateDuplicateName } from '@acx-ui/rc/utils'

import Layout                                     from './components/Layout'
import ManageCanvasDrawer                         from './components/ManageCanvasDrawer'
import { PreviewDashboardModal }                  from './PreviewDashboardModal'
import * as UI                                    from './styledComponents'
import utils                                      from './utils'
import { compactLayout, compactLayoutHorizontal } from './utils/compact'

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
  name: string
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

export const layoutConfig:LayoutConfig = {
  containerWidth: 1200,
  containerHeight: 700, // min height
  calWidth: 380,
  rowHeight: 50,
  col: 4, // fixed (for R1)
  margin: [20, 10],
  containerPadding: [0, 0] // deprecated
}

export const DEFAULT_CANVAS = [
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
  save: () => Promise<void>
  removeShadowCard: () => void
  currentCanvas: CanvasType
}

export const DashboardIcon = () => {
  const { $t } = useIntl()
  return <Tooltip
    overlayStyle={{ maxWidth: '270px' }}
    title={$t({ defaultMessage: 'This canvas is being used as the dashboard.' })}
    placement='bottom'
  >
    <UI.DashboardIcon size='sm' />
  </Tooltip>
}

interface CanvasProps {
  canvasHasChanges?: boolean
  onCanvasChange?: (hasChanges: boolean) => void
  checkChanges?: (hasChanges:boolean, callback:()=>void, handleSave:()=>void) => void
  groups: Group[]
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>
  editCanvasId?: string
}

const Canvas = forwardRef<CanvasRef, CanvasProps>(({
  onCanvasChange, groups, setGroups, checkChanges, canvasHasChanges, editCanvasId }, ref) => {
  const { $t } = useIntl()
  const [sections, setSections] = useState([] as Section[])
  const [canvasId, setCanvasId] = useState(editCanvasId || '')
  const [diffWidgetIds, setDiffWidgetIds] = useState([] as string[])
  const [currentCanvas, setCurrentCanvas] = useState({} as CanvasType)
  const [layout, setLayout] = useState(layoutConfig)
  const [shadowCard, setShadowCard] = useState({} as CardInfo)
  const [manageCanvasVisible, setManageCanvasVisible] = useState(false)
  const [previewModalVisible, setPreviewModalVisible] = useState(false)
  const [isEditName, setIsEditName] = useState(false)
  const [visibilityType, setVisibilityType] = useState('')
  const [nameFieldError, setNameFieldError] = useState('')

  const [getCanvasById] = useLazyGetCanvasByIdQuery()
  const [createCanvas] = useCreateCanvasMutation()
  const [updateCanvas] = useUpdateCanvasMutation()
  const [patchCanvas] = usePatchCanvasMutation()
  const { data: canvasList } = useGetCanvasQuery({})
  const [form] = Form.useForm()

  useEffect(() => {
    if (!groups.length || !sections.length) return
    const tmp = _.cloneDeep(sections)
    tmp.forEach(s => {
      s.groups = groups.filter(g => g.sectionId === s.id)
    })
    let hasDiff = !_.isEqual(tmp, sections)

    const tmpDiff = [] as string[]
    // The current requirement includes only one section and one group.
    // Push IDs of newly added or updated widgets.
    tmp[0].groups[0].cards.forEach(t => {
      const origin = sections[0].groups[0].cards.find(i => i.widgetId === t.widgetId)
      if(!origin) {
        tmpDiff.push(t.widgetId as string)
      } else if(!_.isEqual(t, origin)) {
        tmpDiff.push(t.widgetId as string)
      }
    })

    setDiffWidgetIds(tmpDiff)
    setCanvasChange(hasDiff)
  }, [groups, sections])

  useEffect(() => {
    if(canvasId) {
      const fetchData = async () => {
        await getCanvasById({ params: { canvasId } }).unwrap().then((res)=> {
          setupCanvas(res)
        })
      }
      fetchData()
    }
  }, [canvasId])

  useEffect(() => {
    if(canvasList && !editCanvasId) {
      const newCanvasId = canvasList[0].id
      const fetchData = async () => {
        await getCanvasById({ params: { canvasId } }).unwrap().then((res)=> {
          setupCanvas(res)
        })
      }
      if(newCanvasId == canvasId){
        fetchData()
      } else {
        setCanvasId(newCanvasId)
      }
    }
  }, [canvasList])

  const onNewCanvas = async () => {
    await createCanvas({})
  }

  const fetchCanvas = async () => {
    await getCanvasById({ params: { canvasId } }).unwrap().then((res)=> {
      setupCanvas(res)
    })
  }

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    const actions = () => {
      if(e.key === 'New_Canvas') {
        onNewCanvas()
      } else if (e.key === 'Manage_Canvases') {
        setManageCanvasVisible(true)
      } else {
        const selected = canvasList?.find(i => i.id == e.key)
        setCanvasId(selected?.id || canvasId)
        if(canvasId == selected?.id){
          fetchCanvas()
        }
      }
      setCanvasChange(false)
    }
    if(checkChanges) {
      checkChanges(!!canvasHasChanges, () => {
        actions()
      }, ()=>{
        onSave(actions)
      })
    }
  }

  const patchCurrentCanvas = async (payload: { [key:string]: string|boolean }) => {
    await patchCanvas({
      params: { canvasId },
      payload
    })
  }

  const handleVisibilityMenuClick: MenuProps['onClick'] = (e) => {
    if(visibilityType !== e.key) {
      setVisibilityType(e.key)
      if(checkChanges) {
        const payload:{ [key:string]: boolean } = {
          visible: e.key == 'public'
        }
        checkChanges(!!canvasHasChanges, () => {
          patchCurrentCanvas(payload)
        }, ()=>{
          onSave(()=>{patchCurrentCanvas(payload)})
        })
      }
    }
  }


  const setCanvasChange = (hasChanges: boolean) => {
    if (onCanvasChange) {
      onCanvasChange(hasChanges)
    }
  }

  const setupCanvas = (response: CanvasType) => {
    setCurrentCanvas(response)
    setVisibilityType(response.visible ? 'public' : 'private')
    if(isEditName){
      setIsEditName(false)
    }
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

  const onSave = async (callback?: ()=>void) => {
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
          widgetIds,
          diffWidgetIds
        }
      }).unwrap().then(() => {
        if(callback) {
          callback()
        }
      })
    }
    setCanvasChange(false)
    // localStorage.setItem('acx-ui-canvas', JSON.stringify(tmp))
  }

  useImperativeHandle(ref, () => ({
    save: onSave,
    removeShadowCard: removeShadowCard,
    currentCanvas: currentCanvas
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

  const visibilityMap: { [key:string]: { icon: ReactElement, label: string } } = {
    private: {
      icon: <LockOutlined size='sm' />,
      label: $t({ defaultMessage: 'Private' })
    },
    public: {
      icon: <GlobeOutlined size='sm' />,
      label: $t({ defaultMessage: 'Public' })
    }
  }

  const onEditCanvasName = () => {
    form.setFieldValue('name', currentCanvas.name)
    setNameFieldError('')
    setIsEditName(true)
  }

  const onCancelEditCanvasName = () => {
    setIsEditName(false)
  }

  const onSubmit = (value: { name:string }) => {
    if(checkChanges) {
      const payload:{ [key:string]: string } = {
        name: value.name
      }
      checkChanges(!!canvasHasChanges, () => {
        patchCurrentCanvas(payload)
      }, ()=>{
        onSave(()=>{patchCurrentCanvas(payload)})
      })
    }
  }

  const editCanvasName = () => canvasList &&
  <div className='edit-canvas-name'>
    <div className='edit-input'>
      <Form.Item
        name='name'
        data-testid='canvas-name'
        rules={[
          { required: true },
          { max: 64 },
          { validator: (_, value) => trailingNorLeadingSpaces(value) },
          { validator: (_, value) => validateDuplicateName({
            name: value,
            id: currentCanvas.id
          }, canvasList.map(i => ({ id: i.id, name: i.name })))
          }
        ]}
        children={<Input />}
      />
    </div>
    <div className='action button-group'>
      <div className='button confirm'
        data-testid='confirm'
        onClick={() => form.submit()}>
        <Check size='sm'/>
      </div>
      <div className='button cancel'
        data-testid='cancel'
        onClick={() => {
          onCancelEditCanvasName()
        }}>
        <Close size='sm'/>
      </div>
    </div>
    <div className='error'>
      {nameFieldError}
    </div>
  </div>

  const onFieldsChange = () => {
    setNameFieldError(form.getFieldError('name')[0])
  }

  return (
    <UI.Canvas>
      <div className='header'>
        <Form form={form} onFinish={onSubmit} onFieldsChange={onFieldsChange}>
          {
            currentCanvas.name && canvasList ? <>
              {
                isEditName ? editCanvasName() :
                  <div className='title'>
                    <div className='name' onClick={onEditCanvasName}>
                      {currentCanvas.name}
                    </div>
                    <Dropdown overlay={<Menu
                      onClick={handleMenuClick}
                      defaultSelectedKeys={[canvasId]}
                      items={[
                        ...canvasList.map(c => ({
                          icon: c.visible ?
                            <GlobeOutlined size='sm' /> : <LockOutlined size='sm' />,
                          key: c.id,
                          label: c.name,
                          itemIcon: c.dashboardIds && <div
                            style={{ marginLeft: '10px', height: '20px' }}><DashboardIcon /></div>
                        })),
                        {
                          type: 'divider'
                        },
                        {
                          key: 'New_Canvas',
                          label: $t({ defaultMessage: 'New Canvas' }),
                          disabled: canvasList.length >= 10
                        },
                        {
                          key: 'Manage_Canvases',
                          label: $t({ defaultMessage: 'Manage My Canvases' })
                        }
                      ]}/>
                    }
                    placement='bottom'>{() =>
                        <ArrowExpand size='sm' data-testid='canvas-list' />
                      }
                    </Dropdown>
                    {currentCanvas.dashboardIds && <DashboardIcon/> }
                  </div>
              }
            </> : <div/>
          }
        </Form>
        <div className='actions'>
          {
            visibilityType && <>
              <Dropdown
                placement='bottomRight'
                overlay={
                  <Menu
                    onClick={handleVisibilityMenuClick}
                    selectable
                    selectedKeys={[visibilityType]}
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
                    ]}/>
                }>{() =>
                  <div className='visibility-type' data-testid='visibility-type'>
                    <div className='label'>
                      {visibilityMap[visibilityType].icon}
                      {visibilityMap[visibilityType].label}
                    </div>
                    <ArrowExpand size='sm' />
                  </div>
                }
              </Dropdown>
              <Tooltip.Question
                iconStyle={{ width: '16px', margin: '0px 10px 0px 5px' }}
                overlayStyle={{ maxWidth: '270px' }}
                placement='bottom'
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
              />
            </>
          }
          <Button className='black' onClick={()=>{setPreviewModalVisible(true)}}>
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
      {
        manageCanvasVisible && <ManageCanvasDrawer
          visible={manageCanvasVisible}
          onClose={()=>{setManageCanvasVisible(false)}}
          canvasList={canvasList as CanvasType[]}
        />
      }
      {
        previewModalVisible && <PreviewDashboardModal
          data={[currentCanvas]}
          visible={previewModalVisible}
          setVisible={setPreviewModalVisible}
        />
      }
    </UI.Canvas>
  )
})

export default Canvas
