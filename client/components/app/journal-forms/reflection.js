import React, { useState } from "react";
import BaseForm from "./base-form";
import Pill from "../pill";


export default function Reflection({ id, onSubmit }) {
  const [reflectTimeframeId, setReflectTimeframeId] = useState(1);
  const [moodTypeId, setMoodTypeId] = useState(1);
  const [energyTypeId, setEnergyTypeId] = useState(1);
  const [thoughts, setThoughts] = useState("");


  function handleTimePillClick({id}) {
    setReflectTimeframeId(id);
  }

  function handleMoodPillClick({id}) {
    setMoodTypeId(id);
  }

  function handleEnergyPillClick({id}) {
    setEnergyTypeId(id);
  }

  return (
    <BaseForm header="Reflection">
      <div>
        <label className="text-sm ml">Timeframe*</label>
        <div className="flex flex-wrap">
            <Pill className="mr-2 mb-2" key={1} id={1} controlled onClick={handleTimePillClick} isActive={reflectTimeframeId === 1} >Daily</Pill>
            <Pill className="mr-2 mb-2" key={2} id={2} controlled onClick={handleTimePillClick} isActive={reflectTimeframeId === 2} >Weekly</Pill>
            <Pill className="mr-2 mb-2" key={3} id={3} controlled onClick={handleTimePillClick} isActive={reflectTimeframeId === 3} >Monthly</Pill>
            <Pill className="mr-2 mb-2" key={4} id={4} controlled onClick={handleTimePillClick} isActive={reflectTimeframeId === 4} >Yearly</Pill>
        </div>
      </div>

      <div>
        <label className="text-sm ml">Mood*</label>
        <div className="flex flex-wrap">
            <Pill className="mr-2 mb-2" key={1} id={1} controlled onClick={handleMoodPillClick} isActive={moodTypeId === 1} >Okay</Pill>
            <Pill className="mr-2 mb-2" key={2} id={2} controlled onClick={handleMoodPillClick} isActive={moodTypeId === 2} >Good</Pill>
            <Pill className="mr-2 mb-2" key={3} id={3} controlled onClick={handleMoodPillClick} isActive={moodTypeId === 3} >Bad</Pill>
        </div>
      </div>

      <div>
        <label className="text-sm ml">Energy*</label>
        <div className="flex flex-wrap">
            <Pill className="mr-2 mb-2" key={1} id={1} controlled onClick={handleEnergyPillClick} isActive={energyTypeId === 1} >Neutral</Pill>
            <Pill className="mr-2 mb-2" key={2} id={2} controlled onClick={handleEnergyPillClick} isActive={energyTypeId === 2} >High</Pill>
            <Pill className="mr-2 mb-2" key={3} id={3} controlled onClick={handleEnergyPillClick} isActive={energyTypeId === 3} >Low</Pill>
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm ml">Thoughts*</label>
        <div className="flex items-top">
          <textarea className="border w-full rounded-md p-2" value={thoughts} onChange={(e) => setThoughts(e.target.value)} />
        </div>
      </div>

    </BaseForm>
  );
}
