import useData from "./data";

const JOURNAL_ENTRY_ENDPOINT = "journalEntry";
const JOURNAL_ENTRIES_ENDPOINT = "journalEntries";
const JOURNAL_ITEMS_ENDPOINT = "journalItems";

export default function useJournal() {
  const { fetchUserData } = useData();

  function fetchJournalEntries() {
    // TODO: Accept input for pagintion
    return fetchUserData(JOURNAL_ENTRIES_ENDPOINT);
  }

  function fetchJournalItems() {
    return fetchUserData(JOURNAL_ITEMS_ENDPOINT);
  }

  function fetchJournalEntry(id) {
    return fetchUserData(`${JOURNAL_ENTRY_ENDPOINT}/${id}`);
  }

  function createJournalEntry(journalEntry) {
    return fetchUserData(`${JOURNAL_ENTRY_ENDPOINT}`, "POST", journalEntry);
  }

  function updateJournalEntry(id, journalEntry) {
    return fetchUserData(`${JOURNAL_ENTRY_ENDPOINT}/${id}`, "PUT", journalEntry);
  }

  function deleteJournalEntry(id) {
    return fetchUserData(`${JOURNAL_ENTRY_ENDPOINT}/${id}`, "DELETE");
  }

  return {
    createJournalEntry,
    fetchJournalEntries,
    fetchJournalItems,
    fetchJournalEntry,
    updateJournalEntry,
    deleteJournalEntry
  };
}
