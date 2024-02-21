import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import DatePicker from "react-datepicker";
import BaseForm from "./base-form";
import Pill from "../pill";
import Tooltip from "../tooltip";

export default function Milestone({ data, onSubmit, onDelete }) {
  const validationSchema = Yup.object().shape({
    growthTypeId: Yup.number()
      .transform((value) => (Number.isNaN(value) ? null : value))
      .required("Type required"),
    milestoneText: Yup.string().required("Milestone is required"),
  });

  const formOptions = {
    defaultValues: {
      growthTypeId: data?.milestone.growthTypeId,
      reachedOn: data?.milestone.reachedOn ? new Date(data?.milestone.reachedOn) : null,
      milestoneText: data?.milestone.milestoneText,
    },
    resolver: yupResolver(validationSchema),
  };

  const { register, handleSubmit, formState, setValue, watch, reset } =
    useForm(formOptions);
  const { errors } = formState;

  const growthTypeId = watch("growthTypeId");
  const reachedOn = watch("reachedOn");

  function handlePillClick({ id }) {
    setValue("growthTypeId", id);
  }

  useEffect(() => {
    reset(formOptions.defaultValues);
  }, [data]);

  return (
    <BaseForm
      header="Milestone"
      edit={!!data}
      date={data.updatedAt}
      onSave={handleSubmit(onSubmit)}
      onDelete={onDelete}
    >
      <div>
        <label className="text-sm ml">Type*</label>
        <div className="flex">
          <Pill
            className="mr-2"
            key={1}
            id={1}
            controlled
            onClick={handlePillClick}
            isActive={growthTypeId === 1}
          >
            Earnings
          </Pill>
          <Pill
            className="mr-2"
            key={2}
            id={2}
            controlled
            onClick={handlePillClick}
            isActive={growthTypeId === 2}
          >
            Habits
          </Pill>
          <Pill
            className="mr-2"
            key={3}
            id={3}
            controlled
            onClick={handlePillClick}
            isActive={growthTypeId === 3}
          >
            Skillz
          </Pill>
          <Pill
            className="mr-2"
            key={4}
            id={4}
            controlled
            onClick={handlePillClick}
            isActive={growthTypeId === 4}
          >
            Knowledge
          </Pill>
        </div>
        <div className="text-red-600 text-xs">
          {errors.growthTypeId?.message}
        </div>
      </div>
      <div className="mt-4">
        <label className="text-sm ml">Date Reached</label>
        <div className="flex items-center">
          <DatePicker
            className="border rounded-md text-sm p-2"
            selected={reachedOn}
            onChange={(date) => {
              const now = new Date();
              date.setHours(now.getHours());
              date.setMinutes(now.getMinutes());
              setValue("reachedOn", date);
            }}
          />
          <Tooltip text="(Keep blank until completed)" />
        </div>
        <div className="text-red-600 text-xs">{errors.reachedOn?.message}</div>
      </div>

      <div className="mt-4">
        <label className="text-sm ml">Milestone*</label>
        <div className="flex items-top">
          <textarea
            className="border w-full rounded-md p-2"
            {...register("milestoneText")}
          />
          <Tooltip text="Celebrate and keep track of achievements throughout your trading/investing journey!" />
        </div>
        <div className="text-red-600 text-xs">{errors.milestoneText?.message}</div>
      </div>
    </BaseForm>
  );
}
