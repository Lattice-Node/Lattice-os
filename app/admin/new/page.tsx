import BlogEditor from '../components/BlogEditor'

export default function NewPostPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">新規記事作成</h1>
      <BlogEditor mode="new" />
    </div>
  )
}