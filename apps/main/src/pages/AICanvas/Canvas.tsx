import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Button }                                         from '@acx-ui/components'
import { useLazyGetCanvasQuery, useUpdateCanvasMutation } from '@acx-ui/rc/services'

import Layout            from './components/Layout'
import * as UI           from './styledComponents'
import { compactLayout } from './utils/compact'

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

const layout:LayoutConfig = {
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
}

interface CanvasProps {
  onCanvasChange?: (hasChanges: boolean) => void;
  groups: Group[]
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>
}

const Canvas = forwardRef<CanvasRef, CanvasProps>(({ onCanvasChange, groups, setGroups }, ref) => {
  const { $t } = useIntl()
  const [sections, setSections] = useState([] as Section[])
  const [canvasId, setCanvasId] = useState('')
  const [getCanvas] = useLazyGetCanvasQuery()
  const [updateCanvas] = useUpdateCanvasMutation()

  useEffect(() => {
    // const data = getFromLS()
    // setSections(data)
    // const group = data.reduce((acc:Section[], cur:Section) => [...acc, ...cur.groups], [])
    // setGroups(group)
    getDefaultCanvas()
  }, [])

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

  const getDefaultCanvas = async () => {
    const response = await getCanvas({}).unwrap()
    if (response?.length && response[0].content) {
      const canvasId = response[0].id
      let data = JSON.parse(response[0].content) as Section[]
      data = data.map(section => ({
        ...section,
        groups: section.groups.map(group => ({
          ...group,
          cards: compactLayout(group.cards)
        }))
      }))
      const groups = data.flatMap(section => section.groups)

      setCanvasId(canvasId)
      setSections(data)
      setGroups(groups)
      setCanvasChange(false)
    } else {
      if (response?.length && response[0].id) {
        setCanvasId(response[0].id)
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
    save: onSave
  }))

  const emptyCanvas = () => {
    setSections(DEFAULT_CANVAS)
    setGroups(DEFAULT_CANVAS.reduce((acc:Group[], cur:Section) => [...acc, ...cur.groups], []))
    setCanvasChange(false)
  }

  return (
    <UI.Canvas>
      <div className='header'>
        <div className='title'>
          <span>{$t({ defaultMessage: 'Dashboard Canvas' })}</span>
        </div>
        <div className='actions'>
          {/* <Button onClick={()=>{onClose()}}>
            {$t({ defaultMessage: 'Publish' })}
          </Button> */}
          {/* <Button className='black' onClick={()=>{onClose()}}>
            {$t({ defaultMessage: 'Preview' })}
          </Button> */}
          {/* <Button className='black' onClick={() => {emptyCanvas()}}>
            {$t({ defaultMessage: 'Clear' })}
          </Button> */}
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
            canvasId={canvasId}
          />
        </UI.Grid>
      </div>
    </UI.Canvas>
  )
})

export default Canvas
