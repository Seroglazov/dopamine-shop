'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Logo } from './ui';
import { useStore } from './store';

export function MotionSystem() {
  const path = usePathname();
  const { catalog } = useStore();
  const cursor = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const [intro, setIntro] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => { const media = matchMedia('(prefers-reduced-motion: reduce)'); const update = () => setReducedMotion(media.matches); update(); media.addEventListener('change', update); return () => media.removeEventListener('change', update); }, []);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    try { if (sessionStorage.getItem('dopamine-intro-v2')) return; sessionStorage.setItem('dopamine-intro-v2', '1'); } catch {}
    setIntro(true);
    const timeout = setTimeout(() => setIntro(false), 1100);
    return () => clearTimeout(timeout);
  }, []);
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let dispose = () => {};
    let canceled = false;
    async function setup() {
      if (reduced.matches) return;
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
      if (canceled) return;
      gsap.registerPlugin(ScrollTrigger);
      const ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element, i) => {
          gsap.from(element, { y: 48, rotate: i % 2 ? 1 : -1, opacity: 0, duration: .85, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 93%', once: true } });
        });
        const hero = document.querySelector('.hero');
        if (hero) {
          gsap.timeline().from('.hero-kicker', { y: 18, opacity: 0, duration: .65 }).from('.ink-word', { y: 70, rotate: -2, opacity: 0, duration: 1, ease: 'power4.out' }, '-=.35').from('.hero-bottom', { y: 25, opacity: 0, duration: .7 }, '-=.5');
          gsap.to('.hero-orbit', { rotate: 40, yPercent: -18, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 } });
        }
        const story = document.querySelector('.story');
        if (matchMedia('(min-width: 901px)').matches) {
          gsap.utils.toArray<HTMLElement>('.shape-drift').forEach(element => {
            gsap.fromTo(element, { y: 16 }, { y: -16, ease: 'none', scrollTrigger: { trigger: element.closest('section'), start: 'top bottom', end: 'bottom top', scrub: 1 } });
          });
        }
        if (story && matchMedia('(min-width: 901px)').matches) {
          gsap.timeline({ scrollTrigger: { trigger: story, start: 'top top', end: 'bottom bottom', scrub: .7 } })
            .to('.story-stage', { backgroundColor: '#ffd9ec', duration: 1 })
            .to('.room-illustration', { '--room-color': '#ff008c', rotate: -3, scale: 1.05, duration: 1 }, 0)
            .to('.room-extra', { scale: 1, opacity: 1, stagger: .12, ease: 'back.out(1.7)', duration: .6 }, .15)
            .to('.story-copy-1', { opacity: 0, y: -30, duration: .25 }, .25)
            .fromTo('.story-copy-2', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .25 }, .5)
            .to('.story-stage', { backgroundColor: '#c7ff00', duration: .7 }, 1.1)
            .to('.story-copy-2', { opacity: 0, y: -30, duration: .25 }, 1.2)
            .fromTo('.story-copy-3', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .3 }, 1.5);
        }
        const gallery = document.querySelector<HTMLElement>('.horizontal-track');
        if (gallery && matchMedia('(min-width: 1100px)').matches) {
          const distance = () => Math.max(0, gallery.scrollWidth - gallery.clientWidth);
          if (distance() > 0) gsap.to(gallery, { x: () => -distance(), ease: 'none', scrollTrigger: { trigger: '.horizontal-section', pin: true, start: 'top 90px', end: () => `+=${distance()}`, scrub: .8, invalidateOnRefresh: true } });
        }
      });
      const controller = new AbortController();
      const { signal } = controller;
      const magneticElements = Array.from(document.querySelectorAll<HTMLElement>('[data-magnetic]'));
      let speedTimer: ReturnType<typeof setTimeout> | null = null;
      let previousY = scrollY;
      let previousTime = performance.now();
      const marqueeAnimations = Array.from(document.querySelectorAll('.marquee>div')).flatMap(el => el.getAnimations());
      const track = () => {
        const max = document.documentElement.scrollHeight - innerHeight;
        if (progress.current) progress.current.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
        document.documentElement.classList.toggle('scrolled', scrollY > 40);
        const now = performance.now(); const velocity = Math.abs(scrollY - previousY) / Math.max(16, now - previousTime); previousY = scrollY; previousTime = now;
        marqueeAnimations.forEach(animation => animation.updatePlaybackRate(1 + Math.min(velocity / 2, 2)));
        if (speedTimer) clearTimeout(speedTimer);
        speedTimer = setTimeout(() => marqueeAnimations.forEach(animation => animation.updatePlaybackRate(1)), 180);
      };
      window.addEventListener('scroll', track, { passive: true, signal }); track();
      if (matchMedia('(hover: hover) and (pointer: fine)').matches && cursor.current) {
        const el = cursor.current;
        const x = gsap.quickTo(el, 'x', { duration: .32, ease: 'power3' });
        const y = gsap.quickTo(el, 'y', { duration: .32, ease: 'power3' });
        document.addEventListener('pointermove', e => { x(e.clientX); y(e.clientY); el.style.opacity = '1'; const product = (e.target as Element).closest('[data-product-image]'); el.classList.toggle('cursor-product', !!product); el.textContent = product ? 'СМОТРЕТЬ' : ''; }, { passive: true, signal });
        document.addEventListener('pointerleave', () => { el.style.opacity = '0'; }, { signal });
        magneticElements.forEach(button => {
          button.addEventListener('pointermove', e => { const r = button.getBoundingClientRect(); gsap.to(button, { x: (e.clientX - r.left - r.width / 2) * .08, y: (e.clientY - r.top - r.height / 2) * .12, duration: .3, overwrite: true }); }, { signal });
          button.addEventListener('pointerleave', () => gsap.to(button, { x: 0, y: 0, duration: .55, ease: 'elastic.out(1,.45)' }), { signal });
        });
      }
      const observer = new ResizeObserver(() => ScrollTrigger.refresh());
      const main = document.querySelector('main'); if (main) observer.observe(main);
      dispose = () => { controller.abort(); observer.disconnect(); ctx.revert(); magneticElements.forEach(button => { gsap.killTweensOf(button); gsap.set(button, { clearProps: 'transform' }); }); if (speedTimer) clearTimeout(speedTimer); marqueeAnimations.forEach(animation => { try { animation.updatePlaybackRate(1); } catch {} }); if (cursor.current) { gsap.killTweensOf(cursor.current); cursor.current.style.opacity = '0'; } };
    }
    setup();
    const changed = () => { canceled = true; dispose(); };
    reduced.addEventListener('change', changed);
    return () => { canceled = true; dispose(); reduced.removeEventListener('change', changed); };
  }, [path, catalog.products.length, reducedMotion]);
  return <><div ref={progress} className="scroll-progress" /><div ref={cursor} className="custom-cursor" aria-hidden="true" />{intro && <div className="preloader" aria-hidden="true"><i /><i /><Logo white /></div>}</>;
}
