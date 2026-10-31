const fallbackSubject = "Your Shore & Grace enquiry"

export const formatContactReplySubject = (message: string) => {
  const firstLine = message.split(/\r?\n/, 1)[0]?.trim() || ""
  const originalSubject =
    firstLine.match(/^Subject:\s*(.+)$/i)?.[1]?.trim() || fallbackSubject

  return /^Re:/i.test(originalSubject)
    ? originalSubject
    : `Re: ${originalSubject}`
}
