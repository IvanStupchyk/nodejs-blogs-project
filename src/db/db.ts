export type BlogType = {
  id: string,
  name: string
  description: string
  websiteUrl: string
}

export type PostType = {
  id: string
  title: string
  shortDescription: string
  content: string
  blogId: string
  blogName: string
}

export let db: DBType = {
  blogs: [
    {
      id: '444',
      name: 'initial blog',
      description: 'about everything',
      websiteUrl: 'https://buychicken.com'
    }
  ],
  posts: [
    {
      id: '435955',
      title: 'initial post',
      shortDescription: 'complain',
      blogId: '444',
      blogName: 'initial blog',
      content: 'blablabla'
    }
  ]
}

export type DBType = {
  blogs: Array<BlogType>
  posts: Array<PostType>
}


