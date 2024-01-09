import React, { useState } from "react";
import DatePicker from "react-datepicker";
import BaseForm from "./base-form";
import Pill from "../pill";
import Tooltip from "../tooltip";


export default function ImprovementArea({ id, onSubmit }) {
  const [milestoneTypeId, setMilestoneTypeId] = useState(2);
  const [achievedOn, setAchievedOn] = useState(null);
  const [milestone, setMilestone] = useState("");


  function handlePillClick({id}) {
    setMilestoneTypeId(id);
  }

  return (
    <BaseForm header="Improvement Area">
      <div>
        <label className="text-sm ml">Type*</label>
        <div className="flex">
            <Pill className="mr-2" key={2} id={2} controlled onClick={handlePillClick} isActive={milestoneTypeId === 2} >Habits</Pill>
            <Pill className="mr-2" key={3} id={3} controlled onClick={handlePillClick} isActive={milestoneTypeId === 3} >Skillz</Pill>
            <Pill className="mr-2" key={4} id={4} controlled onClick={handlePillClick} isActive={milestoneTypeId === 4} >Knowledge</Pill>
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm ml">Action*</label>
        <div className="flex items-top">
          <textarea className="border w-full rounded-md p-2" value={milestone} onChange={(e) => setMilestone(e.target.value)} />
          <Tooltip text="Becoming a consistently profitable trader or investor is all about taking action toward self-improvement!" />
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm ml">Expected Result*</label>
        <div className="flex items-top">
          <textarea className="border w-full rounded-md p-2" value={milestone} onChange={(e) => setMilestone(e.target.value)} />
          <Tooltip text="Writing what you expect the outcome to be from taking action will keep you on track" />
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm ml">Start Date*</label>
        <div>
        <DatePicker className="border rounded-md" selected={achievedOn} onChange={(date) => setAchievedOn(date)} />
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm ml">End Date</label>
        <div>
        <DatePicker className="border rounded-md" selected={achievedOn} onChange={(date) => setAchievedOn(date)} />
        </div>
      </div>

    </BaseForm>
  );
}
