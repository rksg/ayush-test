import { useEffect, useState } from 'react'

import { DndProvider }  from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useIntl }      from 'react-intl'

import {
  Button,
  useLayoutContext
} from '@acx-ui/components'
import {
  ArrowsIn,
  ArrowsOut,
  Close
} from '@acx-ui/icons-new'
import { Canvas } from '@acx-ui/rc/utils'

import { CardInfo, layoutConfig, Section, Group } from './Canvas'
import Layout                                     from './components/Layout'
import {
  DEFAULT_DASHBOARD_ID,
  getCalculatedColumnWidth,
  getCanvasData,
  getMenuWidth,
  getPreviewModalWidth
} from './index.utils'
import * as UI from './styledComponents'

export const PreviewDashboardModal = (props: {
  data: Canvas[]
  visible: boolean
  setVisible: (visible: boolean) => void
  DefaultDashboard?: React.FC
}) => {
  const { $t } = useIntl()
  const { data, visible, setVisible, DefaultDashboard } = props
  const { menuCollapsed } = useLayoutContext()
  const [canvasId, setCanvasId] = useState('')
  const [groups, setGroups] = useState([] as Group[])
  const [sections, setSections] = useState([] as Section[])
  const [shadowCard, setShadowCard] = useState({} as CardInfo)

  const previewId = data?.[0]?.id
  const isDefaultDashboard = previewId === DEFAULT_DASHBOARD_ID
  const menuWidth = getMenuWidth(menuCollapsed)
  const modalDefaultWidth = document.documentElement.clientWidth - menuWidth
  const [isFullmode, setIsFullmode] = useState(false)
  const [modalWidth, setModalWidth] = useState(modalDefaultWidth)
  const [layout, setLayout] = useState({
    ...layoutConfig,
    containerWidth: modalWidth,
    calWidth: getCalculatedColumnWidth(menuCollapsed, modalWidth)
  })

  useEffect(() => {
    const menuWidth = getMenuWidth(menuCollapsed)
    const modalWidth = getPreviewModalWidth(menuWidth, isFullmode)
    setTimeout(()=>{
      setLayout({
        ...layout,
        containerWidth: modalWidth,
        calWidth: getCalculatedColumnWidth(menuCollapsed, modalWidth)
      })
    }, 180)
    setModalWidth(modalWidth)
  }, [menuCollapsed, isFullmode])

  useEffect(() => {
    if (visible && previewId) {
      if (!isDefaultDashboard) {
        const { canvasId, sections, groups } = getCanvasData(data)
        if (canvasId && sections) {
          setCanvasId(canvasId)
          setSections(sections)
          setGroups(groups)
          setTimeout(() => {
            const modalBody = document.querySelector('.ant-modal-body')
            if (modalBody) {
              modalBody.scrollTop = 0
            }
          }, 50)
        }
      } else {
        setCanvasId(previewId)
      }
    } else {
      setCanvasId('')
    }
  }, [visible])

  return <UI.PreviewModal
    title=''
    centered
    closable={false}
    zIndex={1001}
    footer={[]}
    visible={visible && !!canvasId}
    width={modalWidth}
    className={isFullmode ? 'fullmode' : ''}
    forceRender
    destroyOnClose={false}
  >
    { visible && !!canvasId && <>
      <div className='header'>
        <div className='title'>{ isDefaultDashboard
          ? $t({ defaultMessage: 'RUCKUS One Default Dashboard' })
          : data[0]?.name }
        </div>
        <div className='action'>
          {isFullmode
            ? <Button
              data-testid='collapsed-button'
              ghost={true}
              icon={<ArrowsIn size='md' />}
              onClick={()=> setIsFullmode(false)}
            />
            : <>
              <Button
                data-testid='expanded-button'
                ghost={true}
                icon={<ArrowsOut size='md' />}
                onClick={()=> setIsFullmode(true)}
              />
              <Button
                data-testid='close-button'
                ghost={true}
                icon={<Close size='md' />}
                onClick={()=> setVisible(false)}
              />
            </>}
        </div>
      </div>
      { isDefaultDashboard && DefaultDashboard
        ? <div style={{ padding: '10px 36px 40px' }}><DefaultDashboard /></div>
        : <DndProvider backend={HTML5Backend}>
          <div className='grid'>
            <UI.Grid $type='pageview'>
              <Layout
                readOnly={true}
                sections={sections}
                groups={groups}
                setGroups={setGroups}
                compactType={'horizontal'}
                layout={layout}
                setLayout={setLayout}
                canvasId={canvasId}
                shadowCard={shadowCard}
                setShadowCard={setShadowCard}
                containerId='preview-container'
              />
            </UI.Grid>
          </div>
        </DndProvider>
      }
    </>}
  </UI.PreviewModal>
}