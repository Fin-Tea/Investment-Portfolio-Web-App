const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function formatDate(date) {
  const d = new Date(date);
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function formatDateShort(date) {
  const d = new Date(date);
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

export function formatDatetime(date) {
  const d = new Date(date);
  return d.toLocaleString();
}
