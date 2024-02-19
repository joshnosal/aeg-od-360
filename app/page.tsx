
import React from 'react';
import DashboardDisplay from './display';
import Doctor from '@/database/models/doctor';
import connectMongoose from '@/database/connection';

export default async function Home() {
  let docs = await Doctor.find().sort({createdAt: -1})
  if(!Array.isArray(docs)) docs = []


  return (
    <DashboardDisplay doctors={JSON.parse(JSON.stringify(docs))}/>
  );
}
