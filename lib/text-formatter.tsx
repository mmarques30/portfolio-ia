import React from 'react'

/**
 * Renders text with basic markdown formatting:
 * - **bold** → <strong>
 * - *italic* → <em>
 * - newlines → <br>
 */
export function renderFormattedText(
  text: string,
  style?: React.CSSProperties
): React.ReactNode {
  if (!text) return null

  const lines = text.split('\n')

  return (
    <span style={style}>
      {lines.map((line, lineIdx) => (
        <React.Fragment key={lineIdx}>
          {lineIdx > 0 && <br />}
          {parseLine(line)}
        </React.Fragment>
      ))}
    </span>
  )
}

function parseLine(line: string): React.ReactNode[] {
  const result: React.ReactNode[] = []
  // Match **bold** and *italic* patterns
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = regex.exec(line)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      result.push(line.substring(lastIndex, match.index))
    }

    if (match[2]) {
      // **bold**
      result.push(<strong key={key++}>{match[2]}</strong>)
    } else if (match[3]) {
      // *italic*
      result.push(<em key={key++}>{match[3]}</em>)
    }

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < line.length) {
    result.push(line.substring(lastIndex))
  }

  if (result.length === 0) {
    result.push(line)
  }

  return result
}
