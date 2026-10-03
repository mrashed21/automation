import { RegisterForm } from "@/features/auth/components/register-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create an account on the AI Content Automation Platform",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
