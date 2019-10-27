import slugify from 'slugify'

const replace = (str: string, exp: RegExp, rep: string) => {
  let newStr = str.replace(exp, rep)
  return newStr === str ? newStr : replace(newStr, exp, rep)
}
const pipe = (...fns: ((v: unknown) => unknown)[]) => (x: unknown) =>
  fns.reduce((v, f) => f(v), x)

const buildRep = (exp: RegExp, rep: string) => (str: string) =>
  replace(str, exp, rep)
const buildSlug = (opt: any) => (v: string) => slugify(v, opt)

export default (name: string) =>
  pipe(
    buildSlug({ lower: true, remove: /[']/g }),
    buildRep(/\.+/, '-'),
    buildRep(/([^a-z0-9])-/, '$1'),
    buildRep(/-([^a-z0-9])/, '$1')
  )(name)
