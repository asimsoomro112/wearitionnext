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

  const collections = products.length > 0 ? products.map((p, i) => {
    const grad = BG_GRADIENTS[i % BG_GRADIENTS.length]
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

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  const col = collections[active] || FALLBACK_COLLECTIONS[0]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Jost:wght@200;300;400;500;600&display=swap');
      `}</style>

      <section
        className={styles.hero}
        style={{ '--accent': col.accent, '--text-accent': col.textAccent } as React.CSSProperties}
      >
        <div className={styles.bg} style={{ background: col.bg }} key={`bg-${active}`} />
        <div className={styles.noise} />

        <div className={styles.cardWrapper}>
          {collections.map((c, i) => {
            // Logic for a long 8-card stack
            // -4, -3, -2, -1, 0, 1, 2, 3
            const diff = i - active
            // Handle wrapping
            let offset = diff
            if (diff > collections.length / 2) offset -= collections.length
            if (diff < -collections.length / 2) offset += collections.length

            const isActive = offset === 0
            const absOffset = Math.abs(offset)
            
            // Only show cards within a certain range
            if (absOffset > 5) return null

            let classNames = [styles.card]
            if (isActive) classNames.push(styles.cardActive)
            else if (offset === 1) classNames.push(styles.cardNext1)
            else if (offset === 2) classNames.push(styles.cardNext2)
            else if (offset === 3) classNames.push(styles.cardNext3)
            else if (offset === 4) classNames.push(styles.cardNext4)
            else if (offset === -1) classNames.push(styles.cardPrev1)
            else if (offset === -2) classNames.push(styles.cardPrev2)
            else if (offset === -3) classNames.push(styles.cardPrev3)

            return (
              <div
                key={c.id}
                className={classNames.join(' ')}
                onClick={() => !isActive && goTo(i)}
                style={{ '--depth': absOffset } as React.CSSProperties}
              >
                <div className={styles.cardImg} style={{ background: c.bg }}>
                  {c.img && (
                    <img
                      src={c.img}
                      alt={c.brand}
                      draggable="false"
                      className={styles.productImg}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
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

        <div className={styles.content}>
          <div className={styles.label} key={`label-${animKey}`}>{col.label}</div>
          <div className={styles.titleBlock} key={`title-${animKey}`}>
            <h2 className={styles.brand}>{col.brand}</h2>
            <h1 className={styles.collection}>
              <span className={styles.line1}>{col.line1}</span>
              <span className={styles.line2}>{col.line2}</span>
            </h1>
          </div>
          <div className={styles.tagPill} key={`tag-${animKey}`}>{col.tag}</div>

          <Link href={col.id.startsWith('f') ? "/shop" : `/product/${col.id}`} className={styles.cta} key={`cta-${animKey}`}>
            <span>SHOP NOW</span>
          </Link>
        </div>

        <div className={styles.dots}>
          {collections.slice(0, 10).map((c, i) => (
            <button
              key={c.id}
              className={`${styles.dot} ${i === active ? styles.dotActive : ''}`}
              onClick={() => goTo(i)}
            >
              {i === active && <span className={styles.dotProgress} key={progressKey} style={{ animationDuration: `${AUTO_PLAY_INTERVAL}ms` }} />}
            </button>
          ))}
        </div>

        <button className={`${styles.navBtn} ${styles.navPrev}`} onClick={goPrev} aria-label="Previous">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button className={`${styles.navBtn} ${styles.navNext}`} onClick={goNext} aria-label="Next">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </section>
    </>
  )
}
