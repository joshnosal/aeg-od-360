import type { Metadata } from "next";
import connectMongoose from '@/database/connection';

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default async function DoctorsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connectMongoose()
  
  
  return (
    <>
    {children}
    </>
  )
}
