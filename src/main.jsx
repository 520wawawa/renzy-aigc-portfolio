import { StrictMode, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { gsap } from 'gsap'
import SmoothCursor from './SmoothCursor'
import './styles.css'

const assetBase = import.meta.env.BASE_URL

const defaultProjects = [
  { id: '01', title: '雨夜余生', category: '剧情短片', video: `${assetBase}videos/works/01.mp4` },
  { id: '02', title: '千金大小姐的深夜破产', category: '剧情短片', video: `${assetBase}videos/works/02.mp4` },
  { id: '03', title: '第一集 · 王天硕', category: '学生作品', video: `${assetBase}videos/works/03.mp4` },
  { id: '04', title: '第二集 · 罗婕', category: '学生作品', video: `${assetBase}videos/works/04.mp4` },
  { id: '05', title: '宝矿力', category: '品牌与宣传', video: `${assetBase}videos/works/05.mp4` },
  { id: '06', title: '文化类宣传片', category: '品牌与宣传', video: `${assetBase}videos/works/06.mp4` },
  { id: '07', title: '电商营销', category: '电商营销', video: `${assetBase}videos/works/07.mp4` },
  { id: '08', title: '电影创意', category: '影视创意', video: `${assetBase}videos/works/08.mp4` },
  { id: '09', title: '游戏打斗', category: '游戏与互动', video: `${assetBase}videos/works/09.mp4` },
  { id: '10', title: '草船借箭', category: '历史国风', video: `${assetBase}videos/works/10.mp4` },
]

const services = [
  ['AIGC 导演', '以创意提案、AI 视觉设定和分镜节奏为起点，让概念形成可执行的影像方案。', '服务包含：创意方向 · 视觉设定 · 分镜设计', 7],
  ['短视频创作', '围绕开场钩子、信息节奏与视觉记忆点，把内容组织成更易被观看和传播的短视频。', '服务包含：选题设计 · 脚本节奏 · 后期表达', 0],
  ['课程研发', '将复杂工具拆成案例任务、课堂路径和成果验收，让学习者知道每一步如何完成。', '服务包含：课程大纲 · 项目案例 · 作业标准', 2],
  ['创意教学', '用真实项目式练习连接技能与作品集，帮助学习者把“会工具”变成“能创作”。', '服务包含：课堂辅导 · 作品集 · 个性化反馈', 3],
]

const experience = [
  ['视觉设计与叙事', '95%'],
  ['视频剪辑与后期', '90%'],
  ['AIGC 创意工作流', '88%'],
  ['课程研发与教学', '92%'],
]

const strengths = [
  ['CORE', '生成式影像与短视频创作', ['创意脚本与分镜', 'AI 生成与多模态制作', '后期剪辑与成片交付']],
  ['CORE', 'AIGC 商业项目实战能力', ['项目策略拆解', 'AI 工作流落地', '多渠道内容生产']],
  ['SYSTEM', '课程研发与实战教学', ['课程体系搭建', '案例任务设计', '教学成果验收']],
  ['SYSTEM', '设计、动画与视频复合能力', ['需求洞察与提案', '视觉叙事设计', '项目执行复盘']],
  ['SYSTEM', '课程营销与转化复盘能力', ['招生内容策划', '课程卖点包装', '转化数据复盘']],
]

const personalWorks = [
  { category: 'AI VIDEO', title: 'AI 视频案例', detail: 'TVC 视频 / 产品视频 / 短剧视频', image: 'ai-video-examples.png', width: 937, height: 1678, link: 'https://anmaai.cn/video.html' },
  { category: 'AIGC DESIGN', title: 'AIGC 课程案例', detail: '课程视觉 / AIGC 创作 / 教学案例', image: 'aigc-design-examples.png', width: 934, height: 1684 },
  { category: 'FEED VIDEO', title: '信息流视频案例', detail: '投放视频 / 宣传视频 / 营销视频', image: 'feed-video-examples.png', width: 963, height: 1633 },
]

const defaultContent = {
  heroTop: 'AIGC DIRECTOR / EDUCATOR',
  heroSubMain: '让生成式创意',
  heroSubAccent: '成为有力的影像表达。',
  heroIntro: '任正阳，AIGC 导演与讲师。以视觉叙事、短视频创作和实战教学，让灵感被看见、被理解、被交付。',
  aboutText: '从设计、动画到视频创作与教学，我一直在不同媒介中寻找同一件事：如何让想法被清晰、有感染力地表达出来。现在，我把这一经验带入 AIGC 影像与创意教育。',
  footerTitle: '一起把好想法，做成好作品。',
  email: '625209860@qq.com',
  phone: '185 0112 4810',
  city: '北京，中国',
}

function loadSavedContent() {
  try { return { ...defaultContent, ...JSON.parse(localStorage.getItem('rzy-portfolio-content-v2') || '{}') } } catch { return defaultContent }
}

function loadSavedWorks() {
  try {
    const savedWorks = JSON.parse(localStorage.getItem('rzy-portfolio-works-v2') || 'null')
    if (!Array.isArray(savedWorks)) return defaultProjects
    return defaultProjects.map((project) => {
      const savedWork = savedWorks.find((work) => work.id === project.id)
      return savedWork ? { ...project, title: savedWork.title || project.title, category: savedWork.category || project.category, cover: savedWork.cover || '' } : project
    })
  } catch { return defaultProjects }
}

function Arrow() { return <span className="arrow" aria-hidden="true">↗</span> }

function StillVideo({ project, className = '', frameAt = 1, priority = false }) {
  const videoRef = useRef(null)
  const [shouldLoad, setShouldLoad] = useState(priority)
  useEffect(() => {
    if (!project.video || priority) { setShouldLoad(Boolean(project.video)); return undefined }
    const video = videoRef.current
    if (!video) return undefined
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setShouldLoad(true)
      observer.disconnect()
    }, { rootMargin: '550px 0px' })
    observer.observe(video)
    return () => observer.disconnect()
  }, [priority, project.video])

  if (project.cover) return <img className={`still-media ${className}`} src={project.cover} alt="" decoding="async" loading={priority ? 'eager' : 'lazy'} aria-hidden="true" />
  if (!project.video) return <div className={`empty-media ${className}`} aria-hidden="true">等待上传视频</div>
  const revealFrame = (event) => { const video = event.currentTarget; if (video.currentTime === 0) video.currentTime = Math.min(frameAt, Math.max(.05, video.duration - .05)) }
  return <video ref={videoRef} className={className} muted playsInline preload={shouldLoad ? 'metadata' : 'none'} onLoadedMetadata={revealFrame} aria-hidden="true">{shouldLoad && <source src={project.video} type="video/mp4" />}</video>
}

function VideoModal({ project, onClose }) {
  const playerRef = useRef(null)
  const startWithSound = () => {
    const player = playerRef.current
    if (!player) return
    player.muted = false
    player.defaultMuted = false
    player.volume = 1
    player.play().catch(() => {})
  }
  useLayoutEffect(() => { startWithSound() }, [])
  return <div className="video-modal" role="dialog" aria-modal="true" aria-label={`${project.title} 视频播放`}>
    <button className="modal-close" type="button" onClick={onClose} aria-label="关闭视频">×</button>
    <div className="modal-content" onClick={(event) => event.stopPropagation()}>
      <div className="modal-meta"><span>{project.id} / {project.category}</span><span>声音已开启</span></div>
      <video ref={playerRef} className="modal-player" controls playsInline preload="auto" onCanPlay={startWithSound}><source src={project.video} type="video/mp4" /></video>
      <p>{project.title}</p>
    </div>
  </div>
}

function WorkCard({ project, index, onPlay }) {
  const cardContent = <><span className="work-card-parallax" style={{ '--card-depth': (index % 3) + 1 }}><StillVideo project={project} className="work-card-media" priority={index < 3} /></span><span className="work-card-index">{project.id}</span>{project.video && <span className="play-mark">▶</span>}<span className="work-card-info"><small>{project.category}</small><strong>{project.title}</strong></span></>
  if (!project.video) return <article className="work-card placeholder-card" data-motion-card aria-label={`${project.title} 上传区域`}>{cardContent}</article>
  return <button className="work-card" data-motion-card type="button" onClick={() => onPlay(project)} aria-label={`播放 ${project.title}`}>{cardContent}</button>
}

function WorkCarousel({ works, onPlay }) {
  const carouselWorks = [...works, ...works]
  return <div className="works-carousel-shell"><div className="works-carousel"><div className="work-grid carousel-track">{carouselWorks.map((project, index) => <WorkCard key={`${project.id}-${index}`} project={project} index={index} onPlay={onPlay} />)}</div></div></div>
}

function Editor({ content, setContent, works, setWorks, heroImage, setHeroImage, onClose }) {
  const updateContent = (key, value) => setContent((previous) => ({ ...previous, [key]: value }))
  const updateWork = (index, key, value) => setWorks((previous) => previous.map((work, workIndex) => workIndex === index ? { ...work, [key]: value } : work))
  const uploadWorkFile = (index, key, file) => { if (file) updateWork(index, key, URL.createObjectURL(file)) }
  const addWork = () => setWorks((previous) => [...previous, { id: String(previous.length + 1).padStart(2, '0'), title: '新作品标题', category: '新增视频', video: '', cover: '' }])

  return <aside className="site-editor" aria-label="网页修改器">
    <div className="editor-header"><div><p className="micro-label">WEB EDITOR</p><h2>网页修改器</h2></div><button type="button" onClick={onClose} aria-label="关闭修改器">×</button></div>
    <p className="editor-tip">文字会保存到当前浏览器。本地上传的图片与视频仅在当前预览会话生效。</p>
    <section><h3>首屏文字</h3>
      <label>身份标签<input value={content.heroTop} onChange={(event) => updateContent('heroTop', event.target.value)} /></label>
      <label>主标题说明<textarea value={content.heroSubMain} onChange={(event) => updateContent('heroSubMain', event.target.value)} /></label>
      <label>红色强调文字<textarea value={content.heroSubAccent} onChange={(event) => updateContent('heroSubAccent', event.target.value)} /></label>
      <label>介绍文字<textarea value={content.heroIntro} onChange={(event) => updateContent('heroIntro', event.target.value)} /></label>
      <label>首屏图片<input type="file" accept="image/*" onChange={(event) => event.target.files?.[0] && setHeroImage(URL.createObjectURL(event.target.files[0]))} /></label>
    </section>
    <section><h3>联系与关于</h3>
      <label>关于文字<textarea value={content.aboutText} onChange={(event) => updateContent('aboutText', event.target.value)} /></label>
      <label>合作大标题<textarea value={content.footerTitle} onChange={(event) => updateContent('footerTitle', event.target.value)} /></label>
      <label>联系邮箱<input type="email" value={content.email} onChange={(event) => updateContent('email', event.target.value)} /></label>
      <label>联系电话<input value={content.phone} onChange={(event) => updateContent('phone', event.target.value)} /></label>
      <label>所在地<input value={content.city} onChange={(event) => updateContent('city', event.target.value)} /></label>
    </section>
    <section><div className="editor-section-title"><h3>视频模块 ({works.length})</h3><button type="button" onClick={addWork}>+ 增加视频</button></div>
      {works.map((work, index) => <details key={`${work.id}-${index}`}><summary>{work.id} · {work.title || '未命名视频'}</summary><div className="work-editor-fields">
        <label>视频标题<input value={work.title} onChange={(event) => updateWork(index, 'title', event.target.value)} /></label>
        <label>视频分类<input value={work.category} onChange={(event) => updateWork(index, 'category', event.target.value)} /></label>
        <label>替换视频<input type="file" accept="video/*" onChange={(event) => uploadWorkFile(index, 'video', event.target.files?.[0])} /></label>
        <label>上传封面图片<input type="file" accept="image/*" onChange={(event) => uploadWorkFile(index, 'cover', event.target.files?.[0])} /></label>
        {work.cover && <button className="clear-cover" type="button" onClick={() => updateWork(index, 'cover', '')}>恢复视频首帧</button>}
      </div></details>)}
    </section>
  </aside>
}

function App() {
  const [activeProject, setActiveProject] = useState(null)
  const [activePersonalWork, setActivePersonalWork] = useState(0)
  const [editorOpen, setEditorOpen] = useState(false)
  const [content, setContent] = useState(loadSavedContent)
  const [works, setWorks] = useState(loadSavedWorks)
  const [heroImage, setHeroImage] = useState(null)
  const heroVideoRef = useRef(null)
  const profileTagMotionRef = useRef({ x: 0, y: 0 })
  const handleProfilePortraitEnter = (event) => {
    if (event.pointerType !== 'mouse') return
    profileTagMotionRef.current = { x: event.clientX, y: event.clientY }
    event.currentTarget.dataset.tagActive = 'true'
  }
  const handleProfilePortraitMove = (event) => {
    if (event.pointerType !== 'mouse') return
    const portrait = event.currentTarget
    const bounds = portrait.getBoundingClientRect()
    const previous = profileTagMotionRef.current
    const dx = event.clientX - previous.x
    const dy = event.clientY - previous.y
    const direction = Math.atan2(dy, dx)
    const tilt = Math.max(-12, Math.min(12, Math.sin(direction) * 9 + Math.cos(direction) * 5))
    portrait.style.setProperty('--profile-tag-x', `${Math.max(82, Math.min(bounds.width - 82, event.clientX - bounds.left))}px`)
    portrait.style.setProperty('--profile-tag-y', `${Math.max(34, Math.min(bounds.height - 34, event.clientY - bounds.top))}px`)
    portrait.style.setProperty('--profile-tag-rotate', `${tilt}deg`)
    profileTagMotionRef.current = { x: event.clientX, y: event.clientY }
  }
  const handleProfilePortraitLeave = (event) => { event.currentTarget.dataset.tagActive = 'false' }
  const openProject = (project) => {
    setActiveProject(project)
  }
  useEffect(() => { localStorage.setItem('rzy-portfolio-content-v2', JSON.stringify(content)) }, [content])
  useEffect(() => {
    const saveableWorks = works.map(({ cover, video, ...work }) => ({ ...work, video: video?.startsWith('blob:') ? '' : video, cover: '' }))
    localStorage.setItem('rzy-portfolio-works-v2', JSON.stringify(saveableWorks))
  }, [works])
  useEffect(() => {
    const video = heroVideoRef.current
    if (!video) return undefined
    const syncHeroVideo = () => {
      if (document.hidden) { video.pause(); return }
      if (window.scrollY <= 12) {
        video.loop = true
        if (video.currentTime > 0.1) video.currentTime = 0
        video.play().catch(() => {})
        return
      }
      video.pause()
      if (Number.isFinite(video.duration) && video.duration > 0) video.currentTime = Math.max(0, video.duration - 0.08)
    }
    video.addEventListener('loadedmetadata', syncHeroVideo)
    window.addEventListener('scroll', syncHeroVideo, { passive: true })
    document.addEventListener('visibilitychange', syncHeroVideo)
    syncHeroVideo()
    return () => {
      video.removeEventListener('loadedmetadata', syncHeroVideo)
      window.removeEventListener('scroll', syncHeroVideo)
      document.removeEventListener('visibilitychange', syncHeroVideo)
    }
  }, [])
  useLayoutEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    if (isReduced || isMobile) return undefined

    const hoverCleanups = []
    const context = gsap.context(() => {
      const header = document.querySelector('.site-header')
      const heroSub = document.querySelector('.hero-copy h2')
      const heroIntro = document.querySelector('.hero-intro')
      const heroActions = document.querySelector('.hero-actions')
      const heroVideo = document.querySelector('.hero-background-video')

      gsap.set([heroSub, heroIntro], { y: 38, autoAlpha: 0 })
      gsap.set(heroActions, { x: -60, autoAlpha: 0 })
      gsap.set(header, { y: -42, autoAlpha: 0 })
      gsap.set(heroVideo, { autoAlpha: 0 })

      gsap.timeline()
        .to(heroVideo, { autoAlpha: 1, duration: 1, ease: 'power2.out' })
        .to([heroSub, heroIntro], { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }, '-=0.35')
        .to(heroActions, { x: 0, autoAlpha: 1, duration: 0.85, ease: 'power3.out' }, '-=0.45')
        .to(header, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out' }, '-=0.3')

      document.querySelectorAll('.work-card:not(.placeholder-card)').forEach((card) => {
        const media = card.querySelector('.work-card-media')
        if (!media) return
        const xTo = gsap.quickTo(media, 'x', { duration: 0.65, ease: 'power3.out' })
        const yTo = gsap.quickTo(media, 'y', { duration: 0.65, ease: 'power3.out' })
        const move = (event) => {
          const bounds = card.getBoundingClientRect()
          xTo(((event.clientX - bounds.left) / bounds.width - 0.5) * 12)
          yTo(((event.clientY - bounds.top) / bounds.height - 0.5) * 10)
        }
        const leave = () => { xTo(0); yTo(0) }
        card.addEventListener('pointermove', move)
        card.addEventListener('pointerleave', leave)
        hoverCleanups.push(() => {
          card.removeEventListener('pointermove', move)
          card.removeEventListener('pointerleave', leave)
        })
      })
    })

    return () => { hoverCleanups.forEach((cleanup) => cleanup()); context.revert() }
  }, [])
  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    if (isReduced || isMobile) return undefined

    let disposed = false
    let context
    import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
      if (disposed) return
      gsap.registerPlugin(ScrollTrigger)
      ScrollTrigger.config({ limitCallbacks: true, syncInterval: 200 })
      context = gsap.context(() => {
        const header = document.querySelector('.site-header')
        ScrollTrigger.create({
          trigger: '.hero',
          start: 'bottom top+=84',
          onEnter: () => header?.classList.add('is-scrolled'),
          onLeaveBack: () => header?.classList.remove('is-scrolled'),
        })

        document.querySelectorAll('[data-motion-section]').forEach((section) => {
          const title = section.querySelector('[data-motion-title]')
          const cards = section.querySelectorAll('[data-motion-card]')
          const images = section.querySelectorAll('[data-reveal-image]')
          const trigger = () => ({ trigger: section, start: 'top 72%', once: true })

          if (title) gsap.from(title, { y: 130, clipPath: 'inset(0 0 100% 0)', letterSpacing: '0.09em', duration: 1.1, ease: 'expo.out', scrollTrigger: trigger() })
          if (cards.length) gsap.from(cards, { y: 68, rotateX: 5, autoAlpha: 0, transformPerspective: 900, duration: 0.9, stagger: 0.07, ease: 'power3.out', scrollTrigger: trigger() })
          if (images.length) {
            gsap.from(images, { clipPath: 'inset(0 100% 0 0)', scale: 1.1, duration: 1.05, stagger: 0.12, ease: 'power3.out', scrollTrigger: trigger() })
            images.forEach((image, index) => gsap.to(image, { yPercent: index % 2 ? 4 : -4, ease: 'none', scrollTrigger: { trigger: image.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.8 } }))
          }
        })
      })
    })

    return () => { disposed = true; context?.revert() }
  }, [])
  useEffect(() => {
    const canvas = document.querySelector('.ambient-particles')
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    if (!canvas || isReduced || isMobile) return undefined
    const context = canvas.getContext('2d', { alpha: true })
    if (!context) return undefined
    let frame = 0
    let resizeFrame = 0
    let lastDraw = 0
    let active = !document.hidden
    let particles = []
    const draw = (now) => {
      if (!active) return
      if (now - lastDraw >= 33) {
        lastDraw = now
        context.clearRect(0, 0, canvas.width, canvas.height)
        particles.forEach((particle) => {
          particle.x += particle.vx
          particle.y += particle.vy
          if (particle.x < 0 || particle.x > canvas.width || particle.y < 0 || particle.y > canvas.height) Object.assign(particle, { x: Math.random() * canvas.width, y: Math.random() * canvas.height })
          context.fillStyle = `rgba(255,255,255,${particle.alpha})`
          context.fillRect(particle.x, particle.y, particle.size, particle.size)
        })
      }
      frame = window.requestAnimationFrame(draw)
    }
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      const box = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.round(box.width * ratio))
      canvas.height = Math.max(1, Math.round(box.height * ratio))
      context.setTransform(1, 0, 0, 1, 0, 0)
      particles = Array.from({ length: 64 }, () => ({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18, alpha: Math.random() * 0.32 + 0.08, size: Math.random() * 2 + 0.5 }))
    }
    const queueResize = () => {
      window.cancelAnimationFrame(resizeFrame)
      resizeFrame = window.requestAnimationFrame(() => { resizeFrame = 0; resize() })
    }
    const visibility = () => {
      active = !document.hidden
      lastDraw = 0
      if (active && !frame) frame = window.requestAnimationFrame(draw)
      if (!active) { window.cancelAnimationFrame(frame); frame = 0 }
    }
    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(queueResize)
    resize()
    frame = window.requestAnimationFrame(draw)
    resizeObserver?.observe(canvas)
    window.addEventListener('resize', queueResize)
    document.addEventListener('visibilitychange', visibility)
    return () => { window.cancelAnimationFrame(frame); window.cancelAnimationFrame(resizeFrame); resizeObserver?.disconnect(); window.removeEventListener('resize', queueResize); document.removeEventListener('visibilitychange', visibility) }
  }, [])
  return <main>
    <header className="site-header page-width">
      <a className="brand" href="#top">R<span>.</span></a>
      <nav aria-label="主导航"><a href="#works">作品</a><a href="#services">服务</a><a href="#about">关于</a><a href="#experience">经历</a><a href="#contact">联系</a></nav>
      <div className="header-actions"><button className="editor-button" type="button" onClick={() => setEditorOpen(true)}>网页修改器</button><a className="talk-button" href="#contact"><span>开始合作</span><Arrow /></a></div>
    </header>
    <section className="hero page-width" id="top">
      <video ref={heroVideoRef} className="hero-background-video" autoPlay muted loop playsInline preload="auto" aria-hidden="true"><source src={`${assetBase}videos/hero-video-node-1.mp4`} type="video/mp4" /></video>
      <canvas className="ambient-particles" aria-hidden="true" />
      <div className="hero-copy"><p className="micro-label">{content.heroTop}</p><div className="hero-lower-copy"><h2>{content.heroSubMain}，<em>{content.heroSubAccent}</em></h2><p className="hero-intro">{content.heroIntro}</p><div className="hero-actions"><a className="oval-link" href="#works"><span>查看作品</span><i>↓</i></a><a className="resume-button" href={`${assetBase}renzy-resume.pdf`} download>下载简历 <Arrow /></a></div></div></div>
      <div className="hero-media">{heroImage && <img className="hero-upload hero-portrait" src={heroImage} width="936" height="1681" alt="任正阳个人形象" />}</div>
    </section>
    <section className="scoreboard page-width" aria-label="个人数据"><div><strong>8+</strong><span>年教培行业<br />经验</span></div><div><strong>4000+</strong><span>小时累计<br />授课</span></div><div><strong>4.9/5</strong><span>课程与学员<br />满意度</span></div><div><strong>34%</strong><span>公开课平均<br />转化率</span></div></section>
    <section className="profile page-width" id="profile" data-motion-section>
      <div className="profile-heading"><p className="micro-label">WORK EXPERIENCE</p><h2 data-motion-title>个人经历 <Arrow /></h2></div>
      <div className="profile-overview">
        <div className="profile-portrait" data-motion-card onPointerEnter={handleProfilePortraitEnter} onPointerMove={handleProfilePortraitMove} onPointerLeave={handleProfilePortraitLeave}><img data-reveal-image src={`${assetBase}images/renzy-cartoon-profile-v4.png`} width="1024" height="1536" loading="lazy" decoding="async" alt="任正阳卡通形象" /><div className="profile-hover-tag" aria-hidden="true"><strong>10 YEARS</strong><span>AI DESIGNER · RZY</span></div></div>
        <div className="profile-copy" data-motion-card>
          <p className="micro-label">ABOUT ME</p><h3>Hi, I am 任正阳</h3>
          <p className="profile-intro">8 年 IT 教培行业经验，累计授课 4000+ 小时，培训线下及线上学生近万人。长期从事 UI、平面、剪辑与 AIGC 创意教学，把设计与影像项目转化为可执行的课程、案例和作品。</p>
          <div className="profile-details"><div><span>当前身份</span><strong>AIGC 导演 / 讲师</strong></div><div><span>服务方向</span><strong>AIGC 创意 / 视频剪辑 / 课程研发</strong></div><div><span>联系电话</span><a href={`tel:+8618501124810`}>{content.phone}</a></div><div><span>邮箱</span><a href={`mailto:${content.email}`}>{content.email}</a></div></div>
          <div className="profile-stats"><div><strong>8<em>年+</em></strong><span>教培行业经验</span></div><div><strong>4000<em>+</em></strong><span>累计授课小时</span></div><div><strong>4.9<em>/5</em></strong><span>课程与学员满意度</span></div></div>
          <div className="profile-tags"><span>UI / 平面课程</span><span>视频剪辑与后期</span><span>课程体系研发</span><span>学生作品集辅导</span></div>
        </div>
      </div>
      <div className="career-path" data-motion-card><div className="career-heading"><p className="micro-label">CAREER PATH</p><span>工作经历</span></div><div className="career-grid"><article><time>2019.03 — 至今</time><h3>北大青鸟佳音校区</h3><b>视频剪辑讲师</b><p>负责 C4D 宣传片、AE 后期、PS、UI 与就业课程授课，并参与课程体系、案例与教学物料研发。</p></article><article><time>2016.08 — 2018.10</time><h3>北京财经专修学院</h3><b>UI 讲师 / 美术老师</b><p>负责设计基础、平面设计、UI 设计与电商设计课程，并参与 V6.0 课程体系研发。</p></article><article><time>2014 — 2016</time><h3>学科网</h3><b>平面 / UI / 网页设计</b><p>负责“小博士”IP、专题页、网页活动与“校园通”“家长通”APP 的视觉设计和维护。</p></article><article><time>2011 — 2014</time><h3>国家汉语国际推广领导小组办公室</h3><b>平面设计 / 美术编辑</b><p>参与汉语教材、绘本、插画、动画包装及图书与展会视觉物料设计。</p></article></div></div>
    </section>
    <section className="works page-width" id="works" data-motion-section>
      <div className="section-heading"><div><p className="micro-label">SELECTED WORK</p><h2 data-motion-title>精选作品</h2></div><p>点击任意画面，<br />进入带声音的放大播放。</p><span>{works.length} VIDEOS</span></div>
      <WorkCarousel works={works} onPlay={openProject} />
    </section>
    <section className="personal-works page-width" data-motion-section aria-labelledby="personal-works-title">
      <div className="personal-works-heading"><p className="micro-label">PERSONAL WORKS</p><h2 id="personal-works-title" data-motion-title>个人作品 <Arrow /></h2></div>
      <div className="personal-works-grid">{personalWorks.map((work, index) => {
        const isActive = activePersonalWork === index
        return <button type="button" className={`personal-work${isActive ? ' is-active' : ''}`} data-motion-card aria-pressed={isActive} onClick={(event) => {
          if (work.link && event.target.closest('.personal-work-image')) {
            window.location.assign(work.link)
            return
          }
          setActivePersonalWork(index)
        }} key={work.title}>
          <span className="personal-work-image"><img data-reveal-image src={`${assetBase}images/personal-works/${work.image}`} width={work.width} height={work.height} loading="lazy" decoding="async" alt={work.title} /></span>
          <span className="personal-work-copy"><small>{work.category}</small><strong>{work.title}<Arrow /></strong><em>{work.detail}</em></span>
        </button>
      })}</div>
    </section>
    <section className="strengths page-width" data-motion-section aria-labelledby="strengths-title">
      <div className="strengths-heading"><p className="micro-label">PERSONAL STRENGTHS</p><h2 id="strengths-title" data-motion-title>个人优势 <Arrow /></h2></div>
      <div className="strengths-grid">{strengths.map(([type, title, tags], index) => {
        return <article className={`strength-card strength-card-${index + 1}`} data-motion-card key={title}><div><span>0{index + 1}</span><small>{type}</small></div><h3>{title}<b>·</b></h3><p className="strength-card-tags">{tags.map((tag) => <span key={tag}>{tag}</span>)}</p><i aria-hidden="true" /></article>
      })}</div>
    </section>
    <section className="service-section page-width" id="services" data-motion-section><div className="service-title service-title--full-portrait"><img data-reveal-image src={`${assetBase}images/renzy-service-portrait-full.png`} width="1024" height="1536" loading="lazy" decoding="async" alt="任正阳完整照片" /></div><div className="service-list">{services.map(([name, desc, detail, imageIndex], index) => <article data-motion-card key={name}><span>0{index + 1}</span><div><h3>{name}</h3><p>{desc}</p><small>{detail}</small></div><StillVideo className="service-still" project={defaultProjects[imageIndex]} /><Arrow /></article>)}</div></section>
    <section className="about page-width" id="about" data-motion-section><div className="about-copy"><p className="micro-label">ABOUT ME</p><h2 data-motion-title>创意不只是<br />好看，而是<strong>解决问题。</strong></h2><p data-motion-card>{content.aboutText}</p><span className="signature" data-motion-card>REN ZHENGYANG</span></div><div className="about-visual" data-motion-card><div className="monogram">RZY</div><div className="red-square" /></div><div className="skill-bars" id="experience"><p className="micro-label">EXPERIENCE</p>{experience.map(([label, percentage]) => <div className="skill-row" data-motion-card key={label}><div><span>{label}</span><strong>{percentage}</strong></div><i><b style={{ width: percentage }} /></i></div>)}<a data-motion-card href={`mailto:${content.email}`}>获取合作资料 <Arrow /></a></div></section>
    <footer className="footer page-width" id="contact" data-motion-section><div className="footer-cta"><p>LET'S CREATE</p><h2 data-motion-title>{content.footerTitle.replace(/\\n|\n/g, '，')}</h2><a href={`mailto:${content.email}`}><Arrow /></a></div><div className="footer-info" data-motion-card><div><span>联系邮箱</span><a href={`mailto:${content.email}`}>{content.email}</a></div><div className="phone-contact"><span>联系电话</span><a href={`tel:+8618501124810`}>{content.phone}</a></div><div><span>所在地</span><p>{content.city}</p></div></div><div className="footer-bottom" data-motion-card><span>© 2026 REN ZHENGYANG</span><a href="#top">回到顶部 ↑</a></div></footer>
    {activeProject && <VideoModal project={activeProject} onClose={() => setActiveProject(null)} />}
    {editorOpen && <Editor content={content} setContent={setContent} works={works} setWorks={setWorks} heroImage={heroImage} setHeroImage={setHeroImage} onClose={() => setEditorOpen(false)} />}
  </main>
}

const rootElement = document.getElementById('root')
const appRoot = rootElement.__portfolioRoot || (rootElement.__portfolioRoot = createRoot(rootElement))
appRoot.render(<StrictMode><App /><SmoothCursor /></StrictMode>)
