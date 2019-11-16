import slugify from 'slugify'
import { search } from '../itunes'

const replace = (str: string, exp: RegExp, rep: string) => {
  let newStr = str.replace(exp, rep)
  return newStr === str ? newStr : replace(newStr, exp, rep)
}
const pipe = (...fns: ((v: unknown) => unknown)[]) => (x: unknown) =>
  fns.reduce((v, f) => f(v), x)

const buildRep = (exp: RegExp, rep: string) => (str: string) =>
  replace(str, exp, rep)
const buildSlug = (opt: any) => (v: string) => slugify(v, opt)

export const genSlug = (name: string) =>
  pipe(
    buildSlug({ lower: true, remove: /[']/g }),
    buildRep(/\.+/, '-'),
    buildRep(/([^a-z0-9])-/, '$1'),
    buildRep(/-([^a-z0-9])/, '$1')
  )(name) as string

export const genUnique = async (name: string, id: string) => {
  const slugs = (await search(name)).map(({ podId, name }: any) => ({
    podId,
    slug: genSlug(name),
  }))
  slugs.forEach(slug => console.log(`${slug.podId}: ${slug.slug}`))
  const slug = genSlug(name)
  const hit = slugs.find(({ slug: gSlug }) => gSlug === slug)
  if (!hit || hit.podId.toString() === id) return slug
}
