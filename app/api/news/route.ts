import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const RSS_FEEDS = [
  { url: 'https://openai.com/blog/rss.xml', source: 'OpenAI' },
  { url: 'https://www.anthropic.com/news/rss', source: 'Anthropic' },
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', source: 'TechCrunch AI' },
  { url: 'https://feeds.feedburner.com/blogspot/gJZg', source: 'Google AI Blog' },
]

function parseDate(dateStr: string | undefined): Date {
  if (!dateStr) return new Date()
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? new Date() : d
}

function extractText(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim().slice(0, 200)
}

async function fetchRSS(feedUrl: string, source: string) {
  try {
    const res = await fetch(feedUrl, {
      headers: { 'User-Agent': 'Lattice News Bot/1.0' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    const xml = await res.text()

    const items: { title: string; url: string; description: string; publishedAt: Date }[] = []
    const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g)

    for (const match of itemMatches) {
      const item = match[1]
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/)?.[1] ?? item.match(/<title>(.*?)<\/title>/)?.[1] ?? ''
      const link = item.match(/<link>(.*?)<\/link>|<link[^>]*href="([^"]*)"[^>]*\/>/)?.[1] ?? item.match(/<link[^>]*href="([^"]*)"/)?.[1] ?? ''
      const desc = item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description>([\s\S]*?)<\/description>/)?.[1] ?? ''
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>|<dc:date>(.*?)<\/dc:date>/)?.[1] ?? ''

      if (title && link) {
        items.push({
          title: extractText(title).slice(0, 200),
          url: link.trim(),
          description: extractText(desc).slice(0, 300),
          publishedAt: parseDate(pubDate),
        })
      }
      if (items.length >= 10) break
    }
    return items.map(item => ({ ...item, source }))
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
    const articles = await fetchRSS(feed.url, feed.source)
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

export async function GET() {
  const articles = await prisma.newsArticle.findMany({
    orderBy: { publishedAt: 'desc' },
    take: 50,
  })
  return NextResponse.json({ articles })
}