import { useEffect, useRef } from 'react'

export function IFrame (props: React.IframeHTMLAttributes<HTMLIFrameElement>) {

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const observerRef = useRef<null | MutationObserver>(null)

  useEffect(() => {
    const handleIframeSrcChange = () => {

      const actualHost = props.src
      const newHost = (iframeRef?.current)?.src

      if (actualHost !== newHost)
        window.location.reload()
    }

    const observeIframeSrcChange = () => {
      observerRef.current = new MutationObserver((mutationsList) => {
        for (let mutation of mutationsList) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
            handleIframeSrcChange()
            break
          }
        }
      })

      if (iframeRef.current && observerRef.current) {
        observerRef.current.observe(iframeRef.current, { attributes: true })
      }
    }

    observeIframeSrcChange()

    return () => {
    // Cleanup function
      if (observerRef.current && iframeRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return (
    <iframe
      title={props.title}
      ref={iframeRef}
      {...props}
    />
  )
}
