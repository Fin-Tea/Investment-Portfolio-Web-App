import React, { useState, useEffect } from "react";
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
import { formatJournalDate } from "../../../date-utils";

const filterPills = [
  { label: "Trade Plans", value: 1 },
  { label: "Milestones", value: 2 },
  { label: "Improvement Areas", value: 3 },
  { label: "Finstruments", value: 4 },
  { label: "Reflections", value: 5 },
];

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
  const [activeFilterIds, setActiveFilterIds] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFormName, setCurrentFormName] = useState("");
  const [journalEntries, setJournalEntries] = useState([]);
  const [currentJournalEntry, setCurrentJournalEntry] = useState(null);
  const [isSideViewExpanded, setSideViewExpanded] = useState(true);

  const {
    createJournalEntry,
    fetchJournalEntries,
    updateJournalEntry,
    deleteJournalEntry,
  } = useJournal();

  function updateFilterIds({ id, isActive }) {
    if (isActive) {
      activeFilterIds.add(id);
    } else {
      activeFilterIds.delete(id);
    }
    setActiveFilterIds(activeFilterIds);
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
        }
      } else {
        resp = await createJournalEntry(data);

        if (!resp?.error) {
          journalEntries.unshift(resp.journalEntry);
          setCurrentFormName("");
          setCurrentJournalEntry(null);
        }
      }
      console.log("journalEntry", resp);
      // add journalEntry to list of journalEntries
      // close form (set current form name to "")
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
    const tag = filterPills.find(
      ({ value }) => value === journalEntry.journalTagId
    ).label;

    setCurrentJournalEntry(journalEntry);
    setCurrentFormName(tag);
  }

  async function loadJournalEntries() {
    try {
      const resp = await fetchJournalEntries();
      console.log("journalEntries resp", resp);
      setJournalEntries(resp.journalEntries);
    } catch (e) {
      console.error(e); // show error/alert
    }
  }

  useEffect(() => {
    // read journalEntries, map them to include entryText, tag, etc.  and store in state
    loadJournalEntries();
  }, []);

  const CurrentForm = currentFormName ? formMap[currentFormName] : null;

  const journalEntrySummaries = journalEntries.map((entry) => {
    const { id, journalTagId, updatedAt } = entry;
    const tag = filterPills.find(({ value }) => value === journalTagId).label;
    const summary = { id, tag, updatedAt };

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

  return (
    <Layout>
      <div className="h-full">
        <div className="pt-4 h-full flex">
          <SideView
            className="bg-white"
            header="Journal Entries"
            onToggle={handleSideViewToggle}
          >
            <SearchBox />
            <div className="flex mt-4 w-full flex-wrap">
              {filterPills.map(({ label, value }) => (
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
            <div className="mt-4 max-h-60 overflow-auto px-2">
              {!journalEntrySummaries.length && (
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
              {journalEntrySummaries.map(
                ({ id, tag, symbol, updatedAt, entryText }) => (
                  <div>
                    <JournalEntry
                      id={id}
                      tag={tag}
                      symbol={symbol}
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
                    className="cursor-pointer absolute ml-4"
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
                  onSubmit={handleSubmit}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </div>
        </div>
        <JournalEntryModal
          tags={filterPills}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={({ label }) => {
            console.log(label);
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
