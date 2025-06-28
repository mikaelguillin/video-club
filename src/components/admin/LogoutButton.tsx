"use client";
import { signOut } from "next-auth/react";
import { Button } from "@chakra-ui/react";

export default function LogoutButton() {
  return (
    <Button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      colorScheme="red"
      variant="outline"
      size="sm"
    >
      Sign Out
    </Button>
  );
}
