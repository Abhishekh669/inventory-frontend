// decimals arrive from the backend as strings
export const toNumber = (value: string | null | undefined) => Number(value ?? 0)

export const isZero = (value: string | null | undefined) => toNumber(value) === 0

export const formatMoney = (value: string | null | undefined) =>
  toNumber(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

// the backend sends a date column as an ISO timestamp, so only the first 10 chars are used
// (this avoids a timezone shift moving the date by one day)
export const formatDate = (value: string) => {
  const day = new Date(`${value.slice(0, 10)}T00:00:00`)
  return day.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}