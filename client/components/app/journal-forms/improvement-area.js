import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import DatePicker from "react-datepicker";
import BaseForm from "./base-form";
import Pill from "../pill";
import Tooltip from "../tooltip";

export default function ImprovementArea({ data, onSubmit, onDelete }) {
  const validationSchema = Yup.object().shape({
    growthTypeId: Yup.number()
      .transform((value) => (Number.isNaN(value) ? null : value))
      .required("Type required"),
    action: Yup.string().required("Action is required"),
    expectedResult: Yup.string().required("Expected result is required"),
    startDate: Yup.date().required("Start date is required"),
  });

  const formOptions = {
    defaultValues: {
      growthTypeId: data?.improvementArea.growthTypeId,
      action: data?.improvementArea.action,
      expectedResult: data?.improvementArea.expectedResult,
      actualResult: data?.improvementArea.actualResult,
      startDate: data?.improvementArea.startDate ? new Date(data?.improvementArea.startDate) : null,
      endDate: data?.improvementArea.endDate ? new Date(data?.improvementArea.endDate) : null,
    },
    resolver: yupResolver(validationSchema),
  };

  const { register, handleSubmit, formState, setValue, watch, reset } =
    useForm(formOptions);
  const { errors } = formState;

  const growthTypeId = watch("growthTypeId");
  const startDate = watch("startDate");
  const endDate = watch("endDate");

  function handlePillClick({ id }) {
    setValue("growthTypeId", id);
  }

  useEffect(() => {
    reset(formOptions.defaultValues);
  }, [data]);

  return (
    <BaseForm
      header="Improvement Area"
      date={data?.updatedAt}
      edit={!!data}
      onSave={handleSubmit(onSubmit)}
      onDelete={onDelete}
    >
      <div>
        <label className="text-sm ml">Type*</label>
        <div className="flex">
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
        <label className="text-sm ml">Action*</label>
        <div className="flex items-top">
          <textarea
            className="border w-full rounded-md p-2"
            {...register("action")}
          />
          <Tooltip text="Becoming a consistently profitable trader or investor is all about taking action toward self-improvement!" />
        </div>
        <div className="text-red-600 text-xs">
          {errors.action?.message}
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm ml">Expected Result*</label>
        <div className="flex items-top">
          <textarea
            className="border w-full rounded-md p-2"
            {...register("expectedResult")}
          />
          <Tooltip text="Writing what you expect the outcome to be from taking action will keep you on track" />
        </div>
        <div className="text-red-600 text-xs">
          {errors.expectedResult?.message}
        </div>
      </div>

      {data && (
        <div className="mt-4">
          <label className="text-sm ml">Actual Result</label>
          <div className="flex items-top">
            <textarea
              className="border w-full rounded-md p-2"
              {...register("actualResult")}
            />
            <Tooltip text="What actually happened. Did the action help you improve or not? It's okay if it didn't. Trying matters. What's important is that you learn over time what actions yield the most results for you" />
          </div>
        </div>
      )}

      <div className="mt-4">
        <label className="text-sm ml">Start Date*</label>
        <div>
          <DatePicker
            className="border rounded-md p-2"
            selected={startDate}
            onChange={(date) => {
                const now = new Date();
                date.setHours(now.getHours());
                date.setMinutes(now.getMinutes());
                setValue("startDate", date);
              }}
          />
        </div>
        <div className="text-red-600 text-xs">
          {errors.startDate?.message}
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm ml">End Date</label>
        <div>
          <DatePicker
            className="border rounded-md p-2"
            selected={endDate}
            onChange={(date) => {
                const now = new Date();
                date.setHours(now.getHours());
                date.setMinutes(now.getMinutes());
                setValue("endDate", date);
              }}
          />
        </div>
      </div>
    </BaseForm>
  );
}
