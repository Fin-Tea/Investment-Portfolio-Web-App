import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Layout from "../../../components/app/layout";
import SideView from "../../../components/app/side-view";
import SearchBox from "../../../components/app/search-box";
import Pill from "../../../components/app/pill";
import JournalEntry from "../../../components/app/journal-entry";
import JournalEntryModal from "../../../components/app/journal-entry-modal";
import TradePlan from "../../../components/app/journal-forms/trade-plan";
import Milestone from "../../../components/app/journal-forms/milestone";
import ImprovementArea from "../../../components/app/journal-forms/improvement-area";
import Finstrument from "../../../components/app/journal-forms/finstrument";
import Reflection from "../../../components/app/journal-forms/reflection";
import useJournal from "../../../hooks/journal";
import usePlatformAccounts from "../../../hooks/platformAccounts";
import useTrades from "../../../hooks/trades";
import { formatJournalDate } from "../../../date-utils";
import Loader from "../../../components/loader";


const formMap = {
  "Trade Plans": TradePlan,
  Milestones: Milestone,
  "Improvement Areas": ImprovementArea,
  Finstruments: Finstrument,
  Reflections: Reflection,
};

const journalEntryFixtures = [
  {
    id: 1,
    tag: "Finstruments",
    symbol: "NQ",
    createdAt: "2023-12-28T20:37:00Z",
    entryText:
      "The NQ is still overextended at 17000+. Waiting for price to start selling off back to 16000",
  },
  {
    id: 2,
    tag: "Finstruments",
    symbol: "ES",
    createdAt: "2023-12-28T20:35:00Z",
    entryText:
      "Current price 4835. Price is overextended. Waiting for an entry after price sells of below 4800.",
  },
  {
    id: 3,
    tag: "Trade Plans",
    symbol: "ES",
    createdAt: "2023-12-28T13:47:00Z",
    entryText:
      "Entry price 4830. Exit price 4820. Stop loss 4835. Reward Risk 2:1",
  },
  {
    id: 4,
    tag: "Milestones",
    symbol: null,
    createdAt: "2023-12-28T13:07:00Z",
    entryText:
      "I've learned that it's all up to God: our successes, our failures, etc. It's up to us to do our part and learn the lessons God wants to teach us according to God's Plan.",
  },
];

export default function TradingJournal() {
  const [activeFilterIds, setActiveFilterIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFormName, setCurrentFormName] = useState("");
  const [journalEntries, setJournalEntries] = useState([]);
  const [journalItems, setJournalItems] = useState(null);
  const [currentJournalEntry, setCurrentJournalEntry] = useState(null);
  const [isSideViewExpanded, setSideViewExpanded] = useState(true);
  const [searchString, setSearchString] = useState("");
  const [debouncedSearchString, setDebouncedSearchString] = useState("");
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const {
    journalTags,
    createJournalEntry,
    fetchJournalEntries,
    fetchJournalItems,
    updateJournalEntry,
    deleteJournalEntry,
  } = useJournal();

  const { fetchPlatformAccounts } = usePlatformAccounts();

  const { fetchTradeHistory } = useTrades();

  function updateFilterIds({ id, isActive }) {
    console.log("updateFilterIds", id, isActive);
    let newFilterIds = null;
    if (isActive) {
        newFilterIds = [...activeFilterIds, id];
    } else {
        const idx = activeFilterIds.findIndex(val => val === id);
        newFilterIds = [...activeFilterIds.slice(0,idx), ...activeFilterIds.slice(idx + 1)];
    }
    console.log("newFilterIds",newFilterIds);
    setActiveFilterIds(newFilterIds);
  }

  function handleSideViewToggle(isExpanded) {
    setSideViewExpanded(isExpanded);
  }

  async function handleSubmit(formData) {
    console.log("formData", formData);
    let data = { ...formData };

    if (currentFormName === "Trade Plans") {
      const {
        catalystLabel,
        catalystSentimentType,
        catalystURL,
        catalystDescription,
        isAdvancedExit,
        confirmation1Id,
        confirmation1,
        confirmation2Id,
        confirmation2,
        confirmation3Id,
        confirmation3,
        ...tradePlanFields
      } = data;
      data = {
        ...tradePlanFields,
        securitySymbol: data.securitySymbol.label,
        setup: data.setup.label,
        tradeDirectionType: data.tradeDirectionType.label,
        planType: isAdvancedExit ? "Advanced" : "Simple",
      };

      if (catalystLabel) {
        data.newsCatalyst = {
          tradePlanId: currentJournalEntry.tradePlan.id,
          label: catalystLabel.label,
          sentimentType: catalystSentimentType,
          url: catalystURL,
          newsText: catalystDescription,
        };
      }

      if (confirmation1 || confirmation2 || confirmation3) {
        const confirmations = [];

        if (confirmation1) {
          const confirmationObj1 = { confirmationText: confirmation1.label };

          if (confirmation1Id) {
            confirmationObj1.id = confirmation1Id;
          }
          confirmations.push(confirmationObj1);
        }

        if (confirmation2) {
          const confirmationObj2 = { confirmationText: confirmation2.label };

          if (confirmation2Id) {
            confirmationObj2.id = confirmation2Id;
          }
          confirmations.push(confirmationObj2);
        }

        if (confirmation3) {
          const confirmationObj3 = { confirmationText: confirmation3.label };

          if (confirmation3Id) {
            confirmationObj3.id = confirmation3Id;
          }
          confirmations.push(confirmationObj3);
        }

        data.confirmations = confirmations;
        console.log("confirmations", confirmations);
      }
    }

    if (currentFormName === "Finstruments") {
      const { securitySymbol, ...finstrumentFields } = data;
      data = {
        ...finstrumentFields,
        securitySymbol: securitySymbol.label,
      };
    }

    try {
      console.log("data", data);
      let resp = null;
      if (currentJournalEntry) {
        resp = await updateJournalEntry(currentJournalEntry.id, data);
        if (!resp?.error) {
          const idx = journalEntries.findIndex(
            ({ id }) => id === resp.journalEntry.id
          );
          const updatedJournalEntries = [
            resp.journalEntry,
            ...journalEntries.slice(0, idx),
            ...journalEntries.slice(idx + 1),
          ];
          setJournalEntries(updatedJournalEntries);
          setCurrentJournalEntry(resp.journalEntry);
        }
      } else {
        const tagId = journalTags.find(
          ({ label }) => label === currentFormName
        ).value;
        resp = await createJournalEntry({ ...data, tagId });

        if (!resp?.error) {
          journalEntries.unshift(resp.journalEntry);
          setCurrentFormName("");
          setCurrentJournalEntry(null);
        }
      }
      console.log("journalEntry", resp);
      // toast/alert that journal entry was created or an error happened
    } catch (e) {
      // show error
      console.error(e);
    }
  }

  async function handleDelete() {
    try {
      const idx = journalEntries.findIndex(
        ({ id }) => id === currentJournalEntry.id
      );
      const resp = await deleteJournalEntry(currentJournalEntry.id);
      console.log("delete resp", resp);
      if (resp.deleted) {
        const updatedJournalEntries = [
          ...journalEntries.slice(0, idx),
          ...journalEntries.slice(idx + 1),
        ];
        setCurrentFormName("");
        setCurrentJournalEntry(null);
        setJournalEntries(updatedJournalEntries);
        // show delete alert/toast
      }
    } catch (e) {
      // show error alert/toast
    }
  }

  function handleJournalEntryClick(journalEntryId) {
    const journalEntry = journalEntries.find(({ id }) => id === journalEntryId);
    const tag = journalTags.find(
      ({ value }) => value === journalEntry.journalTagId
    ).label;

    setCurrentJournalEntry(journalEntry);
    setCurrentFormName(tag);
    router.push(router.pathname, `${router.pathname}?id=${journalEntryId}`, { shallow: true });
  }

  async function loadJournalEntries() {
    try {
      const resp = await fetchJournalEntries();
      console.log("journalEntries resp", resp);
      setJournalEntries(resp.journalEntries);
      setLoading(false);
    } catch (e) {
      console.error(e); // show error/alert
    }
  }

  async function loadJournalItems() {
    try {
      const journalItemsResp = await fetchJournalItems();
      const platformAccountsResp = await fetchPlatformAccounts();
      const tradeHistoryResp = await fetchTradeHistory({ platformAccountsOnly: true, includeTradePlans: true });
      setJournalItems({ ...journalItemsResp.journalItems, ...platformAccountsResp, ...tradeHistoryResp });
      setLoading(false);
    } catch (e) {
      console.error(e); // show error/alert
    }
  }

  useEffect(() => {
    // read journalEntries, map them to include entryText, tag, etc.  and store in state
    loadJournalEntries();
    loadJournalItems();
  }, []);

  useEffect(() => {
    const { id } = router.query;
    if (journalEntries?.length && journalItems && !currentJournalEntry && id) {
        const journalEntry = journalEntries.find(({id: journalId}) => journalId === parseInt(id));
        const tag = journalTags.find(
          ({ value }) => value === journalEntry.journalTagId
        ).label;

        if (journalEntry) {
          setCurrentJournalEntry(journalEntry);
          setCurrentFormName(tag);
        }
    }
  }, [journalEntries, journalItems]);

  useEffect(() => {
    const delayInputTimeoutId = setTimeout(() => {
      setDebouncedSearchString(searchString);
    }, 500);
    return () => clearTimeout(delayInputTimeoutId);
  }, [searchString, 500]);

  const CurrentForm = currentFormName ? formMap[currentFormName] : null;

  console.log("journalEntries", journalEntries);

  let journalEntrySummaries = journalEntries.map((entry) => {
    const { id, journalTagId, updatedAt } = entry;
    console.log("journalTagId", journalTagId)
    const tag = journalTags.find(({ value }) => value === journalTagId).label;
    const summary = { id, journalTagId, tag, updatedAt };

    switch (journalTagId) {
      case 1:
        summary.symbol = entry.tradePlan.securitySymbol;
        summary.entryText = entry.tradePlan.hypothesis;
        break;
      case 2:
        summary.entryText = entry.milestone.milestoneText;
        break;
      case 3:
        summary.entryText = entry.improvementArea.action;
        break;
      case 4:
        summary.symbol = entry.finstrument.securitySymbol;
        summary.entryText = entry.finstrument.observations;
        break;
      case 5:
        summary.entryText = entry.reflection.thoughts;
        break;
    }
    return summary;
  });

  console.log("activeFilterIds", activeFilterIds);

  if (activeFilterIds.length) {
    journalEntrySummaries = journalEntrySummaries.filter(({ journalTagId }) => activeFilterIds.includes(journalTagId));
  }

  if (debouncedSearchString) {
    console.log("debouncedSearchString", debouncedSearchString);
    journalEntrySummaries = journalEntrySummaries.filter(({ symbol, entryText }) => entryText.toLowerCase().includes(debouncedSearchString.toLowerCase()) || (symbol && debouncedSearchString.includes(symbol)));
  }

  console.log("journalEntrySummaries", journalEntrySummaries);

  return (
    <Layout>
      <div className="h-full">
        <div className="pt-4 h-full flex pb-4">
          <SideView
            className="bg-white"
            header="Journal Entries"
            onToggle={handleSideViewToggle}
          >
            <SearchBox className="w-full" placeholder="Search symbol or text"  onSearch={setSearchString} />
            <div className="flex mt-4 w-full flex-wrap">
              {journalTags.map(({ label, value }) => (
                <Pill
                  className="m-0.5"
                  key={value}
                  id={value}
                  onClick={updateFilterIds}
                >
                  {label}
                </Pill>
              ))}
            </div>
            <div className="mt-4 mb-8 overflow-auto px-2">
              {loading && (<Loader />)}
              {!journalEntries.length && !searchString && (
                <div>
                  <p>No journal entries yet...</p>{" "}
                  <button
                    className="rounded-md bg-purple-800 text-white p-2 mx-auto w-full"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Create New Journal Entry
                  </button>
                </div>
              )}
              {!journalEntrySummaries.length && searchString && (
                <div>
                  <p>No search results</p>
                </div>
              )}
              {journalEntrySummaries.map(
                ({ id, tag, symbol, updatedAt, entryText }) => (
                  <div>
                    <JournalEntry
                      id={id}
                      tag={tag}
                      symbol={symbol}
                      isActive={id === currentJournalEntry?.id}
                      date={formatJournalDate(updatedAt)}
                      entryText={entryText}
                      onClick={handleJournalEntryClick}
                    />
                    <hr className="w-full border-t border-gray-300 mx-auto mt-0" />{" "}
                  </div>
                )
              )}
            </div>
          </SideView>
          <div
            className={`ml-5 ${
              isSideViewExpanded ? "w-2/3" : "w-11/12"
            } h-full flex flex-col border-x border-y border-gray-300 bg-white pb-4`}
          >
            <div className="text-center">
              <div className="pt-2 text-center relative">
                {currentFormName && (
                  <FontAwesomeIcon
                    className="cursor-pointer absolute left-4 h-6"
                    onClick={() => {
                      setCurrentFormName("");
                      setCurrentJournalEntry(null);
                    }}
                    icon={faArrowLeft}
                    height={32}
                  />
                )}
                <h2 className="mb-0 text-2xl self-center">Trading Journal</h2>
              </div>
              <hr className="w-[90%] border-t border-gray-300 mx-auto" />
            </div>
            <div className="w-full h-full">
              {!CurrentForm && (
                <div className="flex flex-col">
                  <button
                    className="rounded-md bg-purple-800 text-white p-2 mx-auto"
                    onClick={() => setIsModalOpen(true)}
                    disabled={!!currentFormName}
                  >
                    Create New Journal Entry
                  </button>
                  <img className="mx-auto" src="/images/stock-market.jpg" />
                </div>
              )}
              {CurrentForm && (
                <CurrentForm
                  data={currentJournalEntry}
                  items={journalItems}
                  onSubmit={handleSubmit}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </div>
        </div>
        <JournalEntryModal
          tags={journalTags}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={({ label }) => {
            if (label) {
              setCurrentFormName(label);
              setIsModalOpen(false);
            }
          }}
        />
      </div>
    </Layout>
  );
}
