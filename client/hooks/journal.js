import useData from "./data";
import { appendQueryParam } from "../data-utils";


const JOURNAL_ENTRY_ENDPOINT = "journalEntry";
const JOURNAL_ENTRIES_ENDPOINT = "journalEntries";
const JOURNAL_ITEMS_ENDPOINT = "journalItems";

const journalTags = [
    { label: "Trade Plans", value: 1 },
    { label: "Milestones", value: 2 },
    { label: "Improvement Areas", value: 3 },
    { label: "Finstruments", value: 4 },
    { label: "Reflections", value: 5 },
  ];

export default function useJournal() {
  const { fetchUserData } = useData();

  function fetchJournalEntries(queryParams) {
    // TODO: Accept input for pagintion
    let url = JOURNAL_ENTRIES_ENDPOINT;

    if (queryParams) {
        Object.entries(queryParams).forEach(([k, v]) => {
            url = appendQueryParam(url, k, v);
          });
    }


    return fetchUserData(url);
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
    journalTags,
    createJournalEntry,
    fetchJournalEntries,
    fetchJournalItems,
    fetchJournalEntry,
    updateJournalEntry,
    deleteJournalEntry
  };
}
