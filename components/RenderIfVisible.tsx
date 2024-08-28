// stolen from https://github.com/NightCafeStudio/react-render-if-visible
// with my own optimizations

import React, { useCallback, useEffect, useRef, useState } from 'react'

const RenderIfVisible = ({
    initialVisible = false,
    defaultHeight = 200,
    visibleOffset = 1000,
    stayRendered = false,
    children,
}: any) => {
    const [isVisible, setIsVisible] = useState<boolean>(initialVisible)
    const wasVisible = useRef<boolean>(initialVisible)
    const placeholderHeight = useRef<number>(defaultHeight)
    const intersectionRef = useRef<HTMLDivElement>(null)

    const observerCallback = useCallback((entries: any) => {
        if (!entries[0].isIntersecting) {
            placeholderHeight.current = intersectionRef.current!.offsetHeight
        }
        setIsVisible(entries[0].isIntersecting)
    }, [])

    useEffect(() => {
        if (intersectionRef.current) {
            const observer = new IntersectionObserver(observerCallback, {
                rootMargin: `${visibleOffset}px 0px ${visibleOffset}px 0px`,
            })

            observer.observe(intersectionRef.current)

            return () => {
                observer.disconnect()
            }
        }
    }, [observerCallback, visibleOffset])

    useEffect(() => {
        if (isVisible) {
            wasVisible.current = true
        }
    }, [isVisible])

    const placeholderStyle = { height: placeholderHeight.current }

    return React.createElement('div',
        {
            ref: intersectionRef,
        },
        isVisible || (stayRendered && wasVisible.current) ? (
            <>{children}</>
        ) : (
            React.createElement('div',
                {
                    style: placeholderStyle,
                }
            )
        )
    )
}

export default RenderIfVisible