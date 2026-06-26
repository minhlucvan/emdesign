"use client"

import React, { useEffect, useRef, useState } from "react"

// Inject global chat scrollbar styles once
if (typeof document !== 'undefined' && !document.getElementById('emdesign-scroll-style')) {
  const style = document.createElement('style');
  style.id = 'emdesign-scroll-style';
  style.textContent = `
    .emdesign-scroll::-webkit-scrollbar { width: 4px; }
    .emdesign-scroll::-webkit-scrollbar-track { background: transparent; }
    .emdesign-scroll::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.25); border-radius: 2px; }
    .emdesign-scroll::-webkit-scrollbar-thumb:hover { background: rgba(128,128,128,0.4); }
    .emdesign-scroll { scrollbar-width: thin; scrollbar-color: rgba(128,128,128,0.25) transparent; }
  `;
  document.head.appendChild(style);
}

const ACTIVATION_THRESHOLD = 50
const MIN_SCROLL_UP_THRESHOLD = 10

export function useAutoScroll(dependencies: React.DependencyList) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const previousScrollTop = useRef<number | null>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }

  const handleScroll = () => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    const distanceFromBottom = Math.abs(scrollHeight - scrollTop - clientHeight)
    const isScrollingUp = previousScrollTop.current ? scrollTop < previousScrollTop.current : false
    const scrollUpDistance = previousScrollTop.current ? previousScrollTop.current - scrollTop : 0
    const isDeliberateScrollUp = isScrollingUp && scrollUpDistance > MIN_SCROLL_UP_THRESHOLD

    if (isDeliberateScrollUp) {
      setShouldAutoScroll(false)
    } else {
      setShouldAutoScroll(distanceFromBottom < ACTIVATION_THRESHOLD)
    }
    previousScrollTop.current = scrollTop
  }

  const handleTouchStart = () => setShouldAutoScroll(false)

  useEffect(() => {
    if (containerRef.current) {
      previousScrollTop.current = containerRef.current.scrollTop
    }
  }, [])

  useEffect(() => {
    if (shouldAutoScroll) scrollToBottom()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  return { containerRef, scrollToBottom, handleScroll, shouldAutoScroll, handleTouchStart }
}
