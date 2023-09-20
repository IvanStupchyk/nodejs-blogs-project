export const errorsConstants = {
  blog: {
    name: 'name should be a string and contains at least 1 but not more than 15 characters',
    description: 'description should be a string and contains at least 1 but not more than 500 characters',
    websiteUrl: 'websiteUrl should be a string and be in URL format'
  },
  post: {
    title: 'title should be a string and contains at least 1 but not more than 30 characters',
    shortDescription: 'shortDescription should be a string and contains at least 1 but not more than 100 characters',
    content: 'content should be a string and contains at least 1 but not more than 1000 characters',
    blogId: 'such blogId must exist and be a string'
  }
}