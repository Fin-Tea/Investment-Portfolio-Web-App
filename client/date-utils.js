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

export function formatJournalDate(date) {
  const d = new Date(date);
  let h = d.getHours();
  let m = d.getMinutes();

  const amPM = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (m < 10) {
    m = `0${m}`;
  }

  return `${months[d.getMonth()]}. ${d.getDate()}, ${d.getFullYear()} @ ${h}:${m} ${amPM}`;
}

export function formatDateShort(date) {
  const d = new Date(date);
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

export function formatDatetime(date) {
  const d = new Date(date);
  return d.toLocaleString();
}
