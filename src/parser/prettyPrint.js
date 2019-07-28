const chalk = process.env.NODE_ENV === 'development' ? require('chalk') : null

export default function printTree(node, prefix = '', keepBranch = false) {
  if (process.env.NODE_ENV !== 'development') return

  const INDENT = 4
  const SPACING = 1
  const VERTICAL = '│'
  const HORIZONTAL = '─'
  const BRANCH = '├'
  const END = '└'

  const wrapObj = objStr =>
    objStr
      .replace(/\{/g, '{\n')
      .replace(/\}/g, '\n}')
      .replace(/,\s/g, ',\n')

  const indentObj = objStr => {
    const lines = objStr.split('\n')
    let lvl = 0
    for (const i in lines) {
      if (lines[i].includes('}')) lvl--
      lines[i] = ' '.repeat(lvl * 2) + lines[i]
      if (lines[i].includes('{')) lvl++
    }
    return lines.join('\n')
  }

  const colorData = objStr =>
    objStr
      .replace(/<!\[CDATA\[.*\]\]>/s, chalk.yellow`$&`)
      .replace(/([,{\n\s]+)([\w:]+):\s/g, chalk`$1{rgb(179, 101, 106) $2}: `)
      .replace(/(\s*)("(?:[^"])+")/g, chalk`$1{greenBright $2}`)

  const renderData = (data = node.data, wrapped = false) => {
    if (typeof data === 'object' && !Array.isArray(data))
      data = Object.fromEntries(
        Object.keys(data)
          .filter(key => !['prefix', 'local', 'uri'].includes(key))
          .map(key => [key, data[key]])
      )

    if (typeof data === 'number') return data
    if (typeof data === 'string')
      return !data.includes('CDATA') ? `"${data}"` : data
    if (typeof data === 'object' && Array.isArray(data)) {
      return `[${data.map(item => renderData(item)).join(', ')}]`
    }
    if (typeof data === 'object') {
      return (!wrapped ? obj => indentObj(wrapObj(obj)) : obj => obj)(
        `{${Object.keys(data)
          .map(key => key + ': ' + renderData(data[key], true))
          .join(', ')}}`
      )
    }
  }

  const wrap = lines => {
    lines.forEach((line, i, arr) => arr.splice(i, 1, ...line.split('\n')))

    const startIndent =
      (prefix.length ? prefix.length + INDENT : 0) +
      (node.name ? node.name.length : 1) +
      (node.name ? 3 : 1)
    const width = process.stdout.columns
    for (const line of lines) {
      const i = startIndent + line.length - (width - 1)
      if (i > 0)
        lines[lines.indexOf(line)] = [
          line.slice(0, line.length - i),
          '\n' + line.slice(line.length - i),
        ].join('')
    }
    return lines.some(line => line.search('\n') > -1) ? wrap(lines) : lines
  }
  const dataLines = node.data
    ? colorData(wrap(renderData().split('\n')).join('\n')).split('\n')
    : null
  const dataPrefixed = dataLines
    ? dataLines
      .map((line, i) =>
        i === 0
          ? line
          : chalk.grey(prefix.replace(END, ' ')) +
              ' '.repeat(
                (node.name ? 3 : 1) +
                  (node.name || '◯').length +
                  (prefix.length ? INDENT : 0)
              ) +
              line
      )
      .join('\n')
    : ''

  let name = '◯'
  if (node.name) {
    name = node.name
    if (name.search(':') !== -1)
      name = name.split(':')[0] + ':' + chalk.bold(name.split(':')[1])
    else name = chalk.bold(name)
  }
  console.log(
    `${chalk.gray(
      prefix
        ? Array(SPACING + 1)
          .fill(prefix)
          .map((e, i, arr) =>
            i < arr.length - 1
              ? e.replace(END, VERTICAL)
              : keepBranch
                ? e.slice(0, -1) + BRANCH
                : e
          )
          .join('\n') + HORIZONTAL.repeat(INDENT)
        : ''
    )}${name} ${node.data ? (node.name ? '📦 ' : '') + dataPrefixed : ''}`
  )
  node._children.forEach(child => {
    const lastChild =
      node._children.indexOf(child) === node._children.length - 1
    printTree(
      child,
      (!prefix ? '' : keepBranch ? prefix : prefix.slice(0, -1) + ' ') +
        ' '.repeat(prefix.length === 0 ? 0 : INDENT) +
        (!lastChild ? VERTICAL : END),
      !lastChild
    )
  })
}
