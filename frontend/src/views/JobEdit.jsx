"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/api/axios";
import Spinner from "@/components/Spinner";
import JobForm from "@/components/JobForm";

export default function JobEdit() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  useEffect(() => { api.get(`/jobs/${id}`).then(({ data }) => setJob(data)); }, [id]);
  if (!job) return <Spinner label="Loading job..." />;
  return <JobForm job={job} />;
}
