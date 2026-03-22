import BlogEditor from '../components/BlogEditor'

export default function NewPostPage() {
  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>新規記事作成</h1>
      <BlogEditor mode="new" />
    </div>
  )
}