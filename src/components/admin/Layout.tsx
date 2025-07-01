import Link from "next/link";
import { Heading, Stack, Box } from "@chakra-ui/react";
import LogoutButton from "./LogoutButton";
import { Toaster } from "@/components/ui/toaster";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
        <Box as="header" background="blue.800" color="white" p={5}>
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
            >
                <Heading as="h1" size="3xl">
                    <Link href="/admin">Admin Dashboard</Link>
                </Heading>
                <LogoutButton />
            </Stack>
        </Box>
        <Box as="main" p={5}>
            {children}
        </Box>
        <Toaster />
    </>
  );
}