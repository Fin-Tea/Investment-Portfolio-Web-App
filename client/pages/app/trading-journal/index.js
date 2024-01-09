import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import Layout from "../../../components/app/layout";
import SideView from "../../../components/app/side-view";
import SearchBox from "../../../components/app/search-box";
import Pill from "../../../components/app/pill";
import JournalEntry from "../../../components/app/journal-entry";
import JournalEntryModal from "../../../components/app/journal-entry-modal";
import TradePlan from "../../../components/app/journal-forms/trade-plan";
import Milestone from "../../../components/app/journal-forms/milestone";
import ImprovementArea from "../../../components/app/journal-forms/improvement-area";
import { formatJournalDate } from "../../../date-utils";



const filterPills = [
    { label: "Trade Plans", value: 1},
    { label: "Milestones", value: 2},
    { label: "Improvement Areas", value: 3},
    { label: "Finstruments", value: 4},
    { label: "Reflections", value: 5},
    { label: "News", value: 6},   
]

const formMap = {
    "Trade Plans": TradePlan,
    "Milestones": Milestone,
    "Improvement Areas": ImprovementArea
}

const journalEntryFixtures = [
    { id: 1, tag: "Finstruments", symbol: "NQ", createdAt: "2023-12-28T20:37:00Z", entryText: "The NQ is still overextended at 17000+. Waiting for price to start selling off back to 16000"},
    { id: 2, tag: "Finstruments", symbol: "ES", createdAt: "2023-12-28T20:35:00Z", entryText: "Current price 4835. Price is overextended. Waiting for an entry after price sells of below 4800."},
    { id: 3, tag: "Trade Plans", symbol: "ES", createdAt: "2023-12-28T13:47:00Z", entryText: "Entry price 4830. Exit price 4820. Stop loss 4835. Reward Risk 2:1"},
    { id: 4, tag: "Milestones", symbol: null, createdAt: "2023-12-28T13:07:00Z", entryText: "I've learned that it's all up to God: our successes, our failures, etc. It's up to us to do our part and learn the lessons God wants to teach us according to God's Plan."},
]

export default function TradingJournal() {
    const [activeFilterIds, setActiveFilterIds] = useState(new Set());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentFormName, setCurrentFormName] = useState("");

    function updateFilterIds({ id, isActive }) {
        if (isActive) {
            activeFilterIds.add(id);
        } else {
            activeFilterIds.delete(id)
        }
        setActiveFilterIds(activeFilterIds);
    } 

    const CurrentForm = currentFormName ? formMap[currentFormName] : null;

    return <Layout>
    <div className="h-full" >
        <div className="pt-4 h-full flex">
        <SideView className="bg-white" header="Journal Entries">
            <SearchBox />
            <div className="flex mt-4 w-full flex-wrap">
                {filterPills.map(({ label, value }) => (<Pill className="m-0.5" key={value} id={value} onClick={updateFilterIds} >{label}</Pill>))}
            </div>
            <div className="mt-4 max-h-60 overflow-scroll px-2">
                {journalEntryFixtures.map(({id, tag, symbol, createdAt, entryText }) => (<div><JournalEntry id={id} tag={tag} symbol={symbol} date={formatJournalDate(createdAt)} entryText={entryText} /><hr className="w-full border-t border-gray-300 mx-auto mt-0" /> </div>))}
            </div>
        </SideView>
        <div className="ml-5 w-2/3 h-full flex flex-col border-x border-y border-gray-300 bg-white pb-4">
            <div className="text-center">
                <div className="pt-2 text-center relative">
                {currentFormName && <FontAwesomeIcon className="cursor-pointer absolute ml-4" onClick={() => setCurrentFormName("")} icon={faArrowLeft} height={32} />}
                <h2 className="mb-0 text-2xl self-center">Trading Journal</h2>
                </div>
                <hr className="w-[90%] border-t border-gray-300 mx-auto" />
            </div>
            <div className="w-full h-full">
                {!CurrentForm && (<div className="flex"><button className="rounded-md bg-purple-800 text-white p-2 mx-auto" onClick={() => setIsModalOpen(true)}>Create New Journal Entry</button></div>)}
                {CurrentForm && <CurrentForm />}
            </div>
        </div>
        </div>
        <JournalEntryModal tags={filterPills} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={({ label }) => { console.log(label); if (label) { setCurrentFormName(label); setIsModalOpen(false);}}} />
    </div>
    </Layout>
}