"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useApp } from "@/components/AppProvider";
import { AuthForm } from "@/components/AuthForm";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const { user } = useApp();
  const router = useRouter();
  const { t } = useTranslation();
  useEffect(() => { if (user) router.replace("/settings"); }, [user, router]);
  return <>
    <Link href="/" className="back-link">{t("guest.continue")}</Link>
    {auth ? <AuthForm /> : <p role="alert">{t("guest.authUnavailable")}</p>}
  </>;
}
