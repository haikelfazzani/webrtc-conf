import React, { useState, useEffect, useRef, useCallback } from 'react'
import { largestRect } from 'rect-scaler'

function recalculateLayout(containerWidth, containerHeight, numRects, rectAspectRatio = 1) {
    return largestRect(
        containerWidth,
        containerHeight,
        numRects,
        rectAspectRatio,
        1
    )
}

function usePackedGridLayout(boxAspectRatio = 1) {
    const [numBoxes, setNumBoxes] = useState(0)
    const [layout, setLayout] = useState()
    const containerRef = useRef()
    const updateLayout = useCallback((el) => {
        if (el != null) {
            containerRef.current = el
        }
        if (numBoxes > 0 && containerRef.current) {
            const width = containerRef.current.getBoundingClientRect().width
            const height = containerRef.current.getBoundingClientRect().height
            setLayout(recalculateLayout(width, height, numBoxes, boxAspectRatio))
        }
    },
        [numBoxes, boxAspectRatio]
    )
    useEffect(() => {
        updateLayout()
        const listener = () => updateLayout()
        window.addEventListener('resize', listener)
        return () => {
            window.removeEventListener('resize', listener)
        }
    }, [updateLayout])

    return [layout, setNumBoxes, updateLayout]
}

export function PackedGrid({ children, className, boxClassName, updateLayoutRef, boxAspectRatio }) {
    const [layout, setNumBoxes, updateLayout] = usePackedGridLayout(boxAspectRatio)

    useEffect(() => {
        setNumBoxes(React.Children.count(children))
    }, [children])

    useEffect(() => {
        if (updateLayoutRef) {
            updateLayoutRef.current = () => updateLayout()
        }
        return () => {
            if (updateLayoutRef) {
                updateLayoutRef.current = undefined
            }
        }
    }, [updateLayout, updateLayoutRef])

    return (
        <div
            className={className}
            ref={updateLayout}
            style={{ display: 'flex', flexFlow: 'row wrap', placeContent: 'center' }}
        >
            {React.Children.map(children, (child) => (
                <div
                    className={boxClassName}
                    style={
                        layout
                            ? {
                                display: 'block',
                                width: '100%',
                                height: '100%',
                                maxWidth: `${layout.width}px`,
                                maxHeight: `${layout.height}px`
                            }
                            : {
                                display: 'none'
                            }
                    }
                >
                    {child}
                </div>
            ))}
        </div>
    )
}