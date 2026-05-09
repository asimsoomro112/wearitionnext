'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './HeroSection.module.css'
import { formatCurrency } from '@/lib/currency'
import Link from 'next/link'

const FALLBACK_COLLECTIONS = [
  {
    id: 'f1',
    label: 'NEW ARRIVAL',
    brand: 'WEARITION',
    line1: 'LUXURY',
    line2: 'COLLECTION',
    price: 'Rs. 12,500',
    tag: 'Premium Selection',
    bg: 'linear-gradient(145deg, #F2EDE4 0%, #E8DDD0 40%, #D4C5B0 100%)',
    accent: '#8B6914',
    textAccent: '#5C4209',
    img: '',
  }
]

const BG_GRADIENTS = [
  { bg: 'linear-gradient(145deg, #F2EDE4 0%, #E8DDD0 40%, #D4C5B0 100%)', accent: '#8B6914', textAccent: '#5C4209' },
  { bg: 'linear-gradient(145deg, #EAF0F2 0%, #D4E5EA 40%, #B8D0D8 100%)', accent: '#2A6478', textAccent: '#1A3F4E' },
  { bg: 'linear-gradient(145deg, #F0EBF2 0%, #E2D5E8 40%, #C8B4D0 100%)', accent: '#6B3578', textAccent: '#3E1F49' },
  { bg: 'linear-gradient(145deg, #F2EAE2 0%, #EAD8C8 40%, #D4B898 100%)', accent: '#8B4513', textAccent: '#5C2D0A' },
]

const AUTO_PLAY_INTERVAL = 4500

interface HeroSectionProps {
  products?: any[]
}

export default function HeroSection({ products = [] }: HeroSectionProps) {
  const [active, setActive] = useState(0)
  const [animKey, setAnimKey] = useState(0)
  const [progressKey, setProgressKey] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Map products to the collection format
  const collections = products.length > 0 ? products.map((p, i) => {
    const grad = BG_GRADIENTS[i % BG_GRADIENTS.length]
    // Split title for line1 and line2
    const parts = p.title.split(' ')
    const line1 = parts.slice(0, Math.ceil(parts.length / 2)).join(' ')
    const line2 = parts.slice(Math.ceil(parts.length / 2)).join(' ')

    return {
      id: p.id,
      label: p.isNew ? 'NEW ARRIVAL' : 'FEATURED',
      brand: p.brand || 'WEARITION',
      line1: line1.toUpperCase(),
      line2: (line2 || p.category || 'COLLECTION').toUpperCase(),
      price: formatCurrency(p.price),
      tag: p.category || 'Luxury Resale',
      img: p.images?.[0] || p.image,
      ...grad
    }
  }) : FALLBACK_COLLECTIONS

  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const goTo = useCallback((index: number) => {
    setActive(index)
    setAnimKey((k) => k + 1)
    setProgressKey((k) => k + 1)
  }, [])

  const goNext = useCallback(() => {
    if (collections.length <= 1) return
    goTo((active + 1) % collections.length)
  }, [active, goTo, collections.length])

  const goPrev = useCallback(() => {
    if (collections.length <= 1) return
    goTo((active - 1 + collections.length) % collections.length)
  }, [active, goTo, collections.length])

  useEffect(() => {
    if (isPaused || collections.length <= 1) return
    timerRef.current = setTimeout(goNext, AUTO_PLAY_INTERVAL)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [active, isPaused, goNext, collections.length])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    setIsPaused(true)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      dx < 0 ? goNext() : goPrev()
    }
    setTimeout(() => setIsPaused(false), 500)
  }

  const col = collections[active] || FALLBACK_COLLECTIONS[0]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Jost:wght@200;300;400;500;600&display=swap');
      `}</style>

      <section
        ref={containerRef}
        className={styles.hero}
        style={{ '--accent': col.accent, '--text-accent': col.textAccent } as React.CSSProperties}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Morphing Background */}
        <div
          className={styles.bg}
          style={{ background: col.bg }}
          key={`bg-${active}`}
        />

        {/* Noise Texture Overlay */}
        <div className={styles.noise} />

        {/* Floating decorative ring */}
        <div className={styles.ring} key={`ring-${active}`} />

        {/* Image Card Stack */}
        <div className={styles.cardWrapper}>
          {collections.map((c, i) => {
            const offset = i - active
            const isActive = offset === 0
            const isPrev = offset === -1 || (active === 0 && i === collections.length - 1)
            const isNext = offset === 1 || (active === collections.length - 1 && i === 0)

            return (
              <div
                key={c.id}
                className={`${styles.card} ${isActive ? styles.cardActive : ''} ${isPrev ? styles.cardPrev : ''} ${isNext ? styles.cardNext : ''}`}
                onClick={() => !isActive && goTo(i)}
              >
                <div className={styles.cardImg} style={{ background: c.bg }}>
                  {c.img && (
                    <img
                      src={c.img}
                      alt={c.brand}
                      className={styles.productImg}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  )}
                  <div className={styles.silhouette} />
                </div>

                {isActive && (
                  <div className={styles.priceTag} key={`price-${animKey}`}>
                    <span className={styles.priceLabel}>VALUE</span>
                    <span className={styles.priceValue}>{c.price}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Text Content */}
        <div className={styles.content}>
          <div className={styles.labelRow} key={`label-${animKey}`}>
            <span className={styles.labelLine} />
            <span className={styles.label}>{col.label}</span>
          </div>

          <div className={styles.titleBlock} key={`title-${animKey}`}>
            <h2 className={styles.brand}>{col.brand}</h2>
            <h1 className={styles.collection}>
              <span className={styles.line1}>{col.line1}</span>
              <span className={styles.line2}>{col.line2}</span>
            </h1>
          </div>

          <div className={styles.tagPill} key={`tag-${animKey}`}>
            {col.tag}
          </div>

          <Link href={collections.length > 0 && collections[active].id.startsWith('f') ? "/shop" : `/product/${collections[active].id}`} className={styles.cta} key={`cta-${animKey}`}>
            <span>SHOP NOW</span>
            <span className={styles.ctaArrow}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </Link>
        </div>

        {/* Progress Dots */}
        {collections.length > 1 && (
          <div className={styles.dots}>
            {collections.map((c, i) => (
              <button
                key={c.id}
                className={`${styles.dot} ${i === active ? styles.dotActive : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Go to collection ${i + 1}`}
              >
                {i === active && (
                  <span
                    className={styles.dotProgress}
                    key={progressKey}
                    style={{ animationDuration: `${AUTO_PLAY_INTERVAL}ms` }}
                  />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Side Navigation Arrows */}
        {collections.length > 1 && (
          <>
            <button className={`${styles.navBtn} ${styles.navPrev}`} onClick={goPrev} aria-label="Previous">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className={`${styles.navBtn} ${styles.navNext}`} onClick={goNext} aria-label="Next">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M8 4L14 10L8 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        )}
      </section>
    </>
  )
}
