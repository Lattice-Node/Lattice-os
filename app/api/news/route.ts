import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const RSS_FEEDS = [
  { url: 'https://openai.com/blog/rss.xml', source: 'OpenAI', lang: 'en' },
  { url: 'https://www.anthropic.com/news/rss', source: 'Anthropic', lang: 'en' },
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', source: 'TechCrunch AI', lang: 'en' },
  { url: 'https://feeds.feedburner.com/blogspot/gJZg', source: 'Google AI Blog', lang: 'en' },
  { url: 'https://rss.itmedia.co.jp/rss/2.0/aiplus.xml', source: 'ITmedia AI', lang: 'ja' },
  { url: 'https://gigazine.net/news/rss_2.0/', source: 'Gigazine', lang: 'ja' },
  { url: 'https://ascii.jp/rss.xml', source: 'ASCII.jp', lang: 'ja' },
]

function parseDate(dateStr: string | undefined): Date {
  if (!dateStr) return new Date()
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? new Date() : d
}

function extractText(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim().slice(0, 200)
}

async function fetchRSS(feedUrl: string, source: string, lang: string) {
  try {
    const res = await fetch(feedUrl, {
      headers: { 'User-Agent': 'Lattice News Bot/1.0' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    const xml = await res.text()
    const items: { title: string; url: string; description: string; publishedAt: Date; source: string; lang: string }[] = []
    const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g)
    for (const match of itemMatches) {
      const item = match[1]
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ?? item.match(/<title>(.*?)<\/title>/)?.[1] ?? ''
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] ?? item.match(/<link[^>]*href="([^"]*)"/)?.[1] ?? ''
      const desc = item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] ?? item.match(/<description>([\s\S]*?)<\/description>/)?.[1] ?? ''
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? item.match(/<dc:date>(.*?)<\/dc:date>/)?.[1] ?? ''
      if (title && link) {
        items.push({
          title: extractText(title).slice(0, 200),
          url: link.trim(),
          description: extractText(desc).slice(0, 300),
          publishedAt: parseDate(pubDate),
          source,
          lang,
        })
      }
      if (items.length >= 10) break
    }
    return items
  } catch {
    return []
  }
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  let total = 0
  for (const feed of RSS_FEEDS) {
    const articles = await fetchRSS(feed.url, feed.source, feed.lang)
    for (const article of articles) {
      try {
        await prisma.newsArticle.upsert({
          where: { url: article.url },
          update: {},
          create: article,
        })
        total++
      } catch {}
    }
  }
  return NextResponse.json({ ok: true, total })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lang = searchParams.get('lang') ?? 'ja'
  const articles = await prisma.newsArticle.findMany({
    where: { lang },
    orderBy: { publishedAt: 'desc' },
    take: 50,
  })
  return NextResponse.json({ articles })
}