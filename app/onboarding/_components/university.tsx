"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const UniversityConfiguration = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data: any) => {
    console.log(data); // Replace with API call or state update
    router.push("/onboarding?step=select&type=systems");
  };

  return (
    <section className="container mx-auto z-10">
      <motion.div
        className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-2xl font-bold mb-6 text-center">
          Configure Your University Details
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="name">
              University Name
            </label>
            <input
              type="text"
              id="name"
              className="w-full border border-gray-300 rounded-lg p-3"
              {...register("name", { required: "University name is required" })}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message as string}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          <div>
            <label
              className="block text-sm font-medium mb-2"
              htmlFor="location"
            >
              University Location
            </label>
            <input
              type="text"
              id="location"
              className="w-full border border-gray-300 rounded-lg p-3"
              {...register("location", {
                required: "University location is required",
              })}
            />
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">
                {errors.location.message as string}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="type">
              University Type
            </label>
            <select
              id="type"
              className="w-full border border-gray-300 rounded-lg p-3"
              {...register("type", { required: "University type is required" })}
            >
              <option value="">Select Type</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="semi-private">Semi-Private</option>
            </select>
            {errors.type && (
              <p className="text-red-500 text-sm mt-1">{errors.type.message as string}</p>
            )}
          </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="students">
              Estimated Number of Students
            </label>
            <input
              type="number"
              id="students"
              className="w-full border border-gray-300 rounded-lg p-3"
              {...register("students", {
                required: "Number of students is required",
                min: { value: 1, message: "Must be at least 1" },
              })}
            />
            {errors.students && (
              <p className="text-red-500 text-sm mt-1">
                {errors.students.message as string}
              </p>
            )}
          </div>

          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Button type="submit" className="w-full">
              Save and Continue
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </section>
  );
};

export default UniversityConfiguration;
